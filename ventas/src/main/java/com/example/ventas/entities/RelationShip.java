package com.example.ventas.entities;

public class RelationShip {
    private int id;
    private int mainProductId;
    private int relationedProductId;
    private String type;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getMainProductId() {
        return mainProductId;
    }

    public void setMainProductId(int mainProductId) {
        this.mainProductId = mainProductId;
    }

    public int getRelationedProductId() {
        return relationedProductId;
    }

    public void setRelationedProductId(int relationedProductId) {
        this.relationedProductId = relationedProductId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
