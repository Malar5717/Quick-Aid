import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api"
});

export { api };

export const loginHospital = (data) => {
  return api.post("/login", data);
};

export const updateHospitalProfile = (hospitalId, data) => {
  return api.put(`/hospital/${hospitalId}/profile`, data);
};

export const getHospitals = () => {
  return api.get("/hospitals");
};

export const getHospitalById = (hospitalId) => {
  return api.get(`/hospital/${hospitalId}`);
};

export const addStaff = (hospitalId, data) => {
  return api.post(`/hospital/${hospitalId}/staff`, data);
}

export const removeStaff = (hospitalId, staffCode) => {
  return api.delete(`/hospital/${hospitalId}/staff/${staffCode}`);
}

export const recommendHospitals = (data) => {
  return api.post("/recommend", data);
};

export const updateHospitalStatus = (data) => {
  return api.post("/hospital/status", data);
};

export const getHospitalLogs = (hospitalId) => {
  return api.get(`/hospital/${hospitalId}/logs`);
};
