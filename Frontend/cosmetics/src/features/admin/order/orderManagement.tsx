import { useEffect, useState } from "react";
import { orderApi } from "../../../api/orderApi.ts";
import type { Order } from "../../../types/order.ts";
import { OrderDetailModal } from "./OrderDetailModal.tsx";
import { OrderFilters } from "./OrderFilters.tsx";
import { OrderTable } from "../../../components/orders/OrderTable.tsx";
import { formatPrice, getStatusText, getStatusColor, getPaymentMethodText } from "../../../utils/orderUtils.ts";
import "./OrderManagement.css";
import './../userManagement.css';
import { useNavigate } from "react-router-dom";

export const OrderManagement = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);


    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await orderApi.getAllOrders();
            const { data = [] } = result || {};

            const transformedOrders = (data || []).map((order: any) => ({
                ...order,
                orderId: order.id || order.orderId,
                total: order.total !== undefined ? order.total : (order.finalPrice || 0),
                createdDate: order.createdDate || order.createdAt || order.created_date,
                items: (order.items || order.orderDetails || []).map((item: any) => ({
                    ...item,
                    product: item.product || {
                        id: item.productId,
                        name: item.productName,
                        price: item.unitPrice || item.price
                    },
                    quantity: item.quantity || item.quantityProduct,
                    unitPrice: item.unitPrice || item.price,
                    totalPrice: item.totalPrice || item.total,
                    subtotal: item.subtotal || item.total
                }))
            }));

            setOrders(transformedOrders);
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Lỗi khi tải đơn hàng";
            setError(errorMessage);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);


    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleCancelOrder = async (orderId: string | number) => {
        try {
            if (!orderId || orderId === 'undefined' || orderId === '') {
                alert('Không thể hủy đơn hàng: ID không hợp lệ');
                return;
            }
            await orderApi.updateOrderStatus(String(orderId), 'CANCELLED')
            setOrders(prev => prev.map(order =>
                order.orderId === orderId
                    ? { ...order, status: 'CANCELLED' }
                    : order
            ));
            alert('Đơn hàng đã được hủy thành công!');
        } catch {
            alert('Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại.');
        }
    };

    const handleDeleteOrder = async (orderId: string | number) => {
        try {
            if (!orderId || orderId === 'undefined' || orderId === '') {
                alert('Không thể xoá đơn hàng: ID không hợp lệ');
                return;
            }

            await orderApi.deleteOrder(String(orderId));
            setOrders(prev => prev.filter(order => order.orderId !== Number(orderId)));
            alert('Đơn hàng đã được xoá thành công!');

            // Fallback: Refresh orders list after a short delay
            setTimeout(async () => {
                try {
                    const response = await orderApi.getAllOrders();
                    if (response.data) {
                        setOrders(response.data);
                    }
                } catch (error) {
                    // Silent error handling
                }
            }, 1000);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xoá đơn hàng. Vui lòng thử lại.';
            alert(errorMessage);
        }
    };

    const handleReturnOrder = async (orderId: string | number) => {
        try {
            if (!orderId || orderId === 'undefined' || orderId === '') {
                alert('Không thể hủy đơn hàng: ID không hợp lệ');
                return;
            }
            await orderApi.updateOrderStatus(String(orderId), 'RETURNED');
            setOrders(prev => prev.map(order =>
                order.orderId === orderId
                    ? { ...order, status: 'RETURNED' }
                    : order
            ));
            alert('Đơn hàng đã được hủy thành công!');
        } catch {
            alert('Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại.');
        }
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.orderId.toString().includes(searchTerm);

        let matchesStatus = false;
        if (selectedStatus === "all") {
            matchesStatus = true;
        } else if (selectedStatus === "incomplete") {
            matchesStatus = order.status === "DRAFT";
        } else if (selectedStatus === "completed") {
            matchesStatus = order.status === "COMPLETED";
        } else if (selectedStatus === "cancelled") {
            matchesStatus = order.status === "CANCELLED";
        } else if (selectedStatus === "return") {
            matchesStatus = order.status === "RETURNED";
        }

        return matchesSearch && matchesStatus;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        setCurrentPage(1); // Reset to first page when filtering
    };

    if (loading)
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải danh sách đơn hàng...</p>
            </div>
        );

    if (error)
        return (
            <div className="error-container">
                <div className="error-content">
                    <h3>Lỗi tải dữ liệu</h3>
                    <p style={{ color: "#dc2626", marginBottom: "16px" }}>{error}</p>
                    <button className="btn btn-primary" onClick={fetchOrders}>
                        <span className="icon">🔄</span>
                        Thử lại
                    </button>
                </div>
            </div>
        );

    return (
        <div className="orders-management-page">
            {/* Header */}
            <div className="management-header">
                <h1>Danh sách đơn hàng</h1>
                <div className="orders-management-header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/user/sales")}
                    >
                        <span className="icon">+</span>
                        Thêm ĐH
                    </button>

                </div>
            </div>

            {/* Filters */}
            <OrderFilters
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                selectedStatus={selectedStatus}
                onStatusChange={handleStatusChange}
                totalOrders={filteredOrders.length}
            />

            {/* Orders Table */}
            <OrderTable
                orders={paginatedOrders}
                onViewOrder={handleViewOrder}
                formatPrice={formatPrice}
                getStatusText={getStatusText}
                getStatusColor={getStatusColor}
                getPaymentMethodText={getPaymentMethodText}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination-container">
                    <div className="pagination-info">
                        Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} trong {filteredOrders.length} đơn hàng
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

            {/* Order Detail Modal */}
            <OrderDetailModal
                order={selectedOrder}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onCancelOrder={handleCancelOrder}
                onDeleteOrder={handleDeleteOrder}
                onReturnOrder={handleReturnOrder}
            />
        </div>
    );
};