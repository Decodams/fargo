export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
}

export interface Service {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  price_min: number;
  price_max: number;
  home_service_eligible: boolean;
  is_active: boolean;
  display_order: number;
  category?: Category | null;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  specialties: string | null;
  is_active: boolean;
  display_order: number;
}

export interface StaffService {
  id: string;
  staff_id: string;
  service_id: string;
}

export interface BusinessHour {
  id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface Setting {
  key: string;
  value: string;
}

export interface Booking {
  id: string;
  reference: string;
  staff_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_mode: 'in_salon' | 'home';
  home_address: string | null;
  scheduled_at: string;
  duration_minutes: number;
  total_price: number;
  payment_status: 'unpaid' | 'paid' | 'failed' | 'refunded';
  payment_reference: string | null;
  payment_amount: number | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  created_at: string;
  updated_at: string;
  staff?: Staff | null;
  booking_services?: BookingService[];
}

export interface BookingService {
  id: string;
  booking_id: string;
  service_id: string | null;
  service_name: string;
  price: number;
  duration_minutes: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  price: number | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
}

export interface Inquiry {
  id: string;
  type: 'general' | 'product' | 'service';
  product_id: string | null;
  product_name: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: 'new' | 'responded' | 'closed';
  response_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  total_bookings: number;
  created_at: string;
  updated_at: string;
}

export type SettingsMap = Record<string, string>;
