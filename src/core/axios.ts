import axios from "axios";
import { config } from "../../config";

export const server = axios.create({
    baseURL: config.URL
})