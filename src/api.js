import axios from "axios";

const api = axios.create({
  baseURL: "https://rincian-backend.fastapicloud.dev",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;