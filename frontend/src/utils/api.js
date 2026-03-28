import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-redirect on 401
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register:        (data) => API.post("/api/auth/register/",         data),
  login:           (data) => API.post("/api/auth/login/",            data),
  metamaskLogin:   (data) => API.post("/api/auth/metamask-login/",   data),
  forgotPassword:  (data) => API.post("/api/auth/forgot-password/",  data),
  resetPassword:   (data) => API.post("/api/auth/reset-password/",   data),
  studentRegister: (data) => API.post("/api/auth/student-register/", data),
  studentLogin:    (data) => API.post("/api/auth/student-login/",    data),
  me:              ()     => API.get("/api/auth/me/"),
};

// ── Certificates ──────────────────────────────────────────────
export const certAPI = {
  issue:   (data) => API.post("/api/certificates/issue/",          data),
  list:    ()     => API.get("/api/certificates/"),
  myCerts: ()     => API.get("/api/certificates/my/"),
  verify:  (hash) => API.get(`/api/certificates/verify/${hash}/`),
  revoke:  (hash) => API.post(`/api/certificates/revoke/${hash}/`),
};

// ── Helper exports ────────────────────────────────────────────
export const studentLogin    = (email, password) => authAPI.studentLogin({ email, password });
export const studentRegister = (username, email, password) => authAPI.studentRegister({ username, email, password });

export default API;