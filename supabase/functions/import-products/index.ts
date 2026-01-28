import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProductRow {
  name: string;
  description?: string;
  purchase_price: number;
  price: number;
  producer_id: string;
  category_id: string;
  image_url?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !claims?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', claims.user.id)
      .single();

    if (profile?.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get form data with file
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const producerId = formData.get('producer_id') as string;
    const categoryId = formData.get('category_id') as string;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!producerId || !categoryId) {
      return new Response(
        JSON.stringify({ error: 'producer_id and category_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
    console.log(`Producer ID: ${producerId}, Category ID: ${categoryId}`);

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    
    // Parse Excel file
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON - get raw values
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    console.log(`Found ${jsonData.length} rows in Excel file`);

    // Skip header row, process data rows
    const products: ProductRow[] = [];
    const errors: string[] = [];
    
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // Skip empty rows
      if (!row || !row[0]) continue;
      
      // Column mapping based on user's Excel structure:
      // A (0) = Nazwa produktu
      // B (1) = Opis
      // F (5) = Cena brutto (purchase_price - cena zakupu)
      // H (7) = Domyślna cena brutto (price - cena sprzedaży)
      // I (8) = URL obrazka
      
      const name = String(row[0] || '').trim();
      const description = row[1] ? String(row[1]).trim() : undefined;
      const purchasePriceRaw = row[5];
      const priceRaw = row[7];
      const imageUrl = row[8] ? String(row[8]).trim() : undefined;
      
      if (!name) {
        errors.push(`Row ${i + 1}: Missing product name`);
        continue;
      }
      
      // Parse prices - handle both number and string formats
      const purchasePrice = parsePrice(purchasePriceRaw);
      const price = parsePrice(priceRaw);
      
      if (isNaN(purchasePrice) || purchasePrice <= 0) {
        errors.push(`Row ${i + 1} (${name}): Invalid purchase price: ${purchasePriceRaw}`);
        continue;
      }
      
      if (isNaN(price) || price <= 0) {
        errors.push(`Row ${i + 1} (${name}): Invalid price: ${priceRaw}`);
        continue;
      }
      
      products.push({
        name,
        description,
        purchase_price: purchasePrice,
        price,
        producer_id: producerId,
        category_id: categoryId,
        image_url: imageUrl || undefined,
      });
    }

    console.log(`Parsed ${products.length} valid products, ${errors.length} errors`);

    if (products.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No valid products found in file',
          errors: errors.slice(0, 20) // Return first 20 errors
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert products in batches
    const batchSize = 50;
    let insertedCount = 0;
    const insertErrors: string[] = [];

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      const { data: inserted, error: insertError } = await supabase
        .from('products')
        .insert(batch.map(p => ({
          name: p.name,
          description: p.description,
          purchase_price: p.purchase_price,
          price: p.price,
          producer_id: p.producer_id,
          category_id: p.category_id,
          image_url: p.image_url,
          active: true
        })))
        .select('id');
      
      if (insertError) {
        console.error(`Batch insert error:`, insertError);
        insertErrors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${insertError.message}`);
      } else {
        insertedCount += inserted?.length || 0;
      }
    }

    console.log(`Successfully inserted ${insertedCount} products`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted: insertedCount,
        total_parsed: products.length,
        parse_errors: errors.length,
        insert_errors: insertErrors.length,
        sample_errors: [...errors.slice(0, 5), ...insertErrors.slice(0, 5)]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parsePrice(value: any): number {
  if (typeof value === 'number') {
    return Math.round(value * 100) / 100;
  }
  if (typeof value === 'string') {
    // Remove currency symbols, spaces, and convert comma to dot
    const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    return Math.round(parseFloat(cleaned) * 100) / 100;
  }
  return NaN;
}
