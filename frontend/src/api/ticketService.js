
import api from "./api";

export const ticketService = {
  getByEvent(eventId) {
    return api.get(`/tickets/event/${eventId}`);
  },

  create(data) {
    return api.post("/ticket-types", data);
  },

  update(id, data) {
    return api.patch(`/ticket-types/${id}`, data);
  },

  delete(id) {
    return api.delete(`/ticket-types/${id}`);
  },
  refund(ticketId){
    return api.put(`/tickets/${ticketId}/refund`);
  },
  organizerRefund(ticketId){
    return api.put(`/tickets/${ticketId}/organizer-refund`);
  }
};
