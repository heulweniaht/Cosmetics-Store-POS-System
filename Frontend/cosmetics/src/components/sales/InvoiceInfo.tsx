import React from 'react';
import type { Order } from '../../types/order';
import { formatPrice, getStatusText, getStatusColor, getPaymentMethodText } from '../../utils/orderUtils';
import './InvoiceInfo.css';

interface InvoiceInfoProps {
  order: Order;
  isOpen: boolean;
  onCreateInvoice: () => void;
  onCancel: () => void;
}

export const InvoiceInfo: React.FC<InvoiceInfoProps> = ({
  order,
  isOpen,
  onCreateInvoice,
  onCancel,
}) => {
  if (!isOpen) return null;

  // Tính toán các giá trị
  const subtotal = order.items?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || 0;
  const discount = order.items?.reduce((sum, item) => sum + (item.subtotal - item.total), 0) || 0;
  const discountedSubtotal = subtotal - discount;
  const vat = Math.round(discountedSubtotal * 0.1);
  const total = discountedSubtotal + vat;

  // Xử lý hiển thị trạng thái động cho Modal
  const getModalStatusBadge = (status: string) => {
    const color = getStatusColor(status);
    const text = status === 'COMPLETED' ? 'Thanh toán thành công' : getStatusText(status);
    
    return (
      <div 
        className="invoice-status-badge" 
        style={{ 
          backgroundColor: color, // Dùng màu từ utils
          color: '#fff'
        }}
      >
        <i className={`fas ${status === 'COMPLETED' ? 'fa-check-circle' : status === 'RETURNED' ? 'fa-undo' : 'fa-info-circle'}`}></i>
        {text}
      </div>
    );
  };

  return (
    <div className="invoice-info-overlay">
      <div className="invoice-info-modal">
        {/* Header với màu nền động theo trạng thái */}
        <div 
            className="invoice-info-header"
            style={{ background: order.status === 'RETURNED' ? '#f59e0b' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          <h2>Thông tin hóa đơn</h2>
          {getModalStatusBadge(order.status)}
        </div>

        <div className="invoice-info-body">
          {/* Thông tin đơn hàng */}
          <div className="invoice-section">
            <h3>Thông tin đơn hàng</h3>
            <div className="invoice-details">
              <div className="detail-row">
                <span className="detail-label">Mã hóa đơn:</span>
                <span className="detail-value">{order.code}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Khách hàng:</span>
                <span className="detail-value">{order.customerName || 'Khách lẻ'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ngày tạo:</span>
                <span className="detail-value">
                  {order.createdDate 
                    ? new Date(order.createdDate).toLocaleString('vi-VN')
                    : new Date().toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phương thức thanh toán:</span>
                <span className="detail-value">{getPaymentMethodText(order.paymentMethod)}</span>
              </div>
              {order.notes && order.notes !== '---' && (
                <div className="detail-row">
                  <span className="detail-label">Ghi chú:</span>
                  <span className="detail-value">{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="invoice-section">
            <h3>Danh sách sản phẩm</h3>
            <div className="invoice-items">
              <div className="invoice-items-header">
                <div className="item-col name">Tên sản phẩm</div>
                <div className="item-col quantity">SL</div>
                <div className="item-col price">Đơn giá</div>
                <div className="item-col discount">Giảm giá</div>
                <div className="item-col total">Thành tiền</div>
              </div>
              <div className="invoice-items-body">
                {order.items?.map((item, index) => (
                  <div key={index} className="invoice-item-row">
                    <div className="item-col name">
                      {item.product?.name || item.productName || 'Sản phẩm không xác định'}
                    </div>
                    <div className="item-col quantity">{item.quantity}</div>
                    <div className="item-col price">
                      {((item.subtotal || 0) / (item.quantity || 1)).toLocaleString('vi-VN')}đ
                    </div>
                    <div className="item-col discount">
                      {/* Tính giảm giá nếu có */}
                      {(item.subtotal - item.total) > 0 
                        ? `-${(item.subtotal - item.total).toLocaleString('vi-VN')}đ` 
                        : '0đ'}
                    </div>
                    <div className="item-col total">
                      {(item.total || 0).toLocaleString('vi-VN')}đ
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tổng tiền */}
          <div className="invoice-section">
            <h3>Tổng tiền</h3>
            <div className="invoice-summary">
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="summary-row">
                <span>Khuyến mãi:</span>
                <span>-{discount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="summary-row">
                <span>Thuế VAT (10%):</span>
                <span>{vat.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="summary-row total-row">
                <span>Tổng thanh toán:</span>
                <span>{total.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>
        </div>

        <div className="invoice-info-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            <i className="fas fa-times"></i>
            Đóng
          </button>
          <button className="btn btn-primary" onClick={onCreateInvoice}>
            <i className="fas fa-print"></i>
            In hóa đơn
          </button>
        </div>
      </div>
    </div>
  );
};