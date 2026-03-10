import React, { useEffect, useState } from "react";
import { invoiceApi } from "../api/invoiceApi";
import type { Order } from "../types/order";
import { formatPrice, getStatusText, getStatusColor, getPaymentMethodText } from "../utils/orderUtils";
import { InvoiceInfo } from "../components/sales/InvoiceInfo";
import "./Cart.css";

export const Cart: React.FC = () => {
    const [invoices, setInvoices] = useState<Order[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await invoiceApi.getMyOrderHistory();
            const data = result.data || [];

            const mappedInvoices = data.map((inv: any) => ({
                orderId: inv.orderId,
                code: inv.code,
                customerName: inv.customerName,
                total: inv.total || inv.totalAmount || 0,
                status: inv.status || inv.invoiceType,
                createdDate: inv.createdAt || inv.createdDate,
                paymentMethod: inv.paymentMethod,
                notes: inv.notes || '',
                items: inv.items?.map((item: any) => ({
                  productId: item.productId,
                  product: { 
                      name: item.productName, 
                      id: item.productId,
                      price: item.unitPrice || 0
                  },
                  productName: item.productName,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  subtotal: item.subtotal || (item.unitPrice * item.quantity), 
                  total: item.totalPrice || item.subtotal || (item.unitPrice * item.quantity),
                })) || []
            }));

            mappedInvoices.sort((a: any, b: any) => {
                return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
            });

            setInvoices(mappedInvoices);
            setFilteredInvoices(mappedInvoices);
        } catch (err: any) {
            setError("Lỗi khi tải danh sách hóa đơn");
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = invoices.filter(inv => 
            inv.code.toLowerCase().includes(lowerTerm) ||
            inv.customerName.toLowerCase().includes(lowerTerm)
        );
        setFilteredInvoices(filtered);
    }, [searchTerm, invoices]);

    const handleViewInvoice = (invoice: Order) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedInvoice(null), 200);
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>;
    if (error) return <div className="error-container"><p>{error}</p></div>;

    return (
        <div className="cart-page">
            {/* Header Box */}
            <div className="page-header-box">
                <h1 className="page-title">Danh sách hóa đơn</h1>
            </div>

            {/* Search Bar */}
            <div className="search-filter-bar">
                <div className="search-container">
                    <span className="fa fa-search search-icon"></span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã hóa đơn, tên khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="orders-table-container">
                <table className="orders-table">
                    <colgroup>
                        <col style={{ width: '5%' }} />  {/* STT */}
                        <col style={{ width: '15%' }} /> {/* Mã HD */}
                        <col style={{ width: '20%' }} /> {/* KH */}
                        <col style={{ width: '15%' }} /> {/* Ngày */}
                        <col style={{ width: '10%' }} /> {/* CQT */}
                        <col style={{ width: '10%' }} /> {/* Tiền */}
                        <col style={{ width: '10%' }} /> {/* HTTT */}
                        <col style={{ width: '10%' }} /> {/* Trạng thái */}
                        <col style={{ width: '5%' }} />  {/* Thao tác */}
                    </colgroup>
                    <thead>
                    <tr>
                        <th className="text-center">STT</th>
                        <th className="text-left">MÃ HÓA ĐƠN</th>
                        <th className="text-left">THÔNG TIN KH</th>
                        <th className="text-center">NGÀY TẠO</th>
                        <th className="text-center">MÃ CƠ QUAN THUẾ</th>
                        <th className="text-right">TỔNG TIỀN</th>
                        <th className="text-center">HÌNH THỨC TT</th>
                        <th className="text-center">TRẠNG THÁI</th>
                        <th className="text-center">THAO TÁC</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredInvoices.length === 0 ? (
                        <tr><td colSpan={9} className="empty-state">Không tìm thấy hóa đơn nào.</td></tr>
                    ) : (
                        filteredInvoices.map((invoice, index) => (
                            <tr key={invoice.orderId || index}>
                                <td className="text-center">{index + 1}</td>
                                <td className="text-left" style={{fontWeight: '600', color: '#2c77d5'}}>
                                    {invoice.code}
                                </td>
                                <td className="text-left">
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <span style={{fontSize: '11px', color: '#6b7280', marginBottom: '2px'}}>Tên khách hàng:</span>
                                        <span style={{fontWeight: '500'}}>{invoice.customerName || "Khách lẻ"}</span>
                                    </div>
                                </td>
                                <td className="text-center">{invoice.createdDate}</td>
                                <td className="text-center" style={{color: '#9ca3af'}}>--</td>
                                <td className="text-right" style={{fontWeight: '700', color: '#1f2937'}}>
                                    {formatPrice(invoice.total)}
                                </td>
                                <td className="text-center">{getPaymentMethodText(invoice.paymentMethod)}</td>
                                <td className="text-center">
                                    <span
                                        className="status-badge"
                                        style={{
                                            color: getStatusColor(invoice.status),
                                            backgroundColor: `${getStatusColor(invoice.status)}15`
                                        }}
                                    >
                                        {getStatusText(invoice.status)}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <button
                                        className="action-btn"
                                        onClick={() => handleViewInvoice(invoice)}
                                        title="Xem chi tiết"
                                    >
                                        {/* Icon con mắt */}
                                        <i className="fa fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {selectedInvoice && (
                <InvoiceInfo 
                    order={selectedInvoice} 
                    isOpen={isModalOpen} 
                    onCancel={handleCloseModal}
                    onCreateInvoice={handlePrintInvoice}
                />
            )}
        </div>
    );
};

export default Cart;