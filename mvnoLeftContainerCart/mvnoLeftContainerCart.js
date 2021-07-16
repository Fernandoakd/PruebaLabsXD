import { LightningElement, wire, api, track } from 'lwc';
import getProducts from '@salesforce/apex/MVNO_B2B_CallCartMethods.getProducts';
import addProducts from '@salesforce/apex/MVNO_B2B_CallCartMethods.addProducts';
import createOrder from '@salesforce/apex/MVNO_B2B_CallCartMethods.createOrder';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import cartMessageChannel from '@salesforce/messageChannel/CartMessageChannel__c';
import { CurrentPageReference } from 'lightning/navigation';
import { MessageContext, publish } from 'lightning/messageService';

export default class MvnoLeftContainerCart extends LightningElement {
    productos;
    showSpinner = true;
    errorMessage = '';
    noData = false;
    noDataMessage = '';
    offSetProducts = [];
    @wire(MessageContext)
    messageContext;
    accountId;
    opId;
    @api recordId;

    ///// obtener el Id de la url
    currentPageReference = null;
    urlStateParameters = null;

    /* Params from Url */
    urlId = null;
    urlLanguage = null;
    urlType = null;

    connectedCallback() {
        try {
            this.getOrder();
        } catch (error) {
            console.log('Fallo la llamada al servidor', JSON.stringify(error));
        }
    }
// Obtenemos el contextId desde la URL
    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        if (currentPageReference) {
            this.urlStateParameters = currentPageReference.state;
            this.setParametersBasedOnUrl();
        }
    }

    setParametersBasedOnUrl() {
        this.accountId = this.urlStateParameters.c__ContextId;
    }
//Obtiene o crea una orden para poder llamar a los metodos del carrito.
    getOrder() {
        createOrder({ accountId: this.accountId })
            .then((res) => {
                console.log('funciono res: ', JSON.stringify(res.Order.Id));
                this.opId = res.Order.Id; //opId se va a utilizar para almacenar el ID de la orden.
                this.publishLMS(this.opId);
                this.getData();
            })
            .catch((error) => {
                console.log('Error en getOrder: ', JSON.stringify(error));
            });
    }
//llama al metodo get products para mostrarlos a la izquierda.
    getData() {
        try {
            getProducts({ opptyId: this.opId })
                .then((res) => {
                    console.log('trae el opty id' + JSON.stringify(res));
                    if (!this.showSpinner) {
                        this.changeSpinner();
                    }
                    this.productos = res.Productos;
                    if (this.productos.length > 0) {
                        this.noData = false;
                        console.log('entró2');
                    } else {
                        this.noDataMessage =
                            'NO hay productos para mostrar. Inténtelo mas tarde.';
                        this.noData = true;
                    }
                    if (res.success == 'false') {
                        this.errorMessage =
                            'Algo ha salido mal, inténtalo nuevamente.';
                    } else {
                        this.changeSpinner();
                    }
                })
                .catch((err) => {
                    console.log('ERROR ', err);
                });
        } catch (error) {
            console.log('Error en getData ', error);
        }
    }

    changeSpinner() {
        this.showSpinner = !this.showSpinner;
    }

    postItem(event) {
        try {
            const toast = new ShowToastEvent({
                title: 'Añadiendo producto, espere un momento...',
                message: '',
                variant: 'info'
            });
            this.dispatchEvent(toast);
            let productId = event.target.value;
            //let productId = '123';
            let producto;
            getProducts({ opptyId: this.opId })
                .then((res) => {
                    console.log('res del get: ',JSON.stringify(res));
                    let productos = res.Productos;
                    producto = productos.find((p) => p.productId === productId);
                    let key =
                        producto.actions.addtocart.remote.params.items[0]
                            .itemId;
                    addProducts({ opptyId: this.opId, productId: key })
                        .then((res) => {
                            console.log('res del add: ',JSON.stringify(res))
                            this.publishLMS(null);
                            const toast = new ShowToastEvent({
                                title: 'Producto agregado exitosamente.',
                                message:
                                    'El producto fue agregado exitosamente a la oportunidad.',
                                variant: 'success'
                            });
                            this.dispatchEvent(toast);
                        })
                        .catch((err) => {
                            const toast = new ShowToastEvent({
                                title: 'Error',
                                message: 'Este producto no está disponible.',
                                variant: 'error'
                            });
                            this.dispatchEvent(toast);
                            console.log('ERROR ', err);
                        });
                })
                .catch((err) => {
                    const toast = new ShowToastEvent({
                        title: 'Error',
                        message: 'Este producto no está disponible.',
                        variant: 'error'
                    });
                    this.dispatchEvent(toast);
                    console.log('ERROR ', err);
                });
        } catch (error) {
            console.log('Error en postItem ', error);
        }
    }

//Manda a traves de un mensaje el id de la orden al right container.

    publishLMS(orderID) {
        try {
        console.log('entre en publishLMS');
        let flag = true;
        let message;
        if (orderID) {
            message = {
                avisoRefreshCart: false,
                idDelaOrden: orderID
            };
        } else {
            message = {
                avisoRefreshCart: flag
            };
        }

        publish(this.messageContext, cartMessageChannel, message);
        console.log('Se publicó el mensaje ', message);
            
        } catch (error) {
            console.log('Hubo un error en publishLMS ', error);
        }
    }

    //Capture the event fired from the paginator component

    handlePaginatorChange(event) {
        this.offSetProducts = event.detail;
    }
    get showFilterProducts() {
        if (this.offSetProducts.length > 0) {
            return true;
        } else {
            return false;
            console.info('hoil');
        }
    }
}