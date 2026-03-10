import React from 'react';
import type { OrderTableProps } from '../../types/order.ts';
import { OrderList } from './OrderList.tsx';

export const OrderTable: React.FC<OrderTableProps> = ({
                                                        orders,
                                                        onViewOrder,
                                                        onContinueOrder,
                                                        formatPrice,
                                                        getStatusText,
                                                        getStatusColor,
                                                        getPaymentMethodText
                                                      }) => {
  return (
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
          <tr>
            <th>STT</th>
            <th>Mã đơn hàng</th>
            <th>Thông tin KH</th>
            <th>Ngày tạo</th>
            <th>Mã cơ quan thuế</th>
            <th>Tổng tiền</th>
            <th>Hình thức TT</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
          </thead>
          <tbody>
          <OrderList
              orders={orders}
              onViewOrder={onViewOrder}
              onContinueOrder={onContinueOrder}
              formatPrice={formatPrice}
              getStatusText={getStatusText}
              getStatusColor={getStatusColor}
              getPaymentMethodText={getPaymentMethodText}
          />
          </tbody>
        </table>
      </div>
  );
};
