import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthProvider.tsx';
import type { OrderDetailModalProps } from '../../../types/order.ts';
import { getStatusText, getStatusColor } from '../../../constants/orderStatusConstants.ts';
import { formatPrice, formatDate } from '../../../constants/orderStatusConstants.ts';
import { getPaymentMethodText } from '../../../utils/orderUtils';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
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
    if (!order?.orderId) {
      alert('Không thể hủy đơn hàng: ID không hợp lệ');
      setShowCancelConfirm(false);
      return;
    }
    
    onCancelOrder?.(order.orderId);
    setShowCancelConfirm(false);
    onClose();
  };

  const handleConfirmDelete = () => {
    if (!order?.orderId) {
      alert('Không thể xóa đơn hàng: ID không hợp lệ');
      setShowDeleteConfirm(false);
      return;
    }
    
    onDeleteOrder?.(order.orderId);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleConfirmReturn = () => {
    if (!order?.orderId) {
      alert('Không thể hủy đơn hàng: ID không hợp lệ');
      setShowCancelConfirm(false);
      return;
    }

    onReturnOrder?.(order.orderId);
    setShowReturnConfirm(false);
    onClose();
  }

  const handleCancelConfirm = () => {
    setShowCancelConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleReturnCancel = () => {
    setShowReturnConfirm(false);
  };

  const handleMenuToggle = () => {
    if (!menuOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
        const newPosition = {
          top: rect.top - 90,
          left: rect.right - 70,
        };
      setDropdownPosition(newPosition);
    }
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <div className="orders-management-modal-overlay" onClick={onClose}>
        <div className="orders-management-modal-content" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="orders-management-modal-header">
            <h2>Chi tiết đơn hàng</h2>
            <button className="orders-management-close-button" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* Modal Body */}
          <div className="orders-management-modal-body">
            {/* Order Info */}
            <div className="orders-management-order-info-section">
              <div className="orders-management-info-grid">
                <div className="orders-management-info-item">
                  <label>Mã đơn hàng:</label>
                  <span className="orders-management-order-code">{order.code}</span>
                </div>
                <div className="orders-management-info-item">
                  <label>Trạng thái:</label>
                  <span
                      className="orders-management-status-badge"
                      style={{ color: getStatusColor(order.status) }}
                  >
                  {getStatusText(order.status)}
                </span>
                </div>
                <div className="orders-management-info-item">
                  <label>Khách hàng:</label>
                  <span>{order.customerName || 'Khách lẻ'}</span>
                </div>
                <div className="orders-management-info-item">
                  <label>Ngày tạo:</label>
                  <span>{formatDate(order.createdDate ?? '')}</span>
                </div>
                <div className="orders-management-info-item">
                  <label>Phương thức thanh toán:</label>
                  <span>{getPaymentMethodText(order.paymentMethod)}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="orders-management-order-items-section">
              <h3>Danh sách sản phẩm</h3>
              <div className="orders-management-items-table">
                <div className="orders-management-items-header">
                  <div className="orders-management-col-product">Sản phẩm</div>
                  <div className="orders-management-col-price">Đơn giá</div>
                  <div className="orders-management-col-quantity">Số lượng</div>
                  <div className="orders-management-col-total">Thành tiền</div>
                </div>
                {order.items.map((item, index) => (
                    <div key={index} className="orders-management-item-row">
                      <div className="orders-management-col-product">
                        <div className="orders-management-product-info">
                      <span className="orders-management-product-name">
                        {item.product?.name || 
                         item.productName || 
                         `Sản phẩm ${item.product?.id || item.productId || 'N/A'}`}
                      </span>
                        </div>
                      </div>
                      <div className="orders-management-col-price">{formatPrice(
                        item.product?.price || 
                        item.unitPrice || 
                        item.price || 
                        0
                      )}</div>
                      <div className="orders-management-col-quantity">{item.quantity || item.quantityProduct || 0}</div>
                      <div className="orders-management-col-total">{formatPrice(
                        item.subtotal || 
                        item.total || 
                        item.totalPrice || 
                        0
                      )}</div>
                    </div>
                ))}
              </div>
            </div>
            {/* Order Summary */}
            <div className="orders-management-order-summary-section">
              <div className="orders-management-summary-total">
                <div className="orders-management-total-label">Tổng cộng:</div>
                <div className="orders-management-total-amount">{formatPrice(order.total)}</div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
                <div className="orders-management-order-notes-section">
                  <h3>Ghi chú</h3>
                  <p>{order.notes}</p>
                </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="orders-management-modal-footer">
            <button className="orders-management-btn orders-management-btn-secondary" onClick={onClose}>
              Đóng
            </button>

            {order.status === 'DRAFT' && (
                <button className="orders-management-btn orders-management-btn-warning orders-management-btn-icon" onClick={handleDeleteOrder}>
                  ✖ Xoá
                </button>
            )}

            {/*{order.status === 'CANCELLED' && (
                <button className="orders-management-btn orders-management-btn-danger orders-management-btn-icon" onClick ={handleDeleteOrder}>
                  Xoá
                </button>
            )}*/}

             {order.status === 'COMPLETED' && (
                 <div className="orders-management-dropdown-wrapper" ref={dropdownRef}>
                   <button
                       className="orders-management-btn orders-management-btn-primary orders-management-btn-icon"
                       onClick={handleMenuToggle}
                   >
                     ☰
                   </button>

                   {menuOpen && (
                       <div className="orders-management-order-dropdown-menu" style={{ 
                         position: 'fixed', 
                         top: `${dropdownPosition.top}px`,
                         left: `${dropdownPosition.left}px`,
                         zIndex: 99999,
                         transform: 'none'
                       }}>
                         {isAdmin() && (
                         <button onClick={handleCancelOrder}>
                           <span style={{ marginRight: '4px' }}></span>
                           Huỷ đơn hàng
                         </button>
                         )}
                         <button onClick={handleReturnOrder}>
                           <span style={{ marginRight: '4px' }}></span>
                           Trả hàng
                         </button>
                       </div>
                   )}
                 </div>
             )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal cho Cancel */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        title="Xác nhận hủy đơn hàng"
        message={`Bạn có chắc chắn muốn hủy đơn hàng này không?\nMã đơn hàng: ${order?.code}`}
        confirmText="Hủy đơn hàng"
        cancelText="Không"
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelConfirm}
      />

      {/* Confirmation Modal cho Delete */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Xác nhận xóa đơn hàng"
        message={`Bạn có chắc chắn muốn xóa đơn hàng này không?\nMã đơn hàng: ${order?.code}`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={handleDeleteCancel}
      />

      <ConfirmationModal
          isOpen={showReturnConfirm}
          title="Xác nhận trả hàng"
          message={`Bạn có chắc chắn muốn trả hàng không?\nMã đơn hàng: ${order?.code}`}
          confirmText="Có"
          cancelText="Không"
          onConfirm={handleConfirmReturn}
          onCancel={handleReturnCancel}
      />
    </>

  );
};

