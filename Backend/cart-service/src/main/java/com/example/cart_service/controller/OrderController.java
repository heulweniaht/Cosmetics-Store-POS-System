package com.example.cart_service.controller;

import com.example.cart_service.dto.request.OrderRequest;
import com.example.cart_service.dto.response.ResultDTO;
import com.example.cart_service.dto.response.OrderResponse;
import com.example.cart_service.service.OrderService;
import org.junit.platform.commons.logging.Logger;
import org.junit.platform.commons.logging.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;


@RestController
@RequestMapping("/orders")
public class OrderController {
    private static final Logger LOG = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ResultDTO> create(@RequestBody OrderRequest orderRequest) throws URISyntaxException {
        LOG.debug(() -> "REST request to save Order : " + orderRequest);
        ResultDTO result = orderService.save(orderRequest);
        // result.getData() now returns OrderResponse, not Order entity
        OrderResponse orderResponse = (OrderResponse) result.getData();
        return ResponseEntity
                .created(new URI("/orders/" + orderResponse.getOrderId()))
                .body(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultDTO> update(@PathVariable Integer id, @RequestBody OrderRequest orderRequest) throws URISyntaxException {
        LOG.debug(() -> "REST request to update Order : " + orderRequest);
        if(orderRequest.getId() == null || !orderRequest.getId().equals(id)) {
            return ResponseEntity.badRequest().build();
        }
        ResultDTO result = orderService.update(orderRequest);
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<ResultDTO> getAllOrders(){
        LOG.debug(() -> "REST request to get all Orders");
        ResultDTO resultDTO = orderService.findAll();
        return ResponseEntity.ok(resultDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResultDTO> getOne(@PathVariable Integer id) {
        LOG.debug(() -> "REST request to get Order : " + id);
        ResultDTO resultDTO = orderService.findOne(id);
        return ResponseEntity.ok(resultDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResultDTO> delete(@PathVariable Integer id) {
        LOG.debug(() -> "REST request to delete Order : " + id);
        orderService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
