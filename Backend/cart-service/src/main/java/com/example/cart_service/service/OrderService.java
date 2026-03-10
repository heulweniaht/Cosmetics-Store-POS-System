package com.example.cart_service.service;

import com.example.cart_service.dto.request.OrderRequest;
import com.example.cart_service.dto.response.ResultDTO;

public interface OrderService {
    ResultDTO save(OrderRequest orderRequest);

    ResultDTO update(OrderRequest orderRequest);

    ResultDTO delete(Integer id);

    ResultDTO findOne(Integer id);

    ResultDTO findAll();

}
