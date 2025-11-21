// src/api/transactionService.js
import api from "./api";

export const transactionService = {
  // GET /transactions
  getAll() {
    return api.get("/transactions");
  },

  // GET /transactions/user/:id
  getByUser(userId) {
    return api.get(`/transactions/user/${userId}`);
  },

  // GET /transactions/:id
  getOne(id) {
    return api.get(`/transactions/${id}`);
  },

  // POST /transactions
  create(data) {
    return api.post("/transactions", data);
  },

  // DELETE /transactions/:id
  delete(id) {
    return api.delete(`/transactions/${id}`);
  },
};
