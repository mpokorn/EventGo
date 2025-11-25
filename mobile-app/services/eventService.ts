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
    const response = await api.get<{ ticketTypes: TicketType[] }>(
      `/ticket-types/${eventId}`
    );
    return response.data.ticketTypes;
  },

  purchaseTicket: async (data: {
    event_id: number;
    ticket_type_id: number;
    quantity: number;
  }) => {
    const response = await api.post('/tickets/purchase', data);
    return response.data;
  },

  joinWaitlist: async (event_id: number) => {
    const response = await api.post('/waitlist', { event_id });
    return response.data;
  },
};
