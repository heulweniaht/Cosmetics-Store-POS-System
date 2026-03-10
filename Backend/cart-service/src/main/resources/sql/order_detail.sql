USE cartDB;
CREATE TABLE order_detail (
                              id INT AUTO_INCREMENT PRIMARY KEY,
                              order_id INT NOT NULL,
                              product_id INT NOT NULL,
                              product_name VARCHAR(255),
                              quantity_product INT,
                              unit_price DECIMAL(18,2),
                              total_price DECIMAL(18,2),
                              discount_amount DECIMAL(18,2),

                              created_by VARCHAR(50) DEFAULT NULL,
                              created_date TIMESTAMP DEFAULT NULL,
                              last_modified_by VARCHAR(50) DEFAULT NULL,
                              last_modified_date TIMESTAMP DEFAULT NULL,

                              CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE

);

ALTER TABLE order_detail
    MODIFY COLUMN product_id VARCHAR(255) NOT NULL;
