import { api, LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import deleteProducts from '@salesforce/apex/MVNO_B2B_CallCartMethods.deleteProducts';

export default class Mvno_b2b_cartModalCmp extends LightningElement {
    attrValue;
    editAction;
    @track storageOptions = [];
    @track attrOptions = [];
    @track cartItem = [];
    @api action;
    @api registro;
    @api opid;

    connectedCallback() {
        console.log('prod recibido: ',JSON.stringify(this.registro));

        if (this.action) {
            this.editAction = true;
            if (Object.entries(this.registro).length !== 0) {
                this.mapProductValues(this.registro);
            }
            return this.registro;
        } else {
            this.editAction = false;
        }
    }

    deleteCartProduct() {
        let idToD = this.registro.parentId;
        console.log('trae idtoD: ',idToD);
        this.handleToastEvent('Eliminando producto...', '', 'info');
        deleteProducts({ opptyId: this.opid, opptyItemId: idToD })
            .then((res) => {
                if (res.error) {
                    this.handleToastEvent('Algo ha salido mal...', res.error, 'error');
                } else {
                    this.handleToastEvent(
                        'Producto eliminado con exito',
                        'Se ha eliminado el producto con éxito.',
                        'success'
                    );
                    this.sendCloseEvent(false, true);
                }
            })
            .catch((err) => {
                this.handleToastEvent('Algo ha salido mal...', err.body.message, 'error');
            });
    }

    updateCartProduct() {
        try {
            let nuevoObjeto = {};
            let register = JSON.parse(JSON.stringify(this.registro));
            console.log('este es el nuevo register: ',JSON.stringify(register));
            for (const campo in register) {
                nuevoObjeto[campo] = register[campo];
            }

            nuevoObjeto.Attributes.records[1].userValues = this.attrValue;
            console.log('nuevo objeto: ',JSON.stringify(nuevoObjeto));
            this.sendCloseEvent(false, false, nuevoObjeto);
        } catch (error) {
            console.error('check the error', error);
        }
    }

    mapProductValues(registro) {
        console.log("this.registro",this.registro);
        try {            
            let registros = [];
            console.log("esto es registro", JSON.stringify(this.registro))
            const { records } = registro.Attributes;
            for (const key in records) {
                const { label, values, userValues} = records[key];
                if (label !== 'IMEI') {
                    const labelByValue = { label, value: values[0].value, editable: true };
                    if(values.length>=2){
                        values.forEach((attr) => {
                            const attrLabelAndValue = {
                                label: attr.label,
                                value: attr.value
                            };
                            this.attrOptions.push(attrLabelAndValue);
                        });
                        this.attrValue = userValues;
                    }else {
                        registros.push(labelByValue);
                    }
                }
            }
            this.cartItem = registros;
            console.log('este es cartItem: ',JSON.stringify(this.cartItem));
        } catch (error) {
            console.log('fallo en mapProductValues',error);
        }
    }

    closeModal(event) {
        console.log('evento en closemodal',event)
        if (event.keyCode === 27 || event.type === 'click') {
            this.sendCloseEvent(false);
        }
        if (
            event.keyCode === 13 ||
            (event.currentTarget.id === 'save-12' && event.type === 'click')
        ) {
            if (!this.editAction) {
                this.deleteCartProduct();
            } else {
                this.updateCartProduct();
            }
        }
        return;
    }

    sendCloseEvent(toggle, refresh, producto) {
        const toggleDialog = new CustomEvent('closing', {
            detail: {
                toggle: toggle ?? false,
                refresh: refresh ?? false,
                producto: producto ?? [{}]
            }
        });
        console.log('este es el evento: ',toggleDialog);
        this.dispatchEvent(toggleDialog);
    }

    handleToastEvent(title, message, variant) {
        const toast = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(toast);
    }

    handleColorChange(event) {
        this.colorValue = event.target.value;
    }

    get storage() {
        return this.storageOptions;
    }
    get multiOptionsAttr() {
        if (this.attrOptions.length == 0) {
            return false;
        }
        return this.attrOptions;
    }

    get accessibilityState() {
        return this.ariaHidden;
    }
}