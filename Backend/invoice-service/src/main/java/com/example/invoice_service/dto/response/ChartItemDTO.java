package com.example.invoice_service.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChartItemDTO {
    private String label;   
    private BigDecimal value;
}