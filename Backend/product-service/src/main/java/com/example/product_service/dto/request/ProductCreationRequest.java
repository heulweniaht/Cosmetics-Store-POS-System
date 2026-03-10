package com.example.product_service.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductCreationRequest {

    @NotBlank(message = "NAME_REQUIRED")
    @Size(min = 3, max = 100, message = "NAME_INVALID")
    String name;

    String image;

    @NotBlank(message = "DESCRIPTION_REQUIRED")
    @Size(min = 10, message = "DESCRIPTION_TOO_SHORT")
    String description;

    @NotBlank(message = "BRAND_REQUIRED")
    String brand;

    @NotBlank(message = "CATEGORY_REQUIRED")
    String category;

    @NotNull(message = "PRICE_REQUIRED")
    @DecimalMin(value = "0.0", inclusive = false, message = "PRICE_MUST_BE_POSITIVE")
    BigDecimal price;

    @Min(value = 0, message = "DISCOUNT_INVALID")
    @Max(value = 100, message = "DISCOUNT_INVALID")
    Double discount;

    @NotNull(message = "STOCK_REQUIRED")
    @Min(value = 0, message = "STOCK_INVALID")
    Integer stock;

    String slug;
}
