package com.example.cart_service.dto.request;

import com.example.cart_service.dto.response.OrderItemResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Objects;

public class OrderRequest {

    @Valid
    @NotNull
    private List<OrderItemResponse> items;

    @NotNull
    private Integer id;

    @Min(0)
    private double subtotal;

    @Min(0)
    private double discount;

    @Min(0)
    private double tax;

    @Min(0)
    private double total;

    private String customerName;

    private String notes;

    private String status;

    private String returnReason;

    private String paymentMethod;

    private Double cashAmount;

    private Double transferAmount;

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public @NotNull Integer getId() {
        return id;
    }

    public void setId(@NotNull Integer id) {
        this.id = id;
    }

    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(double subtotal) {
        this.subtotal = subtotal;
    }

    public double getDiscount() {
        return discount;
    }

    public void setDiscount(double discount) {
        this.discount = discount;
    }

    public double getTax() {
        return tax;
    }

    public void setTax(double tax) {
        this.tax = tax;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReturnReason() {return returnReason;}

    public void setReturnReason(String returnReason) {
        this.returnReason = returnReason;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Double getCashAmount() {
        return cashAmount;
    }

    public void setCashAmount(Double cashAmount) {
        this.cashAmount = cashAmount;
    }

    public Double getTransferAmount() {
        return transferAmount;
    }

    public void setTransferAmount(Double transferAmount) {
        this.transferAmount = transferAmount;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderRequest that = (OrderRequest) o;
        return Double.compare(subtotal, that.subtotal) == 0 && Double.compare(discount, that.discount) == 0 && Double.compare(tax, that.tax) == 0 && Double.compare(total, that.total) == 0 && Objects.equals(items, that.items) && Objects.equals(id, that.id) && Objects.equals(customerName, that.customerName) && Objects.equals(notes, that.notes) && Objects.equals(status, that.status) && Objects.equals(returnReason, that.returnReason) && Objects.equals(paymentMethod, that.paymentMethod);
    }

    @Override
    public int hashCode() {
        return Objects.hash(items, id, subtotal, discount, tax, total, customerName, notes, status, returnReason, paymentMethod);
    }

    @Override
    public String toString() {
        return "OrderSubmitDTO{" +
                "items=" + items +
                ", id=" + id +
                ", subtotal=" + subtotal +
                ", discount=" + discount +
                ", tax=" + tax +
                ", total=" + total +
                ", customerName='" + customerName + '\'' +
                ", notes='" + notes + '\'' +
                ", status='" + status + '\'' +
                ", returnReason='" + returnReason + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                '}';
    }
}
