package com.example.ventas.app;

import com.example.ventas.entities.Order;
import com.example.ventas.entities.RelationShip;

import java.util.List;

public class Ejercicio {

    public boolean hasValidCombination(List<Integer> productIds){
        for (Integer productoid: productIds){
            List<RelationShip> relationShips = "[SELECT * FROM RelationShip WHERE RelationedProductIds=productoid OR MainProductId=productoId]";
            if (relationShips.isEmpty()){
                return false;
            }
        } return true;
    }
    public boolean orderIsValid(int idDato){
        Order order = "[SELECT * FROM Order WHERE Id=idDato]";
        if (order.isActive()){
            List<Integer> productIds = "[SELECT ProductId FROM OrderItem WHERE OrderId=idDato]";
            return hasValidCombination(productIds);
        }else{
            return false;
        }
    }
}
