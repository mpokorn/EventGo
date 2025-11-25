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
  available_tickets: number;
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
  title?: string;
  location?: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  event_id: number;
  amount: number;
  transaction_type: 'purchase' | 'refund' | 'refund_fee';
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  event_title?: string;
  ticket_type_name?: string;
}

export interface WaitlistEntry {
  id: number;
  user_id: number;
  event_id: number;
  ticket_type_id: number;
  ticket_type_name?: string;
  position?: number;
  status: 'waiting' | 'offered' | 'accepted' | 'expired';
  created_at: string;
  event_title?: string;
  event_start?: string;
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
