import Axios from "axios";
const axiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api",
  headers: { "Cache-Control": "no-store", Pragma: "no-cache" },
  withCredentials: true,
});

export default axiosInstance;
