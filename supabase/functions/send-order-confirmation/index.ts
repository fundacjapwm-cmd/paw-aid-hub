import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  products: { name: string; price: number };
  animals?: { name: string };
  quantity: number;
  unit_price: number;
}

interface EmailRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  items: OrderItem[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const { orderId, customerEmail, customerName, totalAmount, items }: EmailRequest = await req.json();

    console.log('Sending confirmation email to:', customerEmail);

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          ${item.products.name}${item.animals ? ` (dla ${item.animals.name})` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          ${item.unit_price.toFixed(2)} zł
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          ${(item.unit_price * item.quantity).toFixed(2)} zł
        </td>
      </tr>
    `).join('');

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .receipt { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f5f5f5; padding: 12px; text-align: left; font-weight: bold; }
            .total { font-size: 1.2em; font-weight: bold; color: #667eea; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #667eea; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 0.9em; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Dziękujemy za Twoją darowiznę! ❤️</h1>
              <p>Twoja wpłata została zrealizowana pomyślnie</p>
            </div>
            <div class="content">
              <p>Cześć ${customerName}!</p>
              <p>Twoja darowizna pomaga zwierzętom w potrzebie. Jesteśmy niezmiernie wdzięczni za Twoje wsparcie!</p>
              
              <div class="receipt">
                <h2>Potwierdzenie zamówienia</h2>
                <p><strong>Numer zamówienia:</strong> ${orderId.substring(0, 8).toUpperCase()}</p>
                <p><strong>Data:</strong> ${new Date().toLocaleDateString('pl-PL', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
                
                <h3>Szczegóły zamówienia:</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Produkt</th>
                      <th style="text-align: center;">Ilość</th>
                      <th style="text-align: right;">Cena jedn.</th>
                      <th style="text-align: right;">Razem</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
                
                <div class="total">
                  Suma całkowita: ${totalAmount.toFixed(2)} zł
                </div>
              </div>
              
              <p style="margin-top: 30px;">Produkty zostaną dostarczone do schroniska/organizacji, aby pomóc zwierzętom, które najbardziej tego potrzebują.</p>
              
              <p><strong>Masz pytania?</strong> Skontaktuj się z nami odpowiadając na tego maila.</p>
              
              <p>Jeszcze raz dziękujemy!<br>
              Zespół Platformy Darowizn dla Zwierząt</p>
            </div>
            <div class="footer">
              <p>Ten email został wygenerowany automatycznie po zakończeniu płatności.</p>
              <p>© ${new Date().getFullYear()} Platforma Darowizn dla Zwierząt. Wszelkie prawa zastrzeżone.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: 'Paczki w Maśle <kontakt@paczkiwmasle.pl>',
      to: [customerEmail],
      subject: `Potwierdzenie darowizny - zamówienie ${orderId.substring(0, 8).toUpperCase()}`,
      html: receiptHtml,
    });

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-order-confirmation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});