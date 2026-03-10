package com.example.product_service.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.product_service.entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    // Tìm sản phẩm theo slug (để hiển thị chi tiết)
    Optional<Product> findBySlug(String slug);

    // Kiểm tra sản phẩm đã tồn tại chưa
    boolean existsByName(String name);

    @Query(
            """
		SELECT p FROM Product p
		WHERE (:name IS NULL OR :name = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')))
			AND (:brand IS NULL OR :brand = '' OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :brand, '%')))
			AND (:category IS NULL OR :category = '' OR LOWER(p.category) LIKE LOWER(CONCAT('%', :category, '%')))
		""")
    Page<Product> searchProducts(
            @Param("name") String name,
            @Param("brand") String brand,
            @Param("category") String category,
            Pageable pageable);

    @Query(
            """
		SELECT p FROM Product p
		WHERE (:name IS NULL OR :name = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')))
			AND (:brand IS NULL OR :brand = '' OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :brand, '%')))
			AND (:category IS NULL OR :category = '' OR LOWER(p.category) LIKE LOWER(CONCAT('%', :category, '%')))
		""")
    List<Product> findProducts(
            @Param("name") String name, @Param("brand") String brand, @Param("category") String category);

    @Query(
            """
		SELECT COUNT(p) FROM Product p
		WHERE (:name IS NULL OR :name = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')))
		AND (:brand IS NULL OR :brand = '' OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :brand, '%')))
		AND (:category IS NULL OR :category = '' OR LOWER(p.category) LIKE LOWER(CONCAT('%', :category, '%')))
	""")
    long countProducts(@Param("name") String name, @Param("brand") String brand, @Param("category") String category);
}
