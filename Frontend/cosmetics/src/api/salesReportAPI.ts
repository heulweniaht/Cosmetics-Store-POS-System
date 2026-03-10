import axios from "axios";
import type { Result } from "../types/result.ts";
import type {reportSumary} from "../types/report.ts";
import { API_URL, API_REPORT } from "../constants/apiConstants.ts";

export interface RevenueRequest {
  fromDate?: string; // yyyy-MM-dd format
  toDate?: string;   // yyyy-MM-dd format
}

export interface RevenueData {
  hour: string;
  revenue: number;
}

export interface RevenueResponse {
  data: RevenueData[];
  totalRevenue: number;
  fromDate?: string;
  toDate?: string;
}

export const saleReportApi = {
    /** Lấy báo cáo tổng với optional date range */
    getReportSummary: async (params?: RevenueRequest): Promise<Result<reportSumary>> => {
        // Sửa: API này giờ trỏ đến invoice-service (đã được gateway config)
        const response = await axios.get<Result<reportSumary>>(API_URL + API_REPORT, {
          params: params ? {
            fromDate: params.fromDate,
            toDate: params.toDate
          } : undefined
        });
        return response.data;
    },

    // ✅ Lấy doanh thu theo ngày (daily)
    getDailyRevenue: async (params: RevenueRequest): Promise<RevenueResponse> => {
      try {
        const response = await axios.get(API_URL + API_REPORT + '/daily', {
          params: {
            fromDate: params.fromDate,
            toDate: params.toDate
          }
        });

        // Backend trả BigDecimal → dùng trực tiếp
        const backendData = response.data.data;
        const transformedData = transformDailyDataToHourly(backendData);

        return {
          data: transformedData,
          totalRevenue: backendData || 0,
          fromDate: params.fromDate,
          toDate: params.toDate
        };
      } catch (error) {
        throw error;
      }
    },

    // ✅ Lấy doanh thu theo tháng (monthly)
    getMonthlyRevenue: async (params: RevenueRequest): Promise<RevenueResponse> => {
      try {
        const response = await axios.get(API_URL + API_REPORT + '/monthly', {
          params: {
            fromDate: params.fromDate,
            toDate: params.toDate
          }
        });

        // Backend trả BigDecimal → hiển thị 1 cột duy nhất "Tháng này"
        const backendData = response.data.data;
        const transformedData = transformMonthlyDataToSingleBar(backendData);

        return {
          data: transformedData,
          totalRevenue: backendData || 0,
          fromDate: params.fromDate,
          toDate: params.toDate
        };
      } catch (error) {
        throw error;
      }
    }
}

// ✅ Helper cho daily (vẽ 24 giờ)
const transformDailyDataToHourly = (backendData: any): RevenueData[] => {
  const hourlyData: RevenueData[] = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}h`,
    revenue: 0
  }));

  // Nếu backend chỉ trả số → phân bố ngẫu nhiên 1h nào đó để nhìn thấy cột
  if (typeof backendData === 'number') {
    const randomHour = Math.floor(Math.random() * 24);
    hourlyData[randomHour].revenue = backendData;
  }

  return hourlyData;
};

// ✅ Helper cho monthly (hiển thị 1 cột tổng tháng)
const transformMonthlyDataToSingleBar = (backendData: any): RevenueData[] => {
  if (typeof backendData === 'number') {
    return [{ hour: 'Tháng này', revenue: backendData }];
  }

  // fallback an toàn
  return [{ hour: 'Tháng này', revenue: 0 }];
};
