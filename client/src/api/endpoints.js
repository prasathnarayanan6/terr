import { apiClient } from "./client";

export const loginRequest = (payload) =>
  apiClient.post("/auth/login", payload);

export const fetchDashboardOverview = (apartmentId) =>
  apiClient.get("/dashboard/overview", {
    params: { apartment_id: apartmentId },
  });

export const fetchReportsOverview = (apartmentId) =>
  apiClient.get("/reports/overview", {
    params: { apartment_id: apartmentId },
  });

export const fetchFlatReport = (apartmentId, flatId) =>
  apiClient.get(`/reports/flats/${flatId}`, {
    params: { apartment_id: apartmentId },
  });

export const fetchLeakSummary = (apartmentId) =>
  apiClient.get("/leaks/summary", {
    params: { apartment_id: apartmentId },
  });

export const fetchBillingSummary = (apartmentId) =>
  apiClient.get("/billing/summary", {
    params: { apartment_id: apartmentId },
  });

export const fetchProfile = (userMail) =>
  apiClient.get("/profile", {
    params: { user_mail: userMail },
  });

export const sendFlatBill = (flatId, cycleId) =>
  apiClient.post(`/bills/send/${flatId}`, { cycleId });

export const sendBulkBills = (cycleId, concurrency = 5) =>
  apiClient.post("/bills/send-bulk", { cycleId, concurrency });

export const getBillJobStatus = (jobId) =>
  apiClient.get(`/bills/status/${jobId}`);

export const fetchPrepaidOverview = (zoneId) =>
  apiClient.get("/prepaid/overview", { params: { zone_id: zoneId } });

export const fetchPrepaidHouse = (zoneId, houseId) =>
  apiClient.get(`/prepaid/house/${houseId}`, { params: { zone_id: zoneId } });

export const prepaidRechargeHouse = (zoneId, houseId, amount) =>
  apiClient.post("/prepaid/recharge", { zone_id: zoneId, house_id: houseId, amount });

export const prepaidSetValve = (zoneId, houseId, action) =>
  apiClient.post("/prepaid/valve", { zone_id: zoneId, house_id: houseId, action });
