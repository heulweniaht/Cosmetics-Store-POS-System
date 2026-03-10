package com.example.product_service.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.product_service.entity.Product;
import com.example.product_service.repository.ProductRepository;

@RestController
@RequestMapping("/inventory")
@CrossOrigin(origins = "http://localhost:5173")
public class InventoryController {

    @Autowired
    private ProductRepository productRepository;

    @PostMapping("/update")
    public ResponseEntity<String> updateInventory(@RequestBody List<Map<String, Object>> items) {
        try {
            for (Map<String, Object> item : items) {
                String productId = (String) item.get("productId");
                Integer quantity = (Integer) item.get("quantity");
                Integer operation = (Integer) item.get("operation"); // 1 hoặc -1

                Product product = productRepository
                        .findById(productId)
                        .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

                int newStock = product.getStock() + (quantity * operation);
                if (newStock < 0) {
                    throw new RuntimeException("Insufficient stock for product: " + productId);
                }

                product.setStock(newStock);
                productRepository.save(product);
            }

            return ResponseEntity.ok("Inventory updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating inventory: " + e.getMessage());
        }
    }
}
