package com.example.product_service.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.example.product_service.dto.request.*;
import com.example.product_service.dto.response.ProductResponse;
import com.example.product_service.service.ProductService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductController {

    ProductService productService;

    @PostMapping
    public ApiResponse<ProductResponse> createProduct(@RequestBody @Valid ProductCreationRequest request) {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.createProduct(request))
                .build();
    }

    @GetMapping()
    public ApiResponse<List<ProductResponse>> searchProducts(
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "brand", required = false) String brand,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "page", required = false) Integer page,
            @RequestParam(name = "size", required = false) Integer size) {
        List<ProductResponse> products;
        long total;

        if (page != null && size != null) {
            products = productService.searchProducts(name, brand, category, page, size);
            total = productService.countProducts(name, brand, category);
        } else {
            products = productService.searchProducts(name, brand, category, null, null);
            total = products.size();
        }
        return ApiResponse.<List<ProductResponse>>builder()
                .result(products)
                .total(total)
                .build();
    }

    @GetMapping("/{productId}")
    public ApiResponse<ProductResponse> getProduct(@PathVariable("productId") String productId) {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.getProduct(productId))
                .build();
    }

    @PutMapping("/{productId}")
    public ApiResponse<ProductResponse> updateProduct(
            @PathVariable("productId") String productId, @RequestBody @Valid ProductUpdateRequest request) {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.updateProduct(productId, request))
                .build();
    }

    @GetMapping("/stats/count")
    public ApiResponse<Long> countProducts() {
        return ApiResponse.<Long>builder()
                .result(productService.countTotalProducts())
                .build();
    }

    @DeleteMapping("/{productId}")
    public ApiResponse<String> deleteProduct(@PathVariable("productId") String productId) {
        productService.deleteProduct(productId);
        return ApiResponse.<String>builder().result("Product has been deleted").build();
    }
}
