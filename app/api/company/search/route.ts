/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  // Vyhledávání pouze podle IČO
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  // Nepodporujeme vyhledávání podle názvu firmy
  // Pokud by někdo poslal parametr type=name, ignorujeme ho

  try {
    // Mock data pro testování
    if (query === '27273838') {
      const mockCompany = {
        results: [{
          ico: '27273838',
          name: 'Test Company s.r.o.',
          address: 'Testovací 123/45',
          city: 'Praha',
          zip: '12000',
          dic: 'CZ27273838',
          legalForm: 'Společnost s ručením omezeným',
        }]
      };
      return NextResponse.json(mockCompany);
    }

    // Očekáváme pouze IČO
    const url = `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${query}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ARES API Error:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch company data: ${response.statusText}` },
        { status: response.status }
      );
    }

    const company = await response.json();
    const sidlo = company.sidlo || {};

    const street = sidlo.nazevUlice || '';
    const houseNumber = sidlo.cisloDomovni || '';
    const orientation = sidlo.cisloOrientacni ? `/${sidlo.cisloOrientacni}` : '';
    const city = sidlo.nazevObce || '';
    const zip = sidlo.psc || '';
    const fullAddress = (street && houseNumber)
      ? `${street} ${houseNumber}${orientation}`
      : sidlo.textovaAdresa || '';

    const results = [{
      ico: company.ico || '',
      name: company.obchodniJmeno || '',
      address: fullAddress,
      city: city,
      zip: zip,
      dic: company.dic || '',
      legalForm: company.pravniForma?.nazev || '',
    }];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error fetching company data:', error);
    return NextResponse.json({ error: 'Failed to fetch company data' }, { status: 500 });
  }
}
