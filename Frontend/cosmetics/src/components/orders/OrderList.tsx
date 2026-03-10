import React from 'react';
import type { OrderListProps } from '../../types/order.ts';

export const OrderList: React.FC<OrderListProps> = ({
                                                      orders,
                                                      onViewOrder,
                                                      onContinueOrder,
                                                      formatPrice,
                                                      getStatusText,
                                                      getStatusColor,
                                                      getPaymentMethodText
                                                    }) => {

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';

    try {
      // Xử lý timestamp Unix (milliseconds)
      if (typeof dateString === 'number' || /^\d+$/.test(dateString)) {
        const timestamp = typeof dateString === 'number' ? dateString : parseInt(dateString);
        // Kiểm tra nếu là timestamp Unix (seconds) thì chuyển thành milliseconds
        const date = timestamp < 10000000000 ? new Date(timestamp * 1000) : new Date(timestamp);
        return date.toLocaleString("vi-VN");
      }

      // Xử lý ISO string hoặc date string
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';

      return date.toLocaleString("vi-VN");
    } catch (error) {
      return 'N/A';
    }
  };

  if (orders.length === 0) {
    return (
        <tr>
          <td colSpan={9} style={{ textAlign: "center", padding: "40px" }}>
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>Chưa có đơn hàng nào</h3>
              <p>Khi có đơn hàng mới, chúng sẽ xuất hiện ở đây.</p>
            </div>
          </td>
        </tr>
    );
  }

  return (
      <>
        {orders.map((order, index) => (
            <tr key={order.orderId}>
              <td>{index + 1}</td>
              <td
                  onClick={() => onViewOrder(order)}
                  title="Xem chi tiết"
                  style={{cursor: "pointer", color: "#2c77d5", fontWeight: 500}}
              >
                {order.code}
              </td>
              <td>
                <div className="customer-info">
              <span>
                Tên khách hàng: {order.customerName || "Khách lẻ"}
              </span>
                </div>
              </td>
              <td>{formatDate(order.createdDate)}</td>
              <td></td>
              <td>{formatPrice(order.total)}</td>
              <td>{getPaymentMethodText(order.paymentMethod)}</td>
              <td>
            <span
                className="status-badge"
                style={{color: getStatusColor(order.status)}}
            >
              {getStatusText(order.status)}
            </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap' }}>
                    
                    {/* Nút Tiếp tục (Chỉ hiện khi là DRAFT) */}
                    {order.status === 'DRAFT' && (
                        <button
                            className="action-btn"
                            style={{ border: '1px solid #f59e0b', color: '#f59e0b', margin: 0 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onContinueOrder(order);
                            }}
                            title="Tiếp tục thanh toán"
                        >
                            ✅
                        </button>
                    )}

                    {/* Nút Xem chi tiết (Luôn hiện) */}
                    <button
                        className="action-btn menu-btn"
                        style={{ margin: 0 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewOrder(order);
                        }}
                        title="Xem chi tiết"
                    >
                        ☰
                    </button>
                </div>
              </td>
            </tr>
        ))}
      </>
  );
};