import axios from "axios";
import { getApiBaseURL } from "../config/api.config";

// Base Axios instance avec configuration centralisée
const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Add bearer token if it exists in localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/*************************
 * INTERVENTIONS ENDPOINTS
 *************************/
const interventionRequestsAPI = {
  /* CRUD */
  getAll: () => apiClient.get("/demandes/recuperer/all").then((r) => r.data),
  get: (id) => apiClient.get(`/demandes/recuperer/${id}`).then((r) => r.data),
  create: (body) => apiClient.post("/demandes/create", body).then((r) => r.data),
  update: (id, body) => apiClient.put(`/demandes/update/${id}`, body).then((r) => r.data),
  delete: (id) => apiClient.delete(`/demandes/delete/${id}`).then((r) => r.data),

  /* Chef Secteur */
  getForChefSecteur: () => apiClient.get("/demandes/chef-secteur").then((r) => r.data),
  valider: (id, chefSecteurId, commentaire) =>
    apiClient
      .put(`/demandes/${id}/valider`, { chefSecteurId, commentaire })
      .then((r) => r.data),
  rejeter: (id, chefSecteurId, commentaire) =>
    apiClient
      .put(`/demandes/${id}/rejeter`, { chefSecteurId, commentaire })
      .then((r) => r.data),
  assigner: (id, technicienId) =>
    apiClient.put(`/demandes/${id}/assigner`, { technicienId }).then((r) => r.data),

  /* Technicien */
  getByTechnicienAssigne: (technicienId) =>
    apiClient.get(`/demandes/technicien/${technicienId}`).then((r) => r.data),
  confirmer: (id, technicienId, commentaire) =>
    apiClient
      .put(`/demandes/${id}/confirmer`, { technicienId, commentaire })
      .then((r) => r.data),
  refuser: (id, technicienId, commentaire) =>
    apiClient
      .put(`/demandes/${id}/refuser`, { technicienId, commentaire })
      .then((r) => r.data),
  marquerBonTravailCree: (id) =>
    apiClient.put(`/demandes/${id}/bon-travail-cree`).then((r) => r.data),

  /* Créateur */
  getByCreateur: (createurId) =>
    apiClient.get(`/demandes/createur/${createurId}`).then((r) => r.data),
};

/**********************
 * UTILISATEURS
 **********************/
const usersAPI = {
  getAll: () => apiClient.get("/user/all").then((r) => r.data),
};

/**********************
 * TESTEURS / EQUIPEMENTS
 **********************/
const testeursAPI = {
  getAll: () => apiClient.get("/pi/testeurs/all").then((r) => r.data),
};

/**********************
 * PLANNING
 **********************/
const planningAPI = {
  create: (payload) => apiClient.post("/planning/create", payload).then((r) => r.data),
};

export { interventionRequestsAPI, usersAPI, testeursAPI, planningAPI };
