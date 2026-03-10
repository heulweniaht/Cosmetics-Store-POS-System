package com.example.payment_service.cotroller;

import com.example.payment_service.model.MomoPaymentRequest;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/momo-payment")
public class MomoPaymentController {

    private static final String ACCESS_KEY = "F8BBA842ECF85";
    private static final String SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
    private static final String PARTNER_CODE = "MOMO";
    private static final String BASE_REDIRECT_URL = "http://localhost:5173/user/sales";
    private static final String BASE_IPN_URL = "http://localhost:5173/user/sales";

    @PostMapping()
    public ResponseEntity<?> createMomoPayment(@RequestBody MomoPaymentRequest request) {
        try {
            // Validate request
            if (request == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("error", "Request body is required"));
            }
            if (request.getOrderInfo() == null || request.getOrderInfo().trim().isEmpty()) {
                request.setOrderInfo("Order payment");
            }
            if (request.getAmount() == null || request.getAmount() <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("error", "Amount must be greater than 0"));
            }
            if (request.getOrderId() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("error", "OrderId is required"));
            }

            // Dùng orderId từ request (orderId của hệ thống)
            Integer systemOrderId = request.getOrderId();
            
            // Tạo orderId cho MoMo (phải unique cho MoMo)
            String momoOrderId = PARTNER_CODE + System.currentTimeMillis();
            String requestId = momoOrderId;
            String orderInfo = request.getOrderInfo();
            long amount = request.getAmount();

            // Tạo redirect URL và IPN URL với orderId của hệ thống
            String redirectUrl = BASE_REDIRECT_URL + "/" + systemOrderId;
            String ipnUrl = BASE_IPN_URL + "/" + systemOrderId;

            System.out.println("MoMo Payment Request - System OrderId: " + systemOrderId + ", OrderInfo: " + orderInfo + ", Amount: " + amount);
            System.out.println("Redirect URL: " + redirectUrl);
            System.out.println("IPN URL: " + ipnUrl);

            // rawSignature - KHÔNG encode URL (MoMo yêu cầu URL raw, không encode)
            String rawSignature = "accessKey=" + ACCESS_KEY +
                    "&amount=" + amount +
                    "&extraData=" +
                    "&ipnUrl=" + ipnUrl +
                    "&orderId=" + momoOrderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + PARTNER_CODE +
                    "&redirectUrl=" + redirectUrl +
                    "&requestId=" + requestId +
                    "&requestType=captureWallet";

            String signature = hmacSHA256(rawSignature, SECRET_KEY);

            Map<String, Object> body = new HashMap<>();
            body.put("partnerCode", PARTNER_CODE);
            body.put("partnerName", "Test");
            body.put("storeId", "MomoTestStore");
            body.put("requestId", requestId);
            body.put("amount", String.valueOf(amount));
            body.put("orderId", momoOrderId);  // MoMo orderId
            body.put("orderInfo", orderInfo);
            body.put("redirectUrl", redirectUrl);  // URL có systemOrderId
            body.put("ipnUrl", ipnUrl);  // URL có systemOrderId
            body.put("lang", "vi");
            body.put("requestType", "captureWallet");
            body.put("autoCapture", true);
            body.put("extraData", "");
            body.put("signature", signature);

            // Configure RestTemplate with timeout
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout((int) TimeUnit.SECONDS.toMillis(10));
            factory.setReadTimeout((int) TimeUnit.SECONDS.toMillis(30));
            RestTemplate restTemplate = new RestTemplate(factory);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(body, headers);

            String momoEndpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
            System.out.println("Calling MoMo API: " + momoEndpoint);
            System.out.println("Request body: " + body);

            ResponseEntity<Map> momoResponse = restTemplate.postForEntity(URI.create(momoEndpoint), httpEntity, Map.class);

            System.out.println("MoMo Response Status: " + momoResponse.getStatusCode());
            System.out.println("MoMo Response Body: " + momoResponse.getBody());

            if (momoResponse.getStatusCode().is2xxSuccessful()) {
                Map<String, Object> responseBody = momoResponse.getBody();
                if (responseBody != null && responseBody.containsKey("payUrl")) {
                    String payUrl = (String) responseBody.get("payUrl");
                    System.out.println("MoMo Payment URL created: " + payUrl);
                    return ResponseEntity.ok(Collections.singletonMap("payUrl", payUrl));
                } else {
                    System.err.println("MoMo response missing payUrl. Response: " + responseBody);
                    return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                            .body(Collections.singletonMap("error", "MoMo response missing payUrl: " + responseBody));
                }
            } else {
                System.err.println("MoMo API returned error. Status: " + momoResponse.getStatusCode() + ", Body: " + momoResponse.getBody());
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Collections.singletonMap("error", "Failed to create MoMo payment. Status: " +
                                momoResponse.getStatusCode() + ", Response: " + momoResponse.getBody()));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Server error: " + e.getMessage() +
                            (e.getCause() != null ? " - Cause: " + e.getCause().getMessage() : "")));
        }
    }

    private String hmacSHA256(String data, String key) throws Exception {
        Mac hmacSha256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "HmacSHA256");
        hmacSha256.init(secretKey);
        byte[] hash = hmacSha256.doFinal(data.getBytes());
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}