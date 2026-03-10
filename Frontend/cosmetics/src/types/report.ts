
// export interface reportSumary {
//     totalRevenue : number;
//     totalRevenueDisplay : number;
//     revenueDaily : number;
//     revenueMonth : number;
//     totalOrders : number;
//     totalQuantityProduct : number;
//     totalOrdersReturned : number;
// }

export interface reportSumary {
    totalRevenue: number;
    totalRevenueDisplay: string; // Đây là số "triệu?
    revenueDaily: number;
    revenueMonth: number;
    totalOrders: number;
    totalQuantityProduct: number; // Tổng sản phẩm đã bán
    totalOrdersReturned: number;
}