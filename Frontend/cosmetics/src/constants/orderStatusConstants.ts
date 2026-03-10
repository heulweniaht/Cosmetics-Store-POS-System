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
  [ORDER_STATUS.DRAFT]: '#6b7280',
  [ORDER_STATUS.COMPLETED]: '#10b981',
  [ORDER_STATUS.CANCELLED]: '#ef4444',
  [ORDER_STATUS.RETURNED]: '#f59e0b'
} as const;

export const getStatusText = (status: string): string => {
  const upperStatus = status.toUpperCase();
  return ORDER_STATUS_LABELS[upperStatus as keyof typeof ORDER_STATUS_LABELS] || status;
};

export const getStatusColor = (status: string): string => {
  const upperStatus = status.toUpperCase();
  return ORDER_STATUS_COLORS[upperStatus as keyof typeof ORDER_STATUS_COLORS] || '#6b7280';
};

export const statusTabs = [
  { key: "all", label: "Tất cả" },
  { key: "incomplete", label: "Chưa hoàn thành" },
  { key: "completed", label: "Đã hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
  { key: "return", label: "Trả hàng" },
];

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

export const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';

  try {
    // Xử lý timestamp Unix (milliseconds hoặc seconds)
    if (typeof dateString === 'number' || /^\d+$/.test(dateString)) {
      const timestamp = typeof dateString === 'number' ? dateString : parseInt(dateString);
      // Kiểm tra nếu là timestamp Unix (seconds) thì chuyển thành milliseconds
      const date = timestamp < 10000000000 ? new Date(timestamp * 1000) : new Date(timestamp);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Xử lý ISO string hoặc date string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';

    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'N/A';
  }
};