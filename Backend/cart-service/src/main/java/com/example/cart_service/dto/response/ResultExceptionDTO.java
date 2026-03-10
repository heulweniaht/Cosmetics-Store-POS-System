package com.example.cart_service.dto.response;

import java.io.Serializable;

public class ResultExceptionDTO implements Serializable {

    private String code;
    private String message;

    public ResultExceptionDTO(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "BaseResultExceptionDTO{" + "code='" + code + '\'' + ", message='" + message + '\'' + '}';
    }
}
