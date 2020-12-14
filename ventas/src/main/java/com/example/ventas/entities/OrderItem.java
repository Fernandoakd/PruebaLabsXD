package com.example.ventas.entities;

public class OrderItem {
    private int id;
    private int orderId;
    private int productId;
    private float prince;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public int getProductId() {
        return productId;
    }

    public void setProductId(int productId) {
        this.productId = productId;
    }

    public float getPrince() {
        return prince;
    }

    public void setPrince(float prince) {
        this.prince = prince;
    }
}
