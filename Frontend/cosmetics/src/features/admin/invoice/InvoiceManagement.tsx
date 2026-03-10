import React, { useEffect, useState } from "react";
import { invoiceApi } from "../../../api/invoiceApi";
import type { Order } from "../../../types/order";
import { formatPrice, getStatusText, getStatusColor, getPaymentMethodText } from "../../../utils/orderUtils";
import { InvoiceInfo } from "../../../components/sales/InvoiceInfo";
import { statusTabs } from "../../../constants/orderStatusConstants"; // Import cấu hình Tabs
import "./InvoiceManagement.css";

export const InvoiceManagement: React.FC = () => {
    const [invoices, setInvoices] = useState<Order[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all"); // State cho Tab đang chọn
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await invoiceApi.getAllInvoicesForAdmin();
            const data = result.data || [];

            const mappedInvoices = data.map((inv: any) => ({
                orderId: inv.orderId,
                code: inv.code,
                customerName: inv.customerName,
                total: inv.total || 0,
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
                    subtotal: item.subtotal || (item.unitPrice * item.quantity), 
                    total: item.totalPrice || item.subtotal,
                })) || []
            }));

            // Sắp xếp mới nhất lên đầu
            mappedInvoices.sort((a: any, b: any) => {
                return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
            });

            setInvoices(mappedInvoices);
            setFilteredInvoices(mappedInvoices);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Lỗi khi tải danh sách hóa đơn";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    // Logic lọc dữ liệu (Search + Status Tab)
    useEffect(() => {
        const lowerTerm = searchTerm.toLowerCase();
        
        const filtered = invoices.filter(inv => {
            // 1. Lọc theo từ khóa tìm kiếm
            const matchesSearch = 
                inv.code.toLowerCase().includes(lowerTerm) ||
                inv.customerName.toLowerCase().includes(lowerTerm);

            // 2. Lọc theo Tab trạng thái
            let matchesStatus = false;
            if (selectedStatus === "all") {
                matchesStatus = true;
            } else if (selectedStatus === "incomplete") {
                matchesStatus = inv.status === "DRAFT";
            } else if (selectedStatus === "completed") {
                matchesStatus = inv.status === "COMPLETED";
            } else if (selectedStatus === "cancelled") {
                matchesStatus = inv.status === "CANCELLED";
            } else if (selectedStatus === "return") {
                matchesStatus = inv.status === "RETURNED";
            }

            return matchesSearch && matchesStatus;
        });

        setFilteredInvoices(filtered);
        setCurrentPage(1); // Reset về trang 1 khi lọc
    }, [searchTerm, selectedStatus, invoices]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
    };

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

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Đang tải dữ liệu...</p></div>;
    if (error) return <div className="error-container"><p>{error}</p></div>;

    return (
        <div className="orders-management-page">
            {/* Header Box */}
            <div className="management-header">
                <h1>Quản lý hóa đơn</h1>
            </div>

            {/* --- BỔ SUNG: Status Tabs --- */}
            <div className="orders-management-status-tabs">
                {statusTabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`orders-management-tab ${
                            selectedStatus === tab.key ? "active" : ""
                        }`}
                        onClick={() => handleStatusChange(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search & Filter Bar */}
            <div className="orders-management-main-content-container">
                <div className="orders-management-search-filter-bar">
                    <div className="orders-management-search-container">
                        <span className="fa fa-search orders-management-search-icon"></span>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo mã hóa đơn, tên KH..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="orders-management-search-input"
                        />
                    </div>
                    <div className="orders-management-total-orders">
                         Tổng: <span className="orders-management-total-count">{filteredInvoices.length}</span> hóa đơn
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="orders-management-table-container">
                <table className="orders-management-table">
                    <colgroup>
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '5%' }} />
                    </colgroup>
                    <thead>
                    <tr>
                        <th className="text-center">STT</th>
                        <th className="text-left">MÃ HÓA ĐƠN</th>
                        <th className="text-left">THÔNG TIN KH</th>
                        <th className="text-center">NGÀY TẠO</th>
                        <th className="text-center">MÃ CQT</th>
                        <th className="text-right">TỔNG TIỀN</th>
                        <th className="text-center">HÌNH THỨC TT</th>
                        <th className="text-center">TRẠNG THÁI</th>
                        <th className="text-center">THAO TÁC</th>
                    </tr>
                    </thead>
                    <tbody>
                    {currentInvoices.length === 0 ? (
                        <tr><td colSpan={9} className="orders-management-empty-state">Không tìm thấy hóa đơn nào.</td></tr>
                    ) : (
                        currentInvoices.map((invoice, index) => (
                            <tr key={invoice.orderId || index}>
                                <td className="text-center">{startIndex + index + 1}</td>
                                <td className="text-left" style={{fontWeight: '600', color: '#2c77d5'}}>
                                    {invoice.code}
                                </td>
                                <td className="text-left">
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <span style={{fontSize: '11px', color: '#6b7280'}}>Khách hàng:</span>
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
                                        className="orders-management-status-badge"
                                        style={{
                                            color: getStatusColor(invoice.status),
                                            backgroundColor: `${getStatusColor(invoice.status)}15`,
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            display: 'inline-block'
                                        }}
                                    >
                                        {getStatusText(invoice.status)}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <button
                                        className="orders-management-action-btn"
                                        onClick={() => handleViewInvoice(invoice)}
                                        title="Xem chi tiết"
                                        style={{
                                            border: '1px solid #d1d5db',
                                            background: 'white',
                                            cursor: 'pointer',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto'
                                        }}
                                    >
                                        <i className="fa fa-eye" style={{color: '#6b7280', fontSize: '14px'}}></i>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        Hiển thị {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredInvoices.length)} trong {filteredInvoices.length} hóa đơn
                    </div>
                    <div className="pagination-controls">
                        <button
                            className="pagination-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Trước
                        </button>
                        <div className="pagination-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                                    onClick={() => handlePageChange(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            className="pagination-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}

            {/* Modal */}
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