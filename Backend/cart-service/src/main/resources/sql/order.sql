
USE cartDB;
CREATE TABLE orders (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        code VARCHAR(50) UNIQUE,
                        customer_id INT,
                        user_name VARCHAR(100),
                        customer_name VARCHAR(255),
                        note TEXT,
                        return_reason TEXT,
                        status VARCHAR(50),
                        total_quantity INT,
                        discount_id INT,
                        total_discount DOUBLE,
                        tax_rate DOUBLE,
                        tax_amount DOUBLE,
                        total_amount DOUBLE,
                        payment_method VARCHAR(50),
                        final_price DOUBLE,

                        created_by VARCHAR(50) DEFAULT NULL,
                        created_date TIMESTAMP DEFAULT NULL,
                        last_modified_by VARCHAR(50) DEFAULT NULL,
                        last_modified_date TIMESTAMP DEFAULT NULL

/*                         CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
                       CONSTRAINT fk_discount FOREIGN KEY (discount_id) REFERENCES discounts(id)  */
);
USE cartdb;
ALTER TABLE orders
    ADD COLUMN deleted_by_user BOOLEAN DEFAULT FALSE;
ALTER TABLE orders
    ADD COLUMN cash_amount DOUBLE DEFAULT 0,
ADD COLUMN transfer_amount DOUBLE DEFAULT 0;