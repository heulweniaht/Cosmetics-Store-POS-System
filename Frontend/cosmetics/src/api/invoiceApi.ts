import axios from "axios";
import type { Order } from "../types/order.ts";
import type { Result } from "../types/result.ts";
import { API_URL } from "../constants/apiConstants.ts";

const API_INVOICE = "/invoices"; 

export const invoiceApi = {
  // Hàm cho Admin
  getAllInvoicesForAdmin: async (): Promise<Result<Order[]>> => {
    const response = await axios.get<Result<Order[]>>(`${API_URL}${API_INVOICE}/admin/all`);
    return response.data;
  },

  // Hàm cho User
  getMyOrderHistory: async (): Promise<Result<Order[]>> => {
    const response = await axios.get<Result<Order[]>>(`${API_URL}${API_INVOICE}/my-history`);
    return response.data;
  },

  getById: async (id: string): Promise<Result<Order>> => {
    const response = await axios.get<Result<Order>>(`${API_URL}${API_INVOICE}/${id}`);
    return response.data;
  },
};