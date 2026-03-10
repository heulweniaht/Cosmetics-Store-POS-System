
export type PaymentMethod = 'momo' | 'bank' | 'cash' | 'tmck';

export const paymentMethods = [
    {
        id: 'momo' as PaymentMethod,
        name: 'MoMo',
        icon: 'fas fa-mobile-alt',
        description: 'Thanh toán qua ví MoMo'
    },
    {
        id: 'bank' as PaymentMethod,
        name: 'Ngân hàng',
        icon: 'fas fa-university',
        description: 'Chuyển khoản ngân hàng'
    },
    {
        id: 'cash' as PaymentMethod,
        name: 'Tiền mặt',
        icon: 'fas fa-money-bill-wave',
        description: 'Thanh toán bằng tiền mặt'
    },
    {
        id: 'tmck' as PaymentMethod,
        name: 'TMCK',
        icon: 'fas fa-credit-card',
        description: 'Thanh toán kết hợp tiền mặt và chuyển khoản'
    }
];