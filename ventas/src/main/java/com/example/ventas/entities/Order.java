package com.example.ventas.entities;

import java.util.Date;

public class Order {
    private int id;
    private Date createDate;
    private boolean status;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public boolean isActive() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }
}
