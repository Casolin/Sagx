import axios from "axios";

const aiApi = axios.create({
  baseURL: "http://localhost:10000",
});

export default aiApi;
