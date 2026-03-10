import type {Product} from "./product.ts";

export interface Order {
    orderId?: number;
    tempId?: number;
    tempCode?: string;
    code: string;
    customerName: string;
    total: number;
    status: string;
    returnReason?: string;
    createdDate?: string;
    items: OrderItem[];
    notes: string;
    paymentMethod?: string;
}

export interface OrderItem {
    product?: Product;
    discountAmount?: number;
    productId?: string;
    productName?: string;
    quantity: number;
    quantityProduct?: number;
    total: number;
    subtotal: number;
    unitPrice?: number;
    price?: number;
    totalPrice?: number;
}

export interface OrderDetailModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onCancelOrder?: (orderId: string | number) => void;
    onDeleteOrder?: (orderId: string | number) => void;
    onReturnOrder?: (orderId: string | number) => void;
}


export interface OrderSubmitData {
    items: {
        productId: string;
        productName: string;
        price: number;
        quantity: number;
        subtotal: number;
    }[];
    id: number | null;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    customerName: string;
    notes: string;
    returnReason?: string;
    status: string;
    paymentMethod?: string;
}

export interface OrderSummaryProps {
    order: Order;
    orders: Order[];
    activeOrderIndex: number;
    customerName: string;
    notes: string;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
    onCheckout: (paymentMethod?: string, transferAmount?: number) => Promise<number | undefined>;  // 👈 Return orderId
    onSaveOrder: () => void;
    onCustomerNameChange: (name: string) => void;
    onNotesChange: (notes: string) => void;
    onAddOrder: () => void;
    onSwitchOrder: (index: number) => void;
    onDeleteOrder: (index: number) => void;
}

export interface OrderTableProps {
    orders: Order[];
    onViewOrder: (order: Order) => void;
    onDeleteOrder?: (id: string | number) => void;
    onContinueOrder: (order: Order) => void;
    formatPrice: (price: number) => string;
    getStatusText: (status: string) => string;
    getStatusColor: (status: string) => string;
    getPaymentMethodText: (paymentMethod?: string) => string;
}

export interface OrderListProps {
    orders: Order[];
    onViewOrder: (order: Order) => void;
    onContinueOrder: (order: Order) => void;
    formatPrice: (price: number) => string;
    getStatusText: (status: string) => string;
    getStatusColor: (status: string) => string;
    getPaymentMethodText: (paymentMethod?: string) => string;
}

export interface OrderFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedStatus: string;
    onStatusChange: (status: string) => void;
    totalOrders: number;
}