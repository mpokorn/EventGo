export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
  created_at: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  total_tickets: number;
  tickets_sold: number;
  organizer_id: number;
  organizer_name?: string;
  image_url?: string;
  created_at: string;
}

export interface TicketType {
  id: number;
  event_id: number;
  type: string;
  price: number;
  total_tickets: number;
  tickets_sold: number;
}

export interface Ticket {
  id: number;
  user_id: number;
  event_id: number;
  transaction_id: number;
  status: 'active' | 'reserved' | 'pending_return' | 'refunded';
  ticket_type: string;
  ticket_price: number;
  issued_at: string;
  start_datetime?: string;
  end_datetime?: string;
  event_name?: string;
  location?: string;
  buyer_name?: string;
  owner_id?: number;
  owner_name?: string;
  ticket_type_id?: number;
}

export interface Transaction {
  id: number;
  buyer_id: number;
  buyer_name: string;
  total_price: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  payment_method: string;
  reference_code?: string;
  created_at: string;
  quantity: number;
  event_title?: string;
  ticket_type?: string;
}

export interface WaitlistEntry {
  id: number;
  user_id: number;
  event_id: number;
  position?: number;
  joined_at?: string;
  event_name?: string;
  start_datetime?: string;
  end_datetime?: string;
  user_name?: string;
  user_email?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  refreshToken: string;
  user: User;
}

export interface ApiError {
  message: string;
  error?: string;
}
