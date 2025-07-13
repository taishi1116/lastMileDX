import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/db';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const params = new URLSearchParams({
      q: address,
      format: 'json',
      limit: '1',
      'accept-language': 'ja'
    });

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'User-Agent': 'DeliveryRouteApp/1.0'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function POST() {
  try {
    const connection = await createConnection();
    
    const [rows] = await connection.execute(
      'SELECT id, address FROM delivery_points WHERE latitude IS NULL OR longitude IS NULL'
    ) as any;

    let updated = 0;
    
    for (const row of rows) {
      const coords = await geocodeAddress(row.address);
      
      if (coords) {
        await connection.execute(
          'UPDATE delivery_points SET latitude = ?, longitude = ? WHERE id = ?',
          [coords.lat, coords.lon, row.id]
        );
        updated++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await connection.end();
    
    return NextResponse.json({
      message: 'Geocoding completed',
      total: rows.length,
      updated
    });
    
  } catch (error) {
    console.error('Geocoding process error:', error);
    return NextResponse.json(
      { error: 'Failed to geocode addresses' },
      { status: 500 }
    );
  }
}