package com.example.product_service.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductUpdateRequest {

    @Size(min = 2, message = "PRODUCT_NAME_INVALID")
    String name;

    String image;

    String description;

    String brand;

    String category;

    @PositiveOrZero(message = "PRICE_INVALID")
    BigDecimal price;

    @PositiveOrZero(message = "DISCOUNT_INVALID")
    Double discount;

    @PositiveOrZero(message = "STOCK_INVALID")
    Integer stock;

    String slug;
}
