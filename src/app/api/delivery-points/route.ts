import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/db';

export async function GET() {
  try {
    const connection = await createConnection();
    
    const [rows] = await connection.execute(
      'SELECT * FROM delivery_points ORDER BY course_number, id'
    );
    
    await connection.end();
    
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching delivery points:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery points' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, course_number } = await request.json();
    
    if (!id || !course_number) {
      return NextResponse.json(
        { error: 'ID and course_number are required' },
        { status: 400 }
      );
    }
    
    const connection = await createConnection();
    
    await connection.execute(
      'UPDATE delivery_points SET course_number = ? WHERE id = ?',
      [course_number, id]
    );
    
    await connection.end();
    
    return NextResponse.json({ message: 'Course number updated successfully' });
  } catch (error) {
    console.error('Error updating course number:', error);
    return NextResponse.json(
      { error: 'Failed to update course number' },
      { status: 500 }
    );
  }
}