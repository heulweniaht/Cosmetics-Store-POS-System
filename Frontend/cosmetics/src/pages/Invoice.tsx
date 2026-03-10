import React, { useEffect, useState } from "react";
import { invoiceApi } from "../api/invoiceApi";
import type { Order } from "../types/order";
import { OrderTable } from "../components/orders/OrderTable";
import { formatPrice, getStatusText, getStatusColor, getPaymentMethodText } from "../utils/orderUtils";
import "./Order/Orders.css"; 

export const Invoice: React.FC = () => {
  const [invoices, setInvoices] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        // Gọi API lấy lịch sử hóa đơn của User
        const result = await invoiceApi.getMyOrderHistory();
        const data = result.data || [];

        // Map dữ liệu từ Invoice Service sang cấu trúc Order để hiển thị lên bảng
        const mappedInvoices = data.map((inv: any) => ({
          orderId: inv.orderId, // ID hoá đơn
          code: inv.code,
          customerName: inv.customerName,
          total: inv.total || inv.totalAmount || 0,
          status: inv.status || inv.invoiceType, // invoiceType: COMPLETED, RETURNED...
          createdDate: inv.createdAt || inv.createdDate,
          paymentMethod: inv.paymentMethod,
          items: inv.items || [],
          notes: inv.notes || ''
        }));

        setInvoices(mappedInvoices);
      } catch (err: any) {
        setError("Không thể tải danh sách hóa đơn");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Hàm dummy cho view/continue vì ở trang hóa đơn chỉ xem, không sửa
  const handleViewInvoice = (invoice: Order) => {
    alert(`Xem chi tiết hóa đơn: ${invoice.code}`);
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Đang tải hóa đơn...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p>{error}</p>
    </div>
  );

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>Danh sách hóa đơn</h1>
      </div>

      {/* Tái sử dụng OrderTable để hiển thị hóa đơn */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã hóa đơn</th>
              <th>Khách hàng</th>
              <th>Ngày tạo</th>
              <th>Mã CQT</th>
              <th>Tổng tiền</th>
              <th>Hình thức TT</th>
              <th>Loại hóa đơn</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
               <tr><td colSpan={9} className="empty-state">Chưa có hóa đơn nào</td></tr>
            ) : (
              invoices.map((invoice, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td style={{fontWeight: 'bold', color: '#2c77d5'}}>{invoice.code}</td>
                  <td>{invoice.customerName}</td>
                  <td>{invoice.createdDate}</td>
                  <td>--</td>
                  <td style={{fontWeight: 'bold'}}>{formatPrice(invoice.total)}</td>
                  <td>{getPaymentMethodText(invoice.paymentMethod)}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ color: getStatusColor(invoice.status) }}
                    >
                      {getStatusText(invoice.status)}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn" onClick={() => handleViewInvoice(invoice)}>
                      👁️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};