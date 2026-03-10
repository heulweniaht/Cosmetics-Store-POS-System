package com.example.product_service.service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.product_service.dto.request.ProductCreationRequest;
import com.example.product_service.dto.request.ProductUpdateRequest;
import com.example.product_service.dto.response.ProductResponse;
import com.example.product_service.entity.Product;
import com.example.product_service.exception.AppException;
import com.example.product_service.exception.ErrorCode;
import com.example.product_service.mapper.ProductMapper;
import com.example.product_service.repository.ProductRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductService {

    ProductRepository productRepository;
    ProductMapper productMapper;

    // Sinh slug
    private String generateSlug(String input) {
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = normalized.replaceAll("[^\\w-]", "").toLowerCase(Locale.ENGLISH);
        return slug;
    }

    // Tạo mới sản phẩm
    public ProductResponse createProduct(ProductCreationRequest request) {
        Product product = productMapper.toProduct(request);

        // Sinh slug tự động từ tên sản phẩm
        product.setSlug(generateSlug(request.getName()));

        product = productRepository.save(product);
        return productMapper.toProductResponse(product);
    }

    // Lấy danh sách sản phẩm
    public List<ProductResponse> searchProducts(
            String name, String brand, String category, Integer page, Integer size) {
        log.info("Getting products");
        // Nếu có phân trang
        if (page != null && size != null) {
            Pageable pageable = PageRequest.of(page, size);
            return productRepository.searchProducts(name, brand, category, pageable).stream()
                    .map(productMapper::toProductResponse)
                    .toList();
        }

        // Nếu không có phân trang thì lấy toàn bộ
        return productRepository.findProducts(name, brand, category).stream()
                .map(productMapper::toProductResponse)
                .toList();
    }

    public long countProducts(String name, String brand, String category) {
        return productRepository.countProducts(
                name == null || name.isBlank() ? null : name,
                brand == null || brand.isBlank() ? null : brand,
                category == null || category.isBlank() ? null : category);
    }

    // Lấy sản phẩm theo id
    public ProductResponse getProduct(String id) {
        Product product =
                productRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return productMapper.toProductResponse(product);
    }

    // Cập nhật sản phẩm
    public ProductResponse updateProduct(String id, ProductUpdateRequest request) {
        Product product =
                productRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        productMapper.updateProduct(product, request);
        return productMapper.toProductResponse(productRepository.save(product));
    }

    // Xóa sản phẩm
    public void deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        productRepository.deleteById(id);
    }

    // Đếm sản phẩm
    public long countTotalProducts() {
        return productRepository.count();
    }
}


