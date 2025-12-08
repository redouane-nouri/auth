import axios from "axios";

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_URL}${process.env.AXIOS_BASEPATH}`,
  headers: {
    "Content-Type": "application/json",
  },
});
