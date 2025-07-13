import { NextRequest, NextResponse } from 'next/server';
import { createConnection } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const { ids, course_number } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !course_number) {
      return NextResponse.json(
        { error: 'IDs array and course_number are required' },
        { status: 400 }
      );
    }
    
    const connection = await createConnection();
    
    const placeholders = ids.map(() => '?').join(',');
    const query = `UPDATE delivery_points SET course_number = ? WHERE id IN (${placeholders})`;
    const params = [course_number, ...ids];
    
    await connection.execute(query, params);
    
    await connection.end();
    
    return NextResponse.json({ 
      message: 'Course numbers updated successfully',
      updated: ids.length 
    });
  } catch (error) {
    console.error('Error batch updating course numbers:', error);
    return NextResponse.json(
      { error: 'Failed to batch update course numbers' },
      { status: 500 }
    );
  }
}