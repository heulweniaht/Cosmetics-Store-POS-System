package com.example.cart_service.dto.response;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Objects;

public class OrderItemResponse {

    @NotNull(message = "Product ID cannot be null")
    private String productId;

    @NotBlank(message = "Product name cannot be blank")
    private String productName;

    @Min(value = 0, message = "Price must be >= 0")
    private double price;

    @Min(value = 1, message = "Quantity must be >= 1")
    private int quantity;

    @Min(value = 0, message = "Subtotal must be >= 0")
    private double subtotal;


    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(double subtotal) {
        this.subtotal = subtotal;
    }

    // equals, hashCode, toString
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrderItemResponse that)) return false;
        return Double.compare(that.price, price) == 0 &&
                quantity == that.quantity &&
                Double.compare(that.subtotal, subtotal) == 0 &&
                Objects.equals(productId, that.productId) &&
                Objects.equals(productName, that.productName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId, productName, price, quantity, subtotal);
    }

    @Override
    public String toString() {
        return "OrderItemDTO{" +
                "productId=" + productId +
                ", productName='" + productName + '\'' +
                ", price=" + price +
                ", quantity=" + quantity +
                ", subtotal=" + subtotal +
                '}';
    }
}
