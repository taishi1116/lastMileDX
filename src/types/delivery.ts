export interface DeliveryPoint {
  id?: number;
  course_number: string;
  customer_name: string;
  customer_code: string;
  address: string;
  sales: number;
  latitude?: number;
  longitude?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CourseSummary {
  course_number: string;
  total_sales: number;
  delivery_count: number;
}