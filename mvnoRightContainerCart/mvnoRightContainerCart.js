import { api, LightningElement, track, wire } from 'lwc';
import { MessageContext, subscribe, APPLICATION_SCOPE } from 'lightning/messageService';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import CMC from '@salesforce/messageChannel/CartMessageChannel__c';
import getProductsFromOpportunity from '@salesforce/apex/MVNO_B2B_CallCartMethods.getProductsFromOpportunity';
import getCart from '@salesforce/apex/MVNO_B2B_CallCartMethods.getCart';
import updateProducts from '@salesforce/apex/MVNO_B2B_CallCartMethods.updateProducts';

export default class MvnoRightContainerCart extends NavigationMixin(LightningElement) {
    //VARIABLES
    showSpinner = true;
    @track productos = [];
    @wire(MessageContext) messageContext;
    subscription = null;
    flag = false;
    buttonName = 'Guardar';
    currentOpp;
    actives = []; //simplemente esta variable esta para indicar al accordion que deje abierta las pestañas de la orden
    showModal = false;
    isEdit;
    registro;
    newRegistro;
    @track oldOrder = [];
    opId;
    quoteCreated;
    largoURL;

    //METODOS
    connectedCallback() {
        try {
            this.subscribeMC();
        } catch {
        console.log('RightContainer: Fallo la llamada al servidor');
        }
    }

    handleToastEvent(title, message, variant) {
        const toast = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(toast);
    }

    getData() {
        getProductsFromOpportunity({ opptyId: this.opId })
            .then((res) => {
                console.log('Llega a rightContainer esto: ',JSON.stringify(res))
                if (!this.showSpinner) {
                    this.changeSpinner();
                }
                if (res.Products) { //res.Products
                    this.productos = res.Products.Parent.slice(); //res.Products.Parent.slice();
                    console.log("nos llega...", JSON.stringify(this.productos));
                    this.productos.forEach((p) => {
                        if (p.Id) {
                            this.actives.push(p.Id.toString());
                            let newObject = {
                                id: p.Id, //id:p.Id
                                quantity: Number(p.Quantity) //quantity: Number(p.Quantity)
                            };
                            this.oldOrder.push(newObject);
                        }//PROBABLEMENTE TENGAMOS QUE CREAR UNA VARIABLE DE PRODUCTOS HIJOS
                            // POR CADA PRODUCTO PADRE, PARA HACER SLICE, Y PODER TRABAJAR
                            // DESDE EL TEMPLATE
                    });
                } else {
                    this.productos = [];
                }
                this.getOppInfo();
            })
            .catch((err) => {
                console.log('Ha ocurrido un error en getData ', err);
            });
    }
    
    getOppInfo() {
        getCart({ opptyId: this.opId })
            .then((res) => {
                this.currentOpp = res.records[0].details.records[0];
                this.changeSpinner();
            })
            .catch((err) => {
                console.log('Ha ocurrido un error en getOppInfo ', err);
            });
    }

    delayTimeout = setTimeout(() => {});
    changeQuantity(event) {
        try {
            let idProducto = event.target.name;
            let cantidad = parseInt(event.target.value).toFixed(2);
            window.clearTimeout(this.delayTimeout);

            this.delayTimeout = setTimeout(() => {
                for (let i = 0; i < this.productos.length; i++) {
                    if (this.productos[i].Id.value === idProducto) {
                        this.productos[i].Quantity.value = parseFloat(cantidad);
                    }
                }
                this.compareCarts();
            }, 800);
        } catch (error) {
            console.log('Error changeQuantity', error);
        }
    }

    compareCarts() {
        try {
            let flag = false;
            this.productos.forEach((element, index) => {
                if (Number(element.Quantity) !== this.oldOrder[index].quantity) {
                    flag = true;
                }
            });
            if (flag) {
                this.buttonName = 'Guardar'; //Actualizar Orden
            } else {
                this.buttonName = 'Guardar';
            }
        } catch (error) {
            console.log('Error en carrito ', error);
        }
    }

    isSubmiting = false;

//Redireccion a Home
    navigateToObjectHome() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Home'
            }
        });
    }

    //////////
    saveOrder(){
        this.handleToastEvent('Exito', 'Orden actualizada con éxito.', 'success');
        this.navigateToObjectHome();
        this.isSubmiting = false;
    }
    //////////

    changeSpinner() {
        this.showSpinner = !this.showSpinner;
    }
//Recibe el mensaje que envia LeftContainer. 
    subscribeMC() {
        try {
            if (this.subscription) {
                return;
            }
            this.subscription = subscribe(
                this.messageContext,
                CMC,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        } catch (error) {
            console.log('ERROR en suscripcion ', error);
        }
    }

    handleMessage(message) {
        try {
            if(message.idDelaOrden){
               this.opId = message.idDelaOrden;
            this.flag = message.avisoRefreshCart;
            this.getData();  
            }
            if (message.avisoRefreshCart) {
                this.getData();
                this.flag = false;
            }
        } catch (error) {
            this.showToast(this.label.Error100 + ' 65', error.message, 'error');
        }
    }

    handleDialogToggle(event) {
        try {
            this.registro = event.target.value;
            console.log('evento refresh?: ',event.detail.refresh)
            console.log("this.registro trae", this.registro);
            if (event.target.name == 'configure' || event.target.name == 'delete') {
                this.isEdit = event.target.name === 'configure' ? true : false;
                this.showModal = true;
            } else {
                this.showModal = event.detail.toggle;
                this.newRegistro = event.detail?.producto ?? null;
                for (let i = 0; i < this.productos.length; i++) {
                    if (this.productos[i].Id.value === this.newRegistro.Id?.value) {
                        this.productos[i] = this.newRegistro;
                    }
                }
            }
            if (event?.detail.refresh) {
                this.getData();
            }
        } catch (error) {
            console.error('error assigning data:', error);
        }
    }
}