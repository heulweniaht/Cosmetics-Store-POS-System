import React, { useState, useEffect, useRef } from 'react';
// Lưu ý: Đường dẫn import chỉ là ../.. (2 cấp) thay vì ../../../ (3 cấp)
import { useAuth } from '../../contexts/AuthProvider';
import type { OrderDetailModalProps } from '../../types/order';
import { getStatusText, getStatusColor, formatPrice, formatDate } from '../../utils/orderUtils';
import { getPaymentMethodText } from '../../utils/orderUtils';
import ConfirmationModal from '../common/ConfirmationModal';
import './OrderDetailModal.css';

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onCancelOrder,
  onDeleteOrder,
  onReturnOrder,
}) => {
  const { isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  if (!isOpen || !order) return null;

  const handleCancelOrder = () => {
    setMenuOpen(false);
    setShowCancelConfirm(true);
  };

  const handleDeleteOrder = () => {
    setMenuOpen(false);
    setShowDeleteConfirm(true);
  };

  const handleReturnOrder = () => {
    setMenuOpen(false);
    setShowReturnConfirm(true);
  };

  const handleConfirmCancel = () => {
    if (!order?.orderId) return;
    onCancelOrder?.(order.orderId);
    setShowCancelConfirm(false);
    onClose();
  };

  const handleConfirmDelete = () => {
    if (!order?.orderId) return;
    onDeleteOrder?.(order.orderId);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleConfirmReturn = () => {
    if (!order?.orderId) return;
    onReturnOrder?.(order.orderId);
    setShowReturnConfirm(false);
    onClose();
  };

  const handleMenuToggle = () => {
    if (!menuOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      // Điều chỉnh vị trí menu để không bị che khuất
      setDropdownPosition({
        top: rect.top - 90, // Đẩy lên trên nút bấm
        left: rect.right - 140, // Căn sang trái
      });
    }
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <div className="modal-overlay user-order-modal" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <h2>Chi tiết đơn hàng</h2>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* Order Info */}
            <div className="order-info-section">
              <div className="info-grid">
                <div className="info-item">
                  <label>Mã đơn hàng:</label>
                  <span className="order-code">{order.code}</span>
                </div>
                <div className="info-item">
                  <label>Trạng thái:</label>
                  <span className="status-badge" style={{ color: getStatusColor(order.status) }}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="info-item">
                  <label>Khách hàng:</label>
                  <span>{order.customerName || 'Khách lẻ'}</span>
                </div>
                <div className="info-item">
                  <label>Ngày tạo:</label>
                  <span>{formatDate(order.createdDate ?? '')}</span>
                </div>
                <div className="info-item">
                  <label>Phương thức thanh toán:</label>
                  <span>{getPaymentMethodText(order.paymentMethod)}</span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="order-items-section">
              <h3>Danh sách sản phẩm</h3>
              <div className="items-table">
                <div className="items-header">
                  <div className="col-product">Sản phẩm</div>
                  <div className="col-price">Đơn giá</div>
                  <div className="col-quantity">Số lượng</div>
                  <div className="col-total">Thành tiền</div>
                </div>
                {order.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div className="col-product">
                      <div className="product-info">
                        <span className="product-name">
                           {item.product?.name || item.productName || 'Sản phẩm'}
                        </span>
                      </div>
                    </div>
                    <div className="col-price">{formatPrice(item.unitPrice || item.price || 0)}</div>
                    <div className="col-quantity">{item.quantity}</div>
                    <div className="col-total">{formatPrice(item.total || item.subtotal || 0)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="order-summary-section">
              <div className="summary-total">
                <div className="total-label">Tổng cộng:</div>
                <div className="total-amount">{formatPrice(order.total)}</div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="order-notes-section">
                <h3>Ghi chú</h3>
                <p>{order.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Đóng</button>

            {/* Nút Xóa cho đơn DRAFT */}
            {order.status === 'DRAFT' && (
              <button className="btn btn-warning btn-icon" onClick={handleDeleteOrder}>
                ✖ Xoá
              </button>
            )}

            {/* Menu Hủy/Trả cho đơn COMPLETED */}
            {order.status === 'COMPLETED' && (
              <div className="dropdown-wrapper" ref={dropdownRef}>
                <button className="btn btn-primary btn-icon" onClick={handleMenuToggle}>
                  ☰
                </button>

                {menuOpen && (
                  <div className="order-dropdown-menu" style={{
                    position: 'fixed',
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                    zIndex: 99999,
                    display: 'block' // Đảm bảo hiển thị
                  }}>
                    {isAdmin() && (
                        <button onClick={handleCancelOrder}>
                          <span style={{ marginRight: '4px' }}></span>
                          Huỷ đơn hàng
                        </button>
                    )}
                    
                    {/* Nút Trả hàng */}
                    <button onClick={handleReturnOrder} style={{ color: '#ea580c' }}>
                      Trả hàng
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modals */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        title="Xác nhận hủy đơn hàng"
        message={`Bạn có chắc chắn muốn hủy đơn hàng này không?\nMã đơn hàng: ${order?.code}`}
        confirmText="Hủy đơn hàng"
        cancelText="Không"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Xác nhận xóa đơn hàng"
        message={`Bạn có chắc chắn muốn xóa đơn hàng này không?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmationModal
        isOpen={showReturnConfirm}
        title="Xác nhận trả hàng"
        message={`Bạn có chắc chắn muốn trả hàng không?`}
        confirmText="Có"
        cancelText="Không"
        onConfirm={handleConfirmReturn}
        onCancel={() => setShowReturnConfirm(false)}
      />
    </>
  );
};