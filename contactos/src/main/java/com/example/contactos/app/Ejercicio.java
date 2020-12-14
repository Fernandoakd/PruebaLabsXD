package com.example.contactos.app;

import com.example.contactos.entities.Contacto;
import com.example.contactos.entities.Cuenta;
import com.example.contactos.exceptions.QueryLimitExceeded;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class Ejercicio {
    private static int QUERYLIMIT = 200;

    private List<Contacto> filterContactWithAccountId(List<Contacto> contacts){
        List<Contacto> contactsWithAccountId = new ArrayList<Contacto>();
        for(Contacto contacto: contacts){
            if (contacto.getAccountId() != null) {
                contactsWithAccountId.add(contacto);
            }
        }
        return contactsWithAccountId;
    }

    public List<Cuenta> getAccountsFromContacts (List<Contacto> contacts) {
        if (contacts.size() > QUERYLIMIT)
            throw new QueryLimitExceeded("La cantidad de contactos no puede ser mayor a 200.");
        else {
            List<Cuenta> cuentas = new ArrayList<Cuenta>();
            List<Contacto> contactsWithAccountId = filterContactWithAccountId(contacts);
            List<Integer> accountIds = new ArrayList<Integer>();
            for (Contacto contacto : contactsWithAccountId) {
                accountIds.add(contacto.getAccountId());
            }
            cuentas = "[SELECT Name FROM Cuenta WHERE Id IN :accountIds]"
            return cuentas;
        }
    }
}
