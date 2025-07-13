import { NextResponse } from 'next/server';
import { createConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await createConnection();
    
    const [rows] = await connection.execute(`
      SELECT 
        course_number,
        COUNT(*) as delivery_count,
        SUM(sales) as total_sales
      FROM delivery_points
      GROUP BY course_number
      ORDER BY course_number
    `);
    
    await connection.end();
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}