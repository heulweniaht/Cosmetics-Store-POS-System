import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './SalesScreen.css';
import type { Order, OrderItem } from '../../types/order';
import type { Product } from '../../types/product';
import { ProductCard } from '../../components/sales/ProductCard';
import { OrderSummary } from '../../components/sales/OrderSummary';
import { InvoiceInfo } from '../../components/sales/InvoiceInfo';
import { productApi } from '../../api/productApi';
import { orderApi } from '../../api/orderApi';
import { ORDER_STATUS } from '../../constants/orderStatusConstants';

const createNewOrder = (index: number): Order => ({
    tempId: index, // mã đơn hàng hiển thị cho FE
    tempCode: `ĐH-${index}`,
    orderId: undefined,
    code: '',
    customerName: 'Khách lẻ',
    total: 0,
    status: 'DRAFT',
    createdDate: undefined,
    items: [],
    notes: '',
    paymentMethod: undefined,
});

export const SalesScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId: orderIdParam } = useParams<{ orderId?: string }>();

    const [sidebarOpen] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [loadingOrder, setLoadingOrder] = useState(false);

    const [orders, setOrders] = useState<Order[]>([createNewOrder(1)]);
    const [activeOrderIndex, setActiveOrderIndex] = useState(0);
    const [customerName, setCustomerName] = useState('Khách lẻ');
    const [notes, setNotes] = useState('---');
    const [showInvoiceInfo, setShowInvoiceInfo] = useState(false);
    const [paidOrder, setPaidOrder] = useState<Order | null>(null);


    useEffect(() => {
        const checkPaymentCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);

            const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
            if (vnp_ResponseCode) {
                const pendingOrderId = localStorage.getItem('pendingPaymentOrderId');

                try {
                    const params = Object.fromEntries(urlParams.entries());
                    const { verifyVNPayPayment } = await import('../../api/paymentApi');
                    await verifyVNPayPayment(params);

                    const isPaymentSuccess = vnp_ResponseCode === '00';

                    if (!isPaymentSuccess) {
                        alert("Thanh toán thất bại! Mã lỗi: " + vnp_ResponseCode);
                        window.history.replaceState({}, document.title, window.location.pathname);
                        localStorage.removeItem('pendingPaymentOrderId');
                        localStorage.removeItem('pendingPaymentMethod');
                        return;
                    }

                    if (pendingOrderId) {
                        // Lấy thông tin order hiện tại
                        const orderResult = await orderApi.getById(pendingOrderId);
                        const orderData = orderResult.data;

                        if (orderData) {
                            // Chỉ update khi thanh toán thành công (vnp_ResponseCode === "00")
                            if (orderData.status === ORDER_STATUS.DRAFT) {
                                // Build payload từ orderData hiện có, chỉ thay đổi status
                                const items = (orderData.items || []).map((item: any) => ({
                                    productId: item.productId || '',
                                    productName: item.productName || '',
                                    price: item.price || item.unitPrice || 0,
                                    quantity: item.quantity || 0,
                                    subtotal: item.total || item.subtotal || 0,
                                }));
                                const subtotal = items.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0);
                                // Tính discount từ items (tổng subtotal - tổng total của từng item)
                                const calculatedDiscount = items.reduce((sum: number, item: any) => {
                                    const itemSubtotal = (item.price || 0) * (item.quantity || 0);
                                    return sum + (itemSubtotal - (item.subtotal || 0));
                                }, 0);
                                const discount = (orderData as any).discount || calculatedDiscount || 0;
                                const totalAfterDiscount = subtotal - discount;
                                const tax = totalAfterDiscount * 0.1;
                                const total = totalAfterDiscount + tax;

                                // Lấy transferAmount từ localStorage hoặc orderData
                                const storedTransferAmount = localStorage.getItem('pendingTransferAmount');
                                const transferAmount = (orderData as any).transferAmount 
                                    || (storedTransferAmount ? Number(storedTransferAmount) : 0);

                                const updatePayload = {
                                    id: Number(pendingOrderId),
                                    items,
                                    subtotal,
                                    discount,
                                    tax,
                                    total,
                                    customerName: orderData.customerName || 'Khách lẻ',
                                    notes: orderData.notes || '',
                                    status: ORDER_STATUS.COMPLETED,
                                    paymentMethod: orderData.paymentMethod,
                                    cashAmount: orderData.paymentMethod === 'cash' ? total : 0,
                                    transferAmount: orderData.paymentMethod !== 'cash' ? transferAmount : 0,
                                };
                                await orderApi.updateOrder(pendingOrderId, updatePayload);
                            }

                            const updatedOrderResult = await orderApi.getById(pendingOrderId);
                            const updatedOrderData = updatedOrderResult.data;

                            if (updatedOrderData && updatedOrderData.status === ORDER_STATUS.COMPLETED) {
                                const mappedOrder: Order = {
                                    orderId: updatedOrderData.orderId,
                                    code: updatedOrderData.code,
                                    customerName: updatedOrderData.customerName,
                                    total: updatedOrderData.total,
                                    status: updatedOrderData.status,
                                    createdDate: updatedOrderData.createdDate,
                                    items: (updatedOrderData.items || []).map((item: any) => {
                                        const unitPrice = item.price;
                                        const quantity = item.quantity;
                                        const total = item.total;
                                        const subtotal = unitPrice * quantity;
                                        return {
                                            productId: item.productId,
                                            product: {
                                                id: item.productId,
                                                name: item.productName,
                                                price: unitPrice,
                                                discount: item.discount || 0,
                                            },
                                            quantity,
                                            subtotal,
                                            discountAmount: subtotal - total,
                                            total,
                                        };
                                    }),
                                    notes: updatedOrderData.notes,
                                    paymentMethod: updatedOrderData.paymentMethod,
                                };

                                setPaidOrder(mappedOrder);
                                setShowInvoiceInfo(true);
                            }
                        }
                    }

                    window.history.replaceState({}, document.title, window.location.pathname);
                    localStorage.removeItem('pendingPaymentOrderId');
                    localStorage.removeItem('pendingPaymentMethod');
                } catch (error) {
                    alert("Thanh toán thất bại!");
                }
                return;
            }

            const resultCode = urlParams.get('resultCode');
            const pendingOrderId = localStorage.getItem('pendingPaymentOrderId');
            const pendingPaymentMethod = localStorage.getItem('pendingPaymentMethod');
            const success = resultCode === '0' || resultCode === '9000';

            if (success && pendingOrderId && pendingPaymentMethod === 'momo') {
                const fetchOrderWithRetry = async (retries = 5) => {
                    for (let i = 0; i < retries; i++) {
                        try {
                            const orderResult = await orderApi.getById(pendingOrderId);
                            const orderData = orderResult.data;

                            if (orderData) {
                                // Nếu order đang ở trạng thái DRAFT, update lên COMPLETED
                                if (orderData.status === ORDER_STATUS.DRAFT) {
                                    // Build payload từ orderData hiện có, chỉ thay đổi status
                                    const items = (orderData.items || []).map((item: any) => ({
                                        productId: item.productId || '',
                                        productName: item.productName || '',
                                        price: item.price || item.unitPrice || 0,
                                        quantity: item.quantity || 0,
                                        subtotal: item.total || item.subtotal || 0,
                                    }));
                                    const subtotal = items.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0);
                                    // Tính discount từ items (tổng subtotal - tổng total của từng item)
                                    const calculatedDiscount = items.reduce((sum: number, item: any) => {
                                        const itemSubtotal = (item.price || 0) * (item.quantity || 0);
                                        return sum + (itemSubtotal - (item.subtotal || 0));
                                    }, 0);
                                    const discount = (orderData as any).discount || calculatedDiscount || 0;
                                    const totalAfterDiscount = subtotal - discount;
                                    const tax = totalAfterDiscount * 0.1;
                                    const total = totalAfterDiscount + tax;

                                    // Lấy transferAmount từ localStorage hoặc orderData
                                    const storedTransferAmount = localStorage.getItem('pendingTransferAmount');
                                    const transferAmount = (orderData as any).transferAmount 
                                        || (storedTransferAmount ? Number(storedTransferAmount) : 0);

                                    const updatePayload = {
                                        id: Number(pendingOrderId),
                                        items,
                                        subtotal,
                                        discount,
                                        tax,
                                        total,
                                        customerName: orderData.customerName || 'Khách lẻ',
                                        notes: orderData.notes || '',
                                        status: ORDER_STATUS.COMPLETED,
                                        paymentMethod: orderData.paymentMethod,
                                        cashAmount: orderData.paymentMethod === 'cash' ? total : 0,
                                        transferAmount: orderData.paymentMethod !== 'cash' ? transferAmount : 0,
                                    };
                                    await orderApi.updateOrder(pendingOrderId, updatePayload);
                                }

                                // Lấy lại order sau khi update
                                const updatedOrderResult = await orderApi.getById(pendingOrderId);
                                const updatedOrderData = updatedOrderResult.data;

                                if (updatedOrderData && updatedOrderData.status === ORDER_STATUS.COMPLETED) {
                                    const mappedOrder: Order = {
                                        orderId: updatedOrderData.orderId,
                                        code: updatedOrderData.code,
                                        customerName: updatedOrderData.customerName,
                                        total: updatedOrderData.total,
                                        status: updatedOrderData.status,
                                        createdDate: updatedOrderData.createdDate,
                                        items: (updatedOrderData.items || []).map((item: any) => {
                                            const unitPrice = item.price;
                                            const quantity = item.quantity;
                                            const total = item.total;
                                            const subtotal = unitPrice * quantity;

                                            return {
                                                productId: item.productId,
                                                product: {
                                                    id: item.productId,
                                                    name: item.productName,
                                                    price: unitPrice,
                                                    discount: item.discount || 0,
                                                },
                                                quantity,
                                                subtotal,
                                                discountAmount: subtotal - total,
                                                total,
                                            };
                                        }),
                                        notes: updatedOrderData.notes,
                                        paymentMethod: updatedOrderData.paymentMethod,
                                    };

                                    setPaidOrder(mappedOrder);
                                    setShowInvoiceInfo(true);
                                    localStorage.removeItem('pendingPaymentOrderId');
                                    localStorage.removeItem('pendingPaymentMethod');
                                    window.history.replaceState({}, document.title, window.location.pathname);
                                    return;
                                }
                            }
                        } catch (e) {
                            console.error('Error fetching/updating order:', e);
                        }
                    }

                    localStorage.removeItem('pendingPaymentOrderId');
                    localStorage.removeItem('pendingPaymentMethod');
                };

                fetchOrderWithRetry();
            }
        };

        checkPaymentCallback();
    }, [location.search]);

    // load order from URL
    useEffect(() => {
        const loadOrderFromUrl = async () => {
            if (orderIdParam) {
                try {
                    setLoadingOrder(true);
                    const result = await orderApi.getById(orderIdParam);

                    if (result.data) {
                        const orderData = result.data;

                        const mappedOrder: Order = {
                            orderId: orderData.orderId,
                            code: orderData.code || '',
                            tempCode: '', //orderID != null -> tempCode == null
                            customerName: orderData.customerName || 'Khách lẻ',
                            total: orderData.total || 0,
                            status: orderData.status || ORDER_STATUS.DRAFT,
                            createdDate: orderData.createdDate,
                            items: (orderData.items || []).map((item: any) => {
                                const unitPrice = item.price || item.unitPrice || 0;
                                const quantity = item.quantity || 0;
                                const itemTotal = item.total || item.subtotal || item.totalPrice || 0;
                                const subtotal = unitPrice * quantity;
                                const discountAmount = Math.max(0, subtotal - itemTotal);

                                return {
                                    productId: item.productId || '',
                                    product: {
                                        id: item.productId || '',
                                        name: item.productName || item.product?.name || 'Sản phẩm không xác định',
                                        price: unitPrice,
                                        image: item.image || item.product?.image || '',
                                        discount: item.discount || 0,
                                        stock: item.stock || item.product?.stock || 999,
                                    },
                                    quantity,
                                    subtotal,
                                    discountAmount,
                                    total: itemTotal,
                                };
                            }),
                            notes: orderData.notes || '',
                            paymentMethod: orderData.paymentMethod,
                        };

                        setOrders([mappedOrder]);
                        setActiveOrderIndex(0);
                        setCustomerName(mappedOrder.customerName);
                        setNotes(mappedOrder.notes || '---');

                        if (orderData.status === ORDER_STATUS.COMPLETED) {
                            setPaidOrder(mappedOrder);
                            setShowInvoiceInfo(true);
                        }
                    }
                } catch (error) {
                    console.error('Lỗi khi load order từ URL:', error);
                    alert("Không tìm thấy đơn hàng");
                    navigate('/user/sales');
                } finally {
                    setLoadingOrder(false);
                }
            }
        };

        loadOrderFromUrl();
    }, [orderIdParam, navigate]);

    // Load products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await productApi.getAllProducts();
                setProducts(res.result || []);
                setFilteredProducts(res.result || []);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Search product
    useEffect(() => {
        const searchProducts = async () => {
            if (!searchQuery.trim()) {
                setFilteredProducts(products);
                return;
            }

            try {
                setSearchLoading(true);
                const res = await productApi.searchProducts(searchQuery);
                setFilteredProducts(res.result || []);
            } finally {
                setSearchLoading(false);
            }
        };

        const timer = setTimeout(searchProducts, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, products]);

    // Add to order
    const addToOrder = (product: Product) => {
        // ensure there is at least one order (safety)
        if (orders.length === 0) {
            setOrders([createNewOrder(1)]);
            setActiveOrderIndex(0);
        }

        const discount = product.discount ?? 0;
        const discounted = discount > 0 ? product.price - (product.price * discount) / 100 : product.price;
        const discountPerUnit = product.price - discounted;

        const currentOrder = orders[activeOrderIndex];
        const existingItem = currentOrder.items.find(i => i.productId === product.id);

        let updatedItems;

        if (existingItem) {
            updatedItems = currentOrder.items.map(item =>
                item.productId === product.id
                    ? {
                        ...item,
                        quantity: item.quantity + 1,
                        subtotal: (item.quantity + 1) * product.price,
                        discountAmount: (item.quantity + 1) * discountPerUnit,
                        total: (item.quantity + 1) * discounted,
                    }
                    : item
            );
        } else {
            updatedItems = [
                ...currentOrder.items,
                {
                    product,
                    productId: product.id,
                    quantity: 1,
                    subtotal: product.price,
                    discountAmount: discountPerUnit,
                    total: discounted,
                },
            ];
        }

        updateOrder(updatedItems);
    };

    const updateOrder = (items: OrderItem[]) => {
        const totalAfterDiscount = items.reduce((sum, item) => sum + item.total, 0);
        const tax = totalAfterDiscount * 0.1;
        const total = totalAfterDiscount + tax;

        setOrders(prev => {
            const updated = [...prev];
            // safety: if active index out of bounds, use 0
            const idx = activeOrderIndex < updated.length ? activeOrderIndex : 0;
            updated[idx] = {
                ...updated[idx],
                items,
                total,
            };
            return updated;
        });
    };

    const removeFromOrder = (productId: string) => {
        const current = orders[activeOrderIndex];
        if (!current) return;
        const updatedItems = current.items.filter(item => item.productId !== productId);
        updateOrder(updatedItems);
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromOrder(productId);
            return;
        }

        const current = orders[activeOrderIndex];
        if (!current) return;

        const updatedItems = current.items.map(item => {
            if (item.productId === productId && item.product) {
                const discount = item.product.discount ?? 0;
                const discounted = discount > 0
                    ? item.product.price - (item.product.price * discount) / 100
                    : item.product.price;

                const discountPerUnit = item.product.price - discounted;

                return {
                    ...item,
                    quantity,
                    subtotal: quantity * item.product.price,
                    discountAmount: quantity * discountPerUnit,
                    total: quantity * discounted,
                };
            }
            return item;
        });

        updateOrder(updatedItems);
    };

    // send data BE — không có tempCode
    const buildOrderData = (status: string, paymentMethod?: string, transferAmount?: number) => {
        const currentOrder = orders[activeOrderIndex];
        const subtotal = (currentOrder?.items || []).reduce((sum, i) => sum + i.subtotal, 0);
        const discount = (currentOrder?.items || []).reduce((sum, i) => sum + (i.subtotal - i.total), 0);
        const totalAfterDiscount = subtotal - discount;
        const tax = totalAfterDiscount * 0.1;
        const total = totalAfterDiscount + tax;

        return {
            id: currentOrder?.orderId ?? null,
            items: (currentOrder?.items || []).map(item => ({
                productId: item.productId || '',
                productName: item.product?.name || '',
                price: item.product?.price || 0,
                quantity: item.quantity,
                subtotal: item.total,
            })),
            subtotal,
            discount,
            tax,
            total,
            customerName,
            notes,
            status,
            paymentMethod,
            cashAmount: paymentMethod === 'cash' ? total : 0,
            transferAmount: paymentMethod !== 'cash' ? (transferAmount ?? 0) : 0,
        };
    };

    // Save order draft
    const handleSaveOrder = async () => {
        try {
            const currentOrder = orders[activeOrderIndex];
            const payload = buildOrderData(ORDER_STATUS.DRAFT);

            let result;

            if (currentOrder && currentOrder.orderId) {
                result = await orderApi.updateOrder(currentOrder.orderId, payload);
            } else {
                result = await orderApi.submitOrder(payload);
            }

            setOrders(prev => {
                const newOrders = [...prev];
                const idx = activeOrderIndex < newOrders.length ? activeOrderIndex : 0;
                newOrders[idx] = {
                    ...newOrders[idx],
                    orderId: result.data.orderId,
                    code: result.data.code, // update code từ BE
                    status: ORDER_STATUS.DRAFT,
                    createdDate: result.data.createdDate,
                };
                return newOrders;
            });

            alert('Đã lưu nháp!');
        } catch {
            alert('Lỗi khi lưu đơn hàng');
        }
    };

    // thanh toán
    const handleCheckout = async (paymentMethod?: string, transferAmount?: number) => {
        try {
            const currentOrder = orders[activeOrderIndex];
            // Nếu thanh toán tiền mặt → COMPLETED, còn lại → DRAFT (chờ thanh toán thành công)
            const initialStatus = paymentMethod === 'cash' 
                ? ORDER_STATUS.COMPLETED 
                : ORDER_STATUS.DRAFT;
            const payload = buildOrderData(initialStatus, paymentMethod, transferAmount);

            let result;

            if (currentOrder && currentOrder.orderId && currentOrder.status === ORDER_STATUS.DRAFT) {
                result = await orderApi.updateOrder(currentOrder.orderId, payload);
            } else {
                result = await orderApi.submitOrder(payload);
            }

            const orderId = result.data.orderId;
            const code = result.data.code;

            const updatedOrder: Order = {
                ...orders[activeOrderIndex],
                orderId,
                code,    // save code from BE response
                status: initialStatus, // DRAFT hoặc COMPLETED tùy paymentMethod
                paymentMethod,
                createdDate: result.data.createdDate,
            };

            setOrders(prev => {
                const updated = [...prev];
                const idx = activeOrderIndex < updated.length ? activeOrderIndex : 0;
                updated[idx] = updatedOrder;
                return updated;
            });

            localStorage.setItem('pendingPaymentOrderId', String(orderId));
            localStorage.setItem('pendingPaymentMethod', paymentMethod || '');

            if (paymentMethod === 'cash') {
                setPaidOrder(updatedOrder);
                setShowInvoiceInfo(true);
                localStorage.removeItem('pendingPaymentOrderId');
                localStorage.removeItem('pendingPaymentMethod');
            }

            return orderId;
        } catch (err) {
            console.error(err);
            throw err;
        }
    };
    // create invoice
    const handleCreateInvoice = () => {
        window.print();
        handleCancelInvoice();
    };

    // cancel invoice
    const handleCancelInvoice = () => {
        setShowInvoiceInfo(false);
        setPaidOrder(null);
        setOrders([createNewOrder(1)]);
        setActiveOrderIndex(0);
        setCustomerName('Khách lẻ');
        setNotes('---');
    };

    return (
        <div className={`pos-customer ${!sidebarOpen ? 'hidden-sidebar' : ''}`}>
            <div className={`pos-item pos-info ${!sidebarOpen ? 'spread-width' : ''}`}>

                {/* HEADER */}
                <div className="wrap-right-content panel-custom">
                    <ul className="nav nav-tabs">
                        <li className="flex-start-center col-12">
                            <div className="logo-container" onClick={() => navigate('/')}>
                                CosmeticsPOS
                            </div>

                            <div className="search-form-cart">
                                <form className="search-product-order-cart">
                                    <div className="search-input-cart">
                                        <input
                                            type="search"
                                            placeholder="Tìm kiếm sản phẩm..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </form>
                            </div>
                        </li>
                    </ul>

                    {/* PRODUCT LIST */}
                    <div className="pos-stock">
                        <div className="pos-stock-body">
                            <div className="pos-stock-content">
                                <div className="pos-stock-content-container">
                                    {loading || searchLoading ? (
                                        <p>{searchLoading ? 'Đang tìm kiếm...' : 'Đang tải sản phẩm...'}</p>
                                    ) : (
                                        <div className="product-row">
                                            {filteredProducts.map(product => (
                                                <ProductCard
                                                    key={product.id}
                                                    product={product}
                                                    onAddToOrder={addToOrder}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ORDER SUMMARY */}
                {/* safety: only render OrderSummary when we have at least one order and not loading order */}
                {!loadingOrder && orders.length > 0 && orders[activeOrderIndex] && (
                    <OrderSummary
                        order={orders[activeOrderIndex]}
                        orders={orders}
                        activeOrderIndex={activeOrderIndex}
                        customerName={customerName}
                        notes={notes}
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={removeFromOrder}
                        onCheckout={handleCheckout}
                        onSaveOrder={handleSaveOrder}
                        onCustomerNameChange={name => {
                            setCustomerName(name);
                            setOrders(prev => {
                                const updated = [...prev];
                                const idx = activeOrderIndex < updated.length ? activeOrderIndex : 0;
                                updated[idx].customerName = name;
                                return updated;
                            });
                        }}
                        onNotesChange={text => {
                            setNotes(text);
                            setOrders(prev => {
                                const updated = [...prev];
                                const idx = activeOrderIndex < updated.length ? activeOrderIndex : 0;
                                updated[idx].notes = text;
                                return updated;
                            });
                        }}
                        onAddOrder={() => {
                            setOrders(prev => {
                                const newIndex = prev.length + 1;
                                const newOrder = createNewOrder(newIndex);
                                return [...prev, newOrder];
                            });

                            setActiveOrderIndex(prev => prev + 1);
                            setCustomerName('Khách lẻ');
                            setNotes('---');
                        }}
                        onSwitchOrder={index => {
                            setActiveOrderIndex(index);
                            setCustomerName(orders[index]?.customerName || 'Khách lẻ');
                            setNotes(orders[index]?.notes || '---');
                        }}
                        onDeleteOrder={index => {
                            if (orders.length === 1) {
                                alert('Không thể xóa đơn cuối cùng');
                                return;
                            }

                            const newOrders = orders.filter((_, i) => i !== index);
                            setOrders(newOrders);
                            setActiveOrderIndex(0);
                            setCustomerName(newOrders[0]?.customerName || 'Khách lẻ');
                            setNotes(newOrders[0]?.notes || '---');
                        }}
                    />
                )}

                {paidOrder && (
                    <InvoiceInfo
                        order={paidOrder}
                        isOpen={showInvoiceInfo}
                        onCreateInvoice={handleCreateInvoice}
                        onCancel={handleCancelInvoice}
                    />
                )}
            </div>
        </div>
    );
};

export default SalesScreen;
