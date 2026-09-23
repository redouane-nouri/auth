import axios from "axios";
import {
  getNextPublicAxiosBasepathFromEnv,
  getNextPublicUrlFromEnv,
} from "@/utils/functions";

export const api = axios.create({
  baseURL: `${getNextPublicUrlFromEnv()}${getNextPublicAxiosBasepathFromEnv()}`,
  headers: {
    "Content-Type": "application/json",
  },
});
