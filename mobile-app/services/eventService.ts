import api from './api';
import { Event, TicketType } from '../types';

export const eventService = {
  getEvents: async (params?: { search?: string; location?: string }) => {
    const response = await api.get<{ events: Event[] }>('/events', { params });
    return response.data.events;
  },

  getEvent: async (id: number) => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  getTicketTypes: async (eventId: number) => {
    try {
      const response = await api.get<TicketType[]>(
        `/ticket-types/${eventId}`
      );
      return response.data;
    } catch (error: any) {
      // If 404, no ticket types defined - return empty array
      if (error?.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  purchaseTicket: async (data: {
    event_id: number;
    ticket_type_id: number;
    quantity: number;
    payment_method?: string;
  }) => {
    const response = await api.post('/tickets', data);
    return response.data;
  },

  joinWaitlist: async (user_id: number, event_id: number) => {
    const response = await api.post('/waitlist', { user_id, event_id });
    return response.data;
  },
};
