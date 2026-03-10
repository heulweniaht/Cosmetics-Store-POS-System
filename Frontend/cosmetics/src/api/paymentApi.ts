import axios from "axios";
import axiosClient from "./axiosClient";
import type { MomoPaymentRequest } from "../types/payment";
import {API_URL, API_MOMO} from "../constants/apiConstants.ts";

const API_VNPAY = "/vnpay-payment";

export const createMomoPayment = async (momoPaymentRequest: MomoPaymentRequest): Promise<void> => {
    const { data } = await axios.post(API_URL + API_MOMO, momoPaymentRequest);

    if (data?.payUrl) window.location.href = data.payUrl;
    else console.error("Không tìm thấy payUrl trong phản hồi:", data);
};

export const createVNPayPayment = async (paymentRequest: MomoPaymentRequest): Promise<void> => {
    // Sửa: Dùng axiosClient thay vì axios thường để gửi kèm Token
    const { data } = await axiosClient.post(API_VNPAY, paymentRequest);
    if (data?.payUrl) window.location.href = data.payUrl;
    else console.error("Lỗi: Không có payUrl");
};

// --- THÊM HÀM NÀY ---
// Hàm gửi query params về backend để xác thực
export const verifyVNPayPayment = async (params: any): Promise<any> => {
    // Gọi API vừa tạo ở Bước 2
    return await axiosClient.get(`${API_VNPAY}/vnpay-payment-return`, { params });
};