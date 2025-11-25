import api from './api';
import { Ticket, Transaction, WaitlistEntry } from '../types';

export const userService = {
  getProfile: async (userId: number) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (
    data: {
      first_name?: string;
      last_name?: string;
      email?: string;
      password?: string;
    }
  ) => {
    // The API will use the authenticated user's ID from the token
    const response = await api.put(`/users/me`, data);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete(`/users/me`);
    return response.data;
  },

  getTickets: async () => {
    const response = await api.get<{ tickets: Ticket[] }>(`/tickets/user/me`);
    return response.data.tickets;
  },

  getWaitlist: async () => {
    const response = await api.get<{ waitlist: WaitlistEntry[] }>(
      `/waitlist/user/me`
    );
    return response.data.waitlist;
  },

  getTransactions: async () => {
    const response = await api.get<{ transactions: Transaction[] }>(
      `/transactions/user/me`
    );
    return response.data.transactions;
  },

  getUserEvents: async () => {
    const response = await api.get(`/events/user/me`);
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
