import React, { useState } from 'react';
import { createMomoPayment, createVNPayPayment } from '../../api/paymentApi';
import './PaymentModal.css';
import type { PaymentModalProps, MomoPaymentRequest } from "../../types/payment.ts";
import { paymentMethods } from "../../constants/paymentConstants.ts";
import type { PaymentMethod } from "../../constants/paymentConstants.ts";

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderTotal,
  orderCode,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferAmount, setTransferAmount] = useState<number>(0);

  const handleMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method);
    if (method !== 'tmck') {
      setTransferAmount(0);
    }
  };

 const handlePayment = async () => {
    if (!selectedMethod) return;

    // Kiểm tra số tiền hợp lệ cho TMCK
    if (selectedMethod === 'tmck' && (transferAmount <= 0 || transferAmount >= orderTotal)) {
      alert('Vui lòng nhập số tiền chuyển khoản hợp lệ (lớn hơn 0 và nhỏ hơn tổng tiền)');
      return;
    }
    
    setIsProcessing(true); // Bật loading

    try {
      // Xác định số tiền sẽ chuyển khoản (cho Bước 1)
      let amountToTransfer = 0;
      if (selectedMethod === 'bank' || selectedMethod === 'momo') {
        amountToTransfer = orderTotal;
      } else if (selectedMethod === 'tmck') {
        amountToTransfer = transferAmount;
      }

      // BƯỚC 1: Luôn luôn LƯU ĐƠN HÀNG (gọi handleCheckout) trước
      const orderId = await onPaymentSuccess(selectedMethod, amountToTransfer);

      // BƯỚC 2: Xử lý CỔNG THANH TOÁN (nếu cần)
      
      if (selectedMethod === 'bank') { 
        // Đã lưu (Bước 1). Giờ tạo URL và chuyển hướng.
        if (!orderId) {
          throw new Error('Không có orderId sau khi lưu đơn hàng');
        }
        const paymentRequest: MomoPaymentRequest = {
          orderId: orderId,  // 👈 ADD
          orderInfo: orderCode,
          amount: orderTotal, // Gửi tổng tiền
        };
        await createVNPayPayment(paymentRequest);
        // Giữ loading vì đang chuyển trang
        
      } else if (selectedMethod === 'momo') {
        // Đã lưu (Bước 1). Giờ tạo URL và chuyển hướng.
        if (!orderId) {
          throw new Error('Không có orderId sau khi lưu đơn hàng');
        }
         const paymentRequest: MomoPaymentRequest = {
          orderId: orderId,  // 👈 ADD
          orderInfo: orderCode,
          amount: orderTotal,
        };
        await createMomoPayment(paymentRequest);
        // Giữ loading vì đang chuyển trang

      } else if (selectedMethod === 'tmck') {
        // Đã lưu (Bước 1). Giờ tạo URL (chỉ cho phần CK) và chuyển hướng.
        if (!orderId) {
          throw new Error('Không có orderId sau khi lưu đơn hàng');
        }
        const tmckPaymentRequest: MomoPaymentRequest = {
            orderId: orderId,  // 👈 ADD
            orderInfo: `${orderCode}-CK`,
            amount: transferAmount, // Chỉ gửi số tiền chuyển khoản
        };
        await createVNPayPayment(tmckPaymentRequest);
        // Giữ loading vì đang chuyển trang

      } else {
        // Đây là 'cash' (Tiền mặt)
        // Đã lưu ở Bước 1. Đã hiện alert (từ SalesScreen).
        setIsProcessing(false); // Tắt loading
        onClose(); // Đóng modal
      }
      
    } catch (error) {
      // Lỗi này có thể đến từ (1) lưu đơn hàng, hoặc (2) gọi cổng thanh toán
      console.error('Lỗi xử lý thanh toán:', error);
      alert('Có lỗi xảy ra khi xử lý. Vui lòng thử lại.');
      setIsProcessing(false); // Tắt loading nếu có LỖI
    }
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setTransferAmount(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h3>Chi tiết thanh toán</h3>
          <button className="close-btn" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="payment-modal-body">
          <div className="order-info">
            <div className="order-code">
              <span>Mã đơn hàng: {orderCode}</span>
            </div>
            <div className="order-total">
              <span>Tổng tiền: {orderTotal.toLocaleString()}đ</span>
            </div>
          </div>

          <div className="payment-methods">
            <h4>Chọn phương thức thanh toán:</h4>
            <div className="payment-methods-grid">
              {paymentMethods.map((method) => (
                 <div
                   key={method.id}
                   className={`payment-method ${selectedMethod === method.id ? 'selected' : ''}`}
                   onClick={() => handleMethodChange(method.id)}
                 >
                  <div className="method-icon">
                    <i className={method.icon}></i>
                  </div>
                  <div className="method-info">
                    <h5>{method.name}</h5>
                    <p>{method.description}</p>
                  </div>
                  <div className="method-radio">
                     <input
                       type="radio"
                       name="paymentMethod"
                       value={method.id}
                       checked={selectedMethod === method.id}
                       onChange={() => handleMethodChange(method.id)}
                     />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TMCK Input */}
          {selectedMethod === 'tmck' && (
            <div className="tmck-input-section">
              <h4>Số tiền chuyển khoản:</h4>
              <div className="transfer-amount-input">
                <input
                  type="number"
                  placeholder="Nhập số tiền chuyển khoản"
                  value={transferAmount || ''}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  min="0"
                  max={orderTotal}
                />
                <span className="currency">đ</span>
              </div>
              <div className="amount-breakdown">
                <div className="breakdown-item">
                  <span>Chuyển khoản:</span>
                  <span>{transferAmount.toLocaleString()}đ</span>
                </div>
                <div className="breakdown-item">
                  <span>Tiền mặt:</span>
                  <span>{(orderTotal - transferAmount).toLocaleString()}đ</span>
                </div>
                <div className="breakdown-total">
                  <span>Tổng cộng:</span>
                  <span>{orderTotal.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="payment-modal-footer">
          <button
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Hủy bỏ
          </button>
          <button
            className="btn btn-primary"
            onClick={handlePayment}
            disabled={!selectedMethod || isProcessing}
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Đang xử lý...
              </>
            ) : (
              'Thanh toán'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
