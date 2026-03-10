import React from 'react';
import type { OrderFiltersProps } from '../../types/order.ts';
import { statusTabs } from "../../constants/orderStatusConstants.ts";

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange
}) => {

  return (
    <>
      <div className="status-tabs">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${selectedStatus === tab.key ? "active" : ""}`}
            onClick={() => onStatusChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="main-content-container">
        <div className="search-filter-bar">
          <div className="search-container">
            <span className="fa fa-search search-icon"></span>
            <input
              type="text"
              placeholder="Tên KH, mã ĐH, mã CQT"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>
    </>
  );
};
