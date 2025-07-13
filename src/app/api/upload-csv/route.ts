import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/db';
import { DeliveryPoint } from '@/types/delivery';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length <= 1) {
      return NextResponse.json({ error: 'CSV file is empty or has only headers' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['course_number', 'customer_name', 'customer_code', 'address', 'sales'];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required headers: ${missingHeaders.join(', ')}` 
      }, { status: 400 });
    }

    const connection = await createConnection();
    
    try {
      await connection.beginTransaction();
      
      await connection.query('TRUNCATE TABLE delivery_points');
      
      const deliveryPoints: DeliveryPoint[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const record: any = {};
        
        headers.forEach((header, index) => {
          record[header] = values[index] || '';
        });
        
        deliveryPoints.push({
          course_number: record.course_number,
          customer_name: record.customer_name,
          customer_code: record.customer_code,
          address: record.address,
          sales: parseFloat(record.sales) || 0,
        });
      }
      
      for (const point of deliveryPoints) {
        await connection.execute(
          'INSERT INTO delivery_points (course_number, customer_name, customer_code, address, sales) VALUES (?, ?, ?, ?, ?)',
          [point.course_number, point.customer_name, point.customer_code, point.address, point.sales]
        );
      }
      
      await connection.commit();
      
      return NextResponse.json({ 
        message: 'CSV uploaded successfully', 
        count: deliveryPoints.length 
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('CSV upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload CSV' },
      { status: 500 }
    );
  }
}