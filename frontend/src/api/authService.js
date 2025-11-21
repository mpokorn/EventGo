// src/api/authService.js
import api from "./api";

export const authService = {
  login(email, password) {
    return api.post("/users/login", { email, password });
  },

  register(data) {
    return api.post("/users/register", data);
  },

  organizerLogin(email, password) {
    return api.post("/users/organizer-login", { email, password });
  },

  organizerRegister(data) {
    return api.post("/users/organizer-register", data);
  },
};
