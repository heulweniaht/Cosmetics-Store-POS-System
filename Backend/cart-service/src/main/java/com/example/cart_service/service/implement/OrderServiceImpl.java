package com.example.cart_service.service.implement;

import com.example.cart_service.dto.response.OrderItemResponse;
import com.example.cart_service.dto.response.OrderResponse;
import com.example.cart_service.dto.request.OrderRequest;
import com.example.cart_service.dto.response.ResultDTO;
import com.example.cart_service.entity.OrderDetail;
import com.example.cart_service.service.OrderService;
import com.example.cart_service.entity.Order;
import com.example.cart_service.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.cart_service.mapper.OrderMapper;
import com.example.cart_service.service.redis.RedisService;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final RedisService redisService;
    private final RestTemplate restTemplate;

    private static final String INVOICE_SERVICE_URL = "http://localhost:8089/invoices/create";
    private static final String INVENTORY_SERVICE_URL = "http://localhost:8085/inventory/update";

    public OrderServiceImpl(OrderRepository orderRepository, OrderMapper orderMapper, RedisService redisService, RestTemplate restTemplate) {
        this.redisService = redisService;
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
        this.restTemplate = restTemplate;
    }

    @Override
    @Transactional
    public ResultDTO save(OrderRequest orderRequest) {
        Order order = orderMapper.toEntity(orderRequest);
        String code = redisService.genCode("DH");
        order.setCode(code);
        order = orderRepository.save(order);

        if ("COMPLETED".equals(orderRequest.getStatus())) {
            if (orderRequest.getItems() != null && !orderRequest.getItems().isEmpty()) {
                updateInventory(orderRequest.getItems());
            }
            sendInvoiceCreateRequest(order, "COMPLETED");
        }
        else if (orderRequest.getItems() != null && !orderRequest.getItems().isEmpty()) {
            updateInventory(orderRequest.getItems());
        }

        OrderResponse orderResponse = orderMapper.toDTO(order);
        return new ResultDTO("success", "lưu đơn hàng thành công", true, orderResponse, 1);
    }

    @Override
    public ResultDTO update(OrderRequest orderRequest) {
        Order existingOrder = orderRepository.findById(orderRequest.getId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String oldStatus = existingOrder.getStatus();
        String newStatus = orderRequest.getStatus();

        existingOrder = orderMapper.updateEntity(orderRequest, existingOrder);
        existingOrder = orderRepository.save(existingOrder);

        if (!oldStatus.equals(newStatus)) {

            if ("COMPLETED".equals(newStatus)) {
                sendInvoiceCreateRequest(existingOrder, "COMPLETED");
            }

            else if ("COMPLETED".equals(oldStatus) && ("CANCELLED".equals(newStatus) || "RETURNED".equals(newStatus))) {

                if (existingOrder.getOrderDetails() != null && !existingOrder.getOrderDetails().isEmpty()) {
                    returnInventory(existingOrder.getOrderDetails());
                }

                sendInvoiceCreateRequest(existingOrder, newStatus);
            }

            else if ("DRAFT".equals(oldStatus) && "CANCELLED".equals(newStatus)) {
                if (existingOrder.getOrderDetails() != null && !existingOrder.getOrderDetails().isEmpty()) {
                    returnInventory(existingOrder.getOrderDetails());
                }
            }
        }

        OrderResponse orderResponse = orderMapper.toDTO(existingOrder);
        return new ResultDTO("success", "update đơn hàng thành công", true, orderResponse, 1);
    }

    private void sendInvoiceCreateRequest(Order order, String invoiceType) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("orderId", order.getId());
            payload.put("code", order.getCode());
            payload.put("invoiceType", invoiceType); // COMPLETED, RETURNED, ...
            payload.put("customerName", order.getCustomerName());
            payload.put("totalAmount", order.getFinalPrice());
            payload.put("paymentMethod", order.getPaymentMethod());

            List<Map<String, Object>> detailList = new ArrayList<>();
            if (order.getOrderDetails() != null) {
                for (OrderDetail d : order.getOrderDetails()) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("productId", d.getProductId());
                    item.put("productName", d.getProductName());
                    item.put("quantity", d.getQuantityProduct());
                    item.put("unitPrice", d.getUnitPrice());
                    detailList.add(item);
                }
            }
            payload.put("items", detailList);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            restTemplate.postForEntity(INVOICE_SERVICE_URL, entity, ResultDTO.class);

        } catch (Exception e) {
            System.err.println("Lỗi khi gọi Invoice Service: " + e.getMessage());
        }
    }

    private void updateInventory(List<OrderItemResponse> items) {
        try {
            List<Map<String, Object>> inventoryItems = new ArrayList<>();
            for (OrderItemResponse item : items) {
                Map<String, Object> inventoryItem = new HashMap<>();
                inventoryItem.put("productId", item.getProductId());
                inventoryItem.put("quantity", item.getQuantity());
                inventoryItem.put("operation", -1); // Trừ kho
                inventoryItems.add(inventoryItem);
            }
            callInventoryService(inventoryItems);
        } catch (Exception e) {
            System.err.println("Failed to update inventory: " + e.getMessage());
        }
    }

    private void returnInventory(List<OrderDetail> orderDetails) {
        try {
            List<Map<String, Object>> inventoryItems = new ArrayList<>();
            for (OrderDetail detail : orderDetails) {
                Map<String, Object> inventoryItem = new HashMap<>();
                inventoryItem.put("productId", detail.getProductId());
                inventoryItem.put("quantity", detail.getQuantityProduct());
                inventoryItem.put("operation", 1); // Cộng lại kho
                inventoryItems.add(inventoryItem);
            }
            callInventoryService(inventoryItems);
        } catch (Exception e) {
            System.err.println("Failed to return inventory: " + e.getMessage());
        }
    }

    private void callInventoryService(List<Map<String, Object>> inventoryItems) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<List<Map<String, Object>>> entity = new HttpEntity<>(inventoryItems, headers);
        restTemplate.exchange(INVENTORY_SERVICE_URL, HttpMethod.POST, entity, String.class);
    }

    @Override
    @Transactional
    public ResultDTO delete(Integer id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if(!"DRAFT".equals(order.getStatus())) {
            throw new RuntimeException("Only DRAFT orders can be deleted");
        }
        orderRepository.delete(order);
        return new ResultDTO("success", "xoá đơn hàng thành công", true);
    }

    @Override
    @Transactional(readOnly = true)
    public ResultDTO findOne(Integer id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        OrderResponse orderResponse = orderMapper.toDTO(order);
        return new ResultDTO("success", "Lấy đơn hàng thành công", true, orderResponse, 1);
    }

    @Override
    @Transactional(readOnly = true)
    public ResultDTO findAll() {
        List<Order> orders = orderRepository.findAll();
        List<OrderResponse> orderResponses = orders.stream()
                .map(orderMapper::toDTO)
                .collect(Collectors.toList());
        return new ResultDTO("success", "Lấy danh sách đơn hàng thành công", true, orderResponses);
    }
}