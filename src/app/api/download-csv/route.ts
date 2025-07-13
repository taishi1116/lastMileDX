import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseNumber = searchParams.get('course');
    
    const connection = await createConnection();
    
    let query = 'SELECT course_number, customer_name, customer_code, address, sales FROM delivery_points';
    const params: any[] = [];
    
    if (courseNumber) {
      query += ' WHERE course_number = ?';
      params.push(courseNumber);
    }
    
    query += ' ORDER BY course_number, id';
    
    const [rows] = await connection.execute(query, params) as any;
    
    await connection.end();
    
    const headers = ['course_number', 'customer_name', 'customer_code', 'address', 'sales'];
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => 
        headers.map(header => {
          const value = row[header];
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    const response = new NextResponse(csvContent);
    const fileName = courseNumber ? `course_${courseNumber}_data.csv` : 'all_delivery_data.csv';
    
    response.headers.set('Content-Type', 'text/csv; charset=utf-8');
    response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    
    return response;
  } catch (error) {
    console.error('CSV download error:', error);
    return NextResponse.json(
      { error: 'Failed to download CSV' },
      { status: 500 }
    );
  }
}