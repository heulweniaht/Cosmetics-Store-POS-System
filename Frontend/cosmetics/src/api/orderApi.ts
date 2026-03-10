import axios from "axios";
import type { Order, OrderSubmitData } from "../types/order";
import type { Result } from "../types/result.ts";
import { API_URL, API_ORDER } from "../constants/apiConstants.ts";

export const orderApi = {

  submitOrder: async (orderData: OrderSubmitData): Promise<Result<Order>> => {
    const response = await axios.post<Result<Order>>(API_URL + API_ORDER, orderData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  getAllOrders: async (): Promise<Result<Order[]>> => {
    const response = await axios.get<Result<Order[]>>(API_URL + API_ORDER);
    return response.data;
  },

  getById: async (id: string): Promise<Result<Order>> => {
    const response = await axios.get<Result<Order>>(`${API_URL}${API_ORDER}/${id}`);
    return response.data;
  },

  updateOrderStatus: async (orderId: string | number, status: string): Promise<Result<Order>> => {
    const response = await axios.put<Result<Order>>(
        `${API_URL}${API_ORDER}/${orderId}`,
        { id: Number(orderId), status },
        { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  },

  updateOrder: async (orderId: string | number, orderData: OrderSubmitData): Promise<Result<Order>> => {
    const response = await axios.put<Result<Order>>(
        `${API_URL}${API_ORDER}/${orderId}`,
        orderData,
        { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  },

  deleteOrder: async (orderId: string): Promise<Result<null>> => {
    try {
      await axios.delete(`${API_URL}${API_ORDER}/${orderId}`);
      // Backend trả về 204 No Content, không có body
      return {
        status: true,
        message: [{
          code: "SUCCESS",
          message: "Đơn hàng đã được xóa thành công"
        }],
        data: null
      };
    } catch (error: any) {
      throw error;
    }
  },

  cancelOrder: async (orderId: string | number): Promise<Result<Order>> => {
    const response = await axios.put<Result<Order>>(
        `${API_URL}${API_ORDER}/${orderId}/cancel`,
        {},
        { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  },
};
