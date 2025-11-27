import api from './api';
import { Ticket, Transaction, WaitlistEntry } from '../types';

export const userService = {
  getProfile: async (userId: number) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (
    userId: number,
    data: {
      first_name?: string;
      last_name?: string;
      email?: string;
      password?: string;
    }
  ) => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  deleteAccount: async (userId: number) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  getTickets: async (userId: number) => {
    const response = await api.get<{ tickets: Ticket[] }>(`/tickets/user/${userId}`);
    return response.data.tickets;
  },

  getEventTickets: async (userId: number, eventId: number) => {
    const response = await api.get<{ event: any; tickets: Ticket[] }>(
      `/tickets/user/${userId}/event/${eventId}`
    );
    return response.data;
  },

  getWaitlist: async (userId: number) => {
    const response = await api.get<{ waitlist: WaitlistEntry[] }>(
      `/waitlist/user/${userId}`
    );
    return response.data.waitlist;
  },

  getTransactions: async (userId: number) => {
    const response = await api.get<{ transactions: Transaction[] }>(
      `/transactions/user/${userId}`
    );
    return response.data.transactions;
  },

  getUserEvents: async (userId: number) => {
    const response = await api.get(`/events/organizer/${userId}`);
    return response.data;
  },

  refundTicket: async (ticketId: number) => {
    const response = await api.put(`/tickets/${ticketId}/refund`);
    return response.data;
  },

  acceptWaitlistTicket: async (ticketId: number) => {
    const response = await api.post(`/tickets/${ticketId}/accept`);
    return response.data;
  },

  declineWaitlistTicket: async (ticketId: number) => {
    const response = await api.post(`/tickets/${ticketId}/decline`);
    return response.data;
  },

  leaveWaitlist: async (waitlistId: number) => {
    const response = await api.delete(`/waitlist/${waitlistId}`);
    return response.data;
  },

  acceptTicket: async (transactionId: number) => {
    const response = await api.post(`/waitlist/accept-ticket/${transactionId}`);
    return response.data;
  },

  declineTicket: async (transactionId: number) => {
    const response = await api.post(`/waitlist/decline-ticket/${transactionId}`);
    return response.data;
  },
};
