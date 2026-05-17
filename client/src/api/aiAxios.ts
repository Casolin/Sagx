import axios from "axios";

const aiApi = axios.create({
  baseURL: import.meta.env.AI_URL,
});

export default aiApi;
