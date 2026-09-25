import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";


// Helper to ensure absolute media URLs
const ensureAbsoluteUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/media')) {
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${url}`;
  }
  return url;
};

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authAPI = {
  login: async (credentials) => {
    const response = await api.post("/auth/login/", credentials);
    if (response.data.access) {
      localStorage.setItem("token", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
  },
  me: async () => {
    const response = await api.get("/auth/me/");
    return response.data;
  },
};

export const dataAPI = {
  getStates: async () => {
    const response = await api.get('/states/', { params: { page_size: 500 } });
    return response.data.results || response.data;
  },
  getDistricts: async (stateId) => {
    const response = await api.get('/districts/', { params: { state_id: stateId, page_size: 500 } });
    return response.data.results || response.data;
  },
  getConstituencies: async (districtId) => {
    const response = await api.get('/constituencies/', { params: { district_id: districtId, page_size: 500 } });
    return response.data.results || response.data;
  },
  getMandals: async (districtId, constituencyId) => {
    const params = { page_size: 500 };
    if (districtId) params.district_id = districtId;
    if (constituencyId) params.constituency_id = constituencyId;
    const response = await api.get('/mandals/', { params });
    return response.data.results || response.data;
  },
  getTeamTypes: async () => {
    const response = await api.get("/team-types/", {
      params: { page_size: 500 },
    });
    return response.data.results || response.data;
  },
  getTeams: async (typeId, parentId) => {
    const params = { page_size: 500 };
    if (typeId) params.type = typeId;
    if (parentId) params.parent = parentId;
    const response = await api.get("/teams/", { params });
    return response.data.results || response.data;
  },
  createTeamType: async (data) => {
    const response = await api.post("/team-types/", data);
    return response.data;
  },
  updateTeamType: async (id, data) => {
    const response = await api.put(`/team-types/${id}/`, data);
    return response.data;
  },
  deleteTeamType: async (id) => {
    const response = await api.delete(`/team-types/${id}/`);
    return response.data;
  },
  createTeam: async (data) => {
    const response = await api.post("/teams/", data);
    return response.data;
  },
  updateTeam: async (id, data) => {
    const response = await api.put(`/teams/${id}/`, data);
    return response.data;
  },
  deleteTeam: async (id) => {
    const response = await api.delete(`/teams/${id}/`);
    return response.data;
  },
  getDashboardSummary: async () => {
    const response = await api.get("/dashboard/summary/");
    return response.data;
  },
    getPersons: async (params) => {
    const response = await api.get("/persons/", { params });
    if (response.data?.results) {
      response.data.results.forEach(p => p.photo = ensureAbsoluteUrl(p.photo));
    }
    return response.data;
  },
    getPerson: async (id) => {
    const response = await api.get(`/persons/${id}/`);
    const p = response.data;
    if (p) p.photo = ensureAbsoluteUrl(p.photo);
    return p;
  },
  createPerson: async (data) => {
    const formData = new FormData();
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        // Do not send empty strings for foreign keys
        if ((key === "team" || key === "team_type") && data[key] === "") {
          continue;
        }
        if (key === "photo" && data[key] instanceof File) {
          formData.append(key, data[key]);
        } else if (key !== "photo") {
          formData.append(key, data[key]);
        }
      }
    }
    // DRF parses missing booleans as False for multipart/form-data, force True
    formData.append("is_active", "true");
    const response = await api.post("/persons/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  updatePerson: async (id, data) => {
    const formData = new FormData();
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        // Do not send empty strings for foreign keys
        if ((key === "team" || key === "team_type") && data[key] === "") {
          continue;
        }
        if (
          key === "photo" &&
          (typeof data[key] === "string" || data[key] === null)
        ) {
          continue; // skip sending string URLs or null for photo
        }
        formData.append(key, data[key]);
      }
    }
    const response = await api.patch(`/persons/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  deletePerson: async (id) => {
    const response = await api.delete(`/persons/${id}/`);
    return response.data;
  },
  exportCSV: async (params) => {
    const response = await api.get("/persons/export_csv/", {
      params,
      responseType: "blob",
    });
    return response.data;
  },
  exportPDF: async (params) => {
    const response = await api.get("/persons/export_pdf/", {
      params,
      responseType: "blob",
    });
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get("/users/");
    return response.data;
  },
  createUser: async (data) => {
    const response = await api.post("/users/", data);
    return response.data;
  },
  updateUser: async (id, data) => {
    const response = await api.patch(`/users/${id}/`, data);
    return response.data;
  },
};

export default api;
