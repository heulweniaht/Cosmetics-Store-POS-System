export const ORDER_STATUS = {
  DRAFT: 'DRAFT',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED'
} as const;

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.DRAFT]: 'Chưa hoàn thành',
  [ORDER_STATUS.COMPLETED]: 'Đã hoàn thành',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
  [ORDER_STATUS.RETURNED]: 'Đã trả hàng'
} as const;

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.DRAFT]: '#f59e0b',     // Cam (Cảnh báo)
  [ORDER_STATUS.COMPLETED]: '#10b981', // Xanh lá (Thành công)
  [ORDER_STATUS.CANCELLED]: '#ef4444', // Đỏ (Lỗi/Hủy)
  [ORDER_STATUS.RETURNED]: '#6366f1'   // Tím (Trả hàng)
} as const;

export const getStatusText = (status: string): string => {
  if (!status) return 'N/A';
  const upperStatus = status.toUpperCase();
  return ORDER_STATUS_LABELS[upperStatus as keyof typeof ORDER_STATUS_LABELS] || status;
};

export const getStatusColor = (status: string): string => {
  if (!status) return '#6b7280';
  const upperStatus = status.toUpperCase();
  return ORDER_STATUS_COLORS[upperStatus as keyof typeof ORDER_STATUS_COLORS] || '#6b7280';
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN").format(price) + "đ";
};

export const getPaymentMethodText = (paymentMethod?: string) => {
  if (!paymentMethod) return 'Chưa chọn';
  
  const paymentMethods: { [key: string]: string } = {
    'cash': 'Tiền mặt',
    'momo': 'MoMo',
    'bank': 'Ngân hàng',
    'tmck': 'TMCK'
  };
  
  return paymentMethods[paymentMethod] || paymentMethod;
};

export const formatDate = (dateString: string | undefined) => {
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