package com.example.product_service.dto.response;

import java.math.BigDecimal;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResponse {
    String id;
    String name;
    String image;
    String description;
    String brand;
    String category;
    BigDecimal price;
    Double discount;
    Integer stock;
    String slug;
}
