import axios, { AxiosError } from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


const handleError = (error: any) => {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError;
    console.error("[API Error]", {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      url: err.config?.url,
    });
    throw err.response?.data || { error: err.message };
  } else {
    console.error("[API Unknown Error]", error);
    throw { error: "Unknown error occurred" };
  }
};


export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  try {
    const res = await API.post("/auth/register", userData);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const loginUser = async (credentials: { email: string; password: string }) => {
  try {
    const res = await API.post("/auth/login", credentials);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await API.get("/auth/me");
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};


export const getUserById = async (userId: number) => {
  try {
    const res = await API.get(`/users/${userId}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};


export const getWalletByUserId = async (userId: number) => {
  try {
    const res = await API.get(`/wallets/user/${userId}`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const createWallet = async (userId: number, balance = 0) => {
  try {
    const res = await API.post("/wallets", { userId, balance });
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updateWalletBalance = async (walletId: number, balance: number) => {
  try {
    const res = await API.put(`/wallets/${walletId}`, { balance });
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};


export const getTransactions = async (walletId: number) => {
  try {
    const res = await API.get(`/wallets/${walletId}/transactions`);
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export const createTransaction = async (walletId: number, amount: number, type: string) => {
  try {
    const res = await API.post(`/wallets/${walletId}/${type.toLowerCase()}`, { amount });
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};


export const getExpenses = async (walletId?: number) => {
  try {
    const res = await API.get("/expenses");
    if (walletId != null) {
      return res.data.filter((e: any) => e.walletId === walletId);
    }
    return res.data;
  } catch (error) {
    return handleError(error);
  }
};

export default API;
