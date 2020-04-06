import { LightningElement, wire, api, track } from 'lwc';
import getContacts from '@salesforce/apex/AccountContactController.getContacts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class RelatedContacts extends LightningElement {
    @track formVisible = false;
    @api getIdFromParent;
    @track accountId;
    @track showHover;
    @track contacts;
    @api contactsFromSearch;
    showTitle = true;

    connectedCallback() {
        if( this.getIdFromParent ) {
            this.getContactsData();
        }
        else {
            let contactList = JSON.parse(JSON.stringify(this.contactsFromSearch));
            for(let con of contactList) {
                con['showPop'] = false;
            }
            this.contacts = contactList;
            this.showTitle = false;
        }
        
    }
    getContactsData() {
        getContacts({
            accId : this.getIdFromParent
        })
            .then(result => {
                let contactList = JSON.parse(JSON.stringify(result));
                console.log(contactList);
                for(let con of contactList) {
                    con['showPop'] = false;
                }
                this.contacts = contactList;
            })
            .catch(error => {
                window.console.log(JSON.stringify(error));
            });
    }

    showForm() {
        this.accountId = this.getIdFromParent;
        console.log('My AccountID -->'+this.accountId);
        
        this.formVisible = true;
        
    }
    
    showPop( event ) {
        try{
        this.showHover = true;
        var conId = event.currentTarget.dataset.id;
        console.log('My COntact Id-->'+event.currentTarget.dataset.id);
        let conList = this.contacts;
        for( let con of conList ) {
            if( con.Id == conId ) {
                console.log('in If');
                con['showPop'] = true;
                console.log(JSON.parse(JSON.stringify(this.contacts)));
            }
            else {
                con['showPop'] = false;
            }
        }
        
        //console.log(JSON.parse(JSON.stringify(conList)));
    }catch(e) {
    console.log(e);
    }
    }
    hidePop( event ) {
        var conId = event.currentTarget.dataset.id;
        console.log('On Hide-->'+conId);
        let conList = this.contacts;
        for( let con of conList ) {
            if( con.Id == conId ) {
                con['showPop'] = false;
            }
        }
        this.showHover = false;
    }
    hideForm() {
        this.formVisible = false;
    }
    
    handleSuccess(event) {
        this.formVisible = false;
        const evt = new ShowToastEvent({
            title: "Contact created",
            message: "Record ID: " + event.detail.id,
            variant: "success"
        });
        this.dispatchEvent(evt);
    }
    
}