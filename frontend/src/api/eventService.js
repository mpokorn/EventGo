// src/api/eventService.js
import api from "./api";

export const eventService = {
  getById(id) {
    return api.get(`/events/${id}`);
  },

  getByOrganizer(organizerId) {
    return api.get(`/events/organizer/${organizerId}`);
  },

  create(data) {
    return api.post("/events", data);
  },

  update(id, data) {
    return api.put(`/events/${id}`, data);
  },

  delete(id, organizer_id) {
    return api.delete(`/events/${id}`, {
      data: { organizer_id },
    });
  }
};
