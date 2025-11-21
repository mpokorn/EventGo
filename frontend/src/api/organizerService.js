import api from "./api";

export const organizerService = {
  getEvents() {
    return api.get("/organizer/events");
  },
  getDashboardStats() {
    return api.get("/organizer/stats");
  }
};
