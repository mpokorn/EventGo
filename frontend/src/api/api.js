import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // your Express backend URL
});

export default api;
