package com.example.product_service.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.example.product_service.dto.request.ProductCreationRequest;
import com.example.product_service.dto.request.ProductUpdateRequest;
import com.example.product_service.dto.response.ProductResponse;
import com.example.product_service.entity.Product;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    // Chuyển từ request tạo sản phẩm sang entity
    Product toProduct(ProductCreationRequest request);

    // Chuyển từ entity sang response trả về client
    ProductResponse toProductResponse(Product product);

    // Cập nhật entity từ request update
    @Mapping(target = "id", ignore = true) // không cập nhật id
    void updateProduct(@MappingTarget Product product, ProductUpdateRequest request);
}
