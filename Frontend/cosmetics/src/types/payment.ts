import type { PaymentMethod } from "../constants/paymentConstants.ts";

export interface Payment {
    orderInfo: string;
    amount: number;
    method: PaymentMethod;
}

export interface MomoPaymentRequest {
    orderId: number;   // 👈 ADD
    orderInfo: string;
    amount: number;
}

export interface PaymentResponse {
    payUrl?: string;
}

export interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderTotal: number;
    orderCode: string;
    onPaymentSuccess: (paymentMethod?: PaymentMethod, transferAmount?: number) => Promise<number | undefined>;  // 👈 Return orderId
}