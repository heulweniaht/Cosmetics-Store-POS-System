import React from 'react';
import type { OrderFiltersProps } from '../../../types/order';
import { statusTabs } from '../../../constants/orderStatusConstants.ts';

export const OrderFilters: React.FC<OrderFiltersProps> = ({
    searchTerm,
    onSearchChange,
    selectedStatus,
    onStatusChange,
    totalOrders = 0
}) => {
    return (
        <>
            {/* Tabs */}
            <div className="orders-management-status-tabs">
                {statusTabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={`orders-management-tab ${
                            selectedStatus === tab.key ? "active" : ""
                        }`}
                        onClick={() => onStatusChange(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search bar */}
            <div className="orders-management-main-content-container">
                <div className="orders-management-search-filter-bar">
                    <div className="orders-management-search-container">
                        <span className="fa fa-search orders-management-search-icon"></span>
                        <input
                            type="text"
                            placeholder="Tên KH, mã ĐH, mã CQT"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="orders-management-search-input"
                        />
                    </div>
                    <div className="orders-management-total-orders">
                        Tổng: <span className="orders-management-total-count">{totalOrders}</span> đơn hàng
                    </div>
                </div>
            </div>
        </>
    );
};