import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KRSData {
  name?: string;
  nip?: string;
  regon?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  province?: string;
}

function validateNIP(nip: string): boolean {
  const cleanNip = nip.replace(/[\s-]/g, '');
  
  if (!/^\d{10}$/.test(cleanNip)) {
    return false;
  }

  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanNip[i]) * weights[i];
  }
  
  const checksum = sum % 11;
  
  if (checksum === 10) {
    return false;
  }
  
  const controlDigit = parseInt(cleanNip[9]);
  return checksum === controlDigit;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nip } = await req.json();

    if (!nip || !/^\d{10}$/.test(nip)) {
      return new Response(
        JSON.stringify({ error: "Nieprawidłowy format NIP (wymagane 10 cyfr)" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate NIP checksum
    if (!validateNIP(nip)) {
      return new Response(
        JSON.stringify({ error: "Nieprawidłowa suma kontrolna NIP" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching data for NIP:', nip);

    // Try CEIDG API first (for businesses)
    const ceidgResponse = await fetch(
      `https://dane.biznes.gov.pl/api/ceidg/v1/firmy?nip=${nip}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (ceidgResponse.ok) {
      const ceidgData = await ceidgResponse.json();
      console.log('CEIDG Response:', JSON.stringify(ceidgData));

      if (ceidgData && ceidgData.firma && ceidgData.firma.length > 0) {
        const firma = ceidgData.firma[0];
        const result: KRSData = {
          name: firma.nazwa || undefined,
          nip: firma.nip || nip,
          regon: firma.regon || undefined,
          address: firma.adres?.ulica 
            ? `${firma.adres.ulica} ${firma.adres.nrNieruchomosci || ''}${firma.adres.nrLokalu ? `/${firma.adres.nrLokalu}` : ''}`
            : undefined,
          city: firma.adres?.miejscowosc || undefined,
          postal_code: firma.adres?.kodPocztowy || undefined,
          province: firma.adres?.wojewodztwo || undefined,
        };

        console.log('Parsed CEIDG data:', result);

        return new Response(
          JSON.stringify({ success: true, data: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Try KRS API (for foundations, associations, companies)
    const krsResponse = await fetch(
      `https://api-krs.ms.gov.pl/api/krs/OdpisAktualny/${nip}?rejestr=P&format=json`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (krsResponse.ok) {
      const krsData = await krsResponse.json();
      console.log('KRS Response:', JSON.stringify(krsData));

      if (krsData && krsData.odpis) {
        const dane = krsData.odpis.dane;
        const dzial1 = dane?.dzial1;
        const siedziba = dzial1?.siedziba;
        const adres = siedziba?.adres;

        const result: KRSData = {
          name: dzial1?.danePodmiotu?.nazwa || undefined,
          nip: dzial1?.danePodmiotu?.identyfikatory?.nip || nip,
          regon: dzial1?.danePodmiotu?.identyfikatory?.regon || undefined,
          address: adres?.ulica 
            ? `${adres.ulica} ${adres.nrDomu || ''}${adres.nrLokalu ? `/${adres.nrLokalu}` : ''}`
            : undefined,
          city: adres?.miejscowosc || undefined,
          postal_code: adres?.kodPocztowy || undefined,
          province: adres?.wojewodztwo || undefined,
        };

        console.log('Parsed KRS data:', result);

        return new Response(
          JSON.stringify({ success: true, data: result }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // If no data found in either API
    return new Response(
      JSON.stringify({ 
        error: "Nie znaleziono danych dla podanego NIP. Sprawdź poprawność numeru." 
      }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-krs-data:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Błąd podczas pobierania danych" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
