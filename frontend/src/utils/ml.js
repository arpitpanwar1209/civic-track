import api from "./axios";

export const predictCategory = (description) =>
  api.post("/reports/predict-category/", { description });
