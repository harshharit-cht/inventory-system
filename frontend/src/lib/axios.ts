import axios from "axios"
import { toast } from "sonner"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error("Something went wrong !")
    } else if (error.response.status === 500) {
      toast.error("Server error — please try again")
    }
    return Promise.reject(error)
  }
)

export default api