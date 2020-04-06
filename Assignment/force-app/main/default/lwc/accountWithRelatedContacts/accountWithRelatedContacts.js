import { LightningElement, wire, api, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountContactController.getAccounts';
import findAccountContacts from '@salesforce/apex/AccountContactController.findAccountContacts';
import getMoreAccounts from '@salesforce/apex/AccountContactController.getMoreAccounts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//import coolIcon from '@salesforce/label/c.Cool_Rating_Document_Link';
//import warmIcon from '@salesforce/label/c.Warm_Rating_Document_Link';
//import hotIcon from '@salesforce/label/c.Hot_Rating_Document_Link';


export default class AccountWithRelatedContacts extends LightningElement {
   
    //@track accountsFull;
    @track accounts = [];
    @track accountContactName;
    @track searchedContacts;
    @track unRelatedContacts;
    @track showUnRelated = false;

    loading = false;
    loadedAccountIds = [];
    searchClicked = false;
    counter = 2;
    /*label = {
        coolIcon,
        warmIcon,
        hotIcon
    };*/

    handleTitleClick(event) {
       

        let accountList = this.accounts;
        for(let acc of accountList) {
            console.log(acc.Id);
            acc['show'] = false;
            //if( acc.Id ) {
                console.log('in acc');
                if(event.target.dataset.id === acc.Id) {
                    acc['show'] = !acc['show'];
                }
            //}
            /*else {
                console.log('in name');
                if(event.target.dataset.name == acc.name) {
                    acc['show'] = !acc['show'];
                }
            }*/
        }
        this.accounts = accountList;
    }


    connectedCallback() {
        this.getAccountsData();
    }

    getAccountsData() {
        this.loading = true;
        getAccounts({
            offset : 10
        })
            .then(result => {
                //console.log(result);
                let accountList = JSON.parse(JSON.stringify(result));
                console.log(accountList);
                for(let acc of accountList) {
                    acc['show'] = false;
                    acc['NA'] = false;
                    if( !acc.Rating ) {
                        acc['NA'] = true;
                    }

                    /*acc['hot'] = false;
                    acc['warm'] = false;
                    acc['cold'] = false;
                    acc['NA'] = false;
                    if( acc.Rating == 'Hot') {
                        acc['hot'] = true;
                    }
                    if( acc.Rating == 'Warm') {
                        acc['warm'] = true;
                    }
                    if( acc.Rating == 'Cold') {
                        acc['cold'] = true;
                    }
                    if( !acc.Rating ) {
                        acc['NA'] = true;
                    }*/
                }
                //this.accountsFull = accountList;
                this.searchClicked = false;
                this.accountContactName = '';
                this.template.querySelector('.searchBtn').disabled = true;
                this.showUnRelated = false;
                this.searchedContacts = null;
                this.unRelatedContacts = null;
                this.accounts = null;
                this.loadedAccountIds = null;
                
                //this.counter = 2;
                if( !this.accounts ) {
                    this.accounts = new Array();
                }
                this.accounts = accountList;
                //this.accounts.push(accountList[i]);
                for( let i = 0 ; i < accountList.length ; i++ ) {
                    
                    if( !this.loadedAccountIds ) {
                        this.loadedAccountIds = new Array();
                    }
                    this.loadedAccountIds.push(accountList[i].Id);
                }
                window.scrollTop(0,0);
                this.loading = false;
            })
            .catch(error => {
                window.console.log(JSON.stringify(error));
                this.loading = false;
            });
    }


    lazyLoading(event) {
        var myDiv = event.currentTarget;
        
        console.log( myDiv.scrollTop + ' '+myDiv.scrollHeight+'---'+myDiv.offsetHeight);
        if( myDiv.scrollTop === (myDiv.scrollHeight - myDiv.offsetHeight) ) {
            //let accountList = this.accountsFull;
                //let count = 2;
                //if ( (this.accounts.length <= accountList.length) && (count > 0) ){
                    
                    this.getMoreAccountsData();
                    /*for( let i = 1; i <= count ; i++ ) {
                        this.accounts.push(accountList[this.counter+i]);
                        loadedAccountIds.push(accountList[this.counter+i].Id);
                        count--;
                    }*/
                    //this.counter = this.counter + 2;
                //}
        }
    }

        getInput(event) {
            if( event.currentTarget.value ) {
                this.accountContactName = event.currentTarget.value;
                this.template.querySelector('.searchBtn').disabled = false;
            }
            else {
                this.template.querySelector('.searchBtn').disabled = true;
            }
            
        }
        getAccountContacts() {
            this.loading = true;
            findAccountContacts( {
                keyWord : this.accountContactName
            })
            .then(result => {
                var accIds = new Array();
                this.searchClicked = true;
                if( result.accounts ) {
                    let accList = JSON.parse(JSON.stringify(result.accounts));
                    for( let acc of accList ) {
                        acc['show'] = false;
                        acc['NA'] = false;
                        if( !acc.Rating ) {
                            acc['NA'] = true;
                        }
                        accIds.push(acc.Id);
                    }
                    this.accounts = accList;
                    this.accountsFull = accList;
                }
                else {
                    this.accounts = null;  
                    //this.accountsFull = null;
                    this.loadedAccountIds = null;
                }
                if( result.contacts ) {
                    let accList = new Array();
                    let conList = JSON.parse(JSON.stringify(result.contacts));
                    let conListUnrelated = new Array();
                    let conListRelated = new Array();
                    console.log(conList);
                    for( let unCon of conList ) {
                        if( !unCon.AccountId ) {
                            conListUnrelated.push(unCon);
                        }
                        else {
                            
                            if( !accIds.includes(unCon.AccountId)  ) {
                                let acc = new Object();
                                acc.Rating = unCon.Account.Rating;
                                acc.Name = unCon.Account.Name;
                                acc.Rating_Icon__c = unCon.Account.Rating_Icon__c;
                                acc.Type = unCon.Account.Type;
                                acc.Phone = unCon.Account.Phone;
                                acc['show'] = true;
                                
                                if( !acc.Rating ) {
                                    acc['NA'] = true;
                                }
                                else {
                                    acc['NA'] = false;
                                }
                                accList.push(acc);
                            }
                           
                            conListRelated.push(unCon);
                        }
                    }
                    this.unRelatedContacts = conListUnrelated;
                    this.searchedContacts = conListRelated;
                    if( this.unRelatedContacts.length > 0 ) {
                        this.showUnRelated = true;
                    }
                    else {
                        this.showUnRelated = false;
                    }
                    if( this.accounts ) {
                        if( accList.length > 0 ) {
                            for(let a of accList ){
                                this.accounts.push(a);
                            }
                        }
                    }
                    else {
                        if( accList.length > 0 ) {
                            this.accounts = accList;
                        }
                    }
                }
                else {
                    this.unRelatedContacts = null;
                    this.searchedContacts = null;
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'No Records Exists',
                            message: 'No Matching Record Exists with this Keyword',
                            variant: 'error',
                        }),
                    );
                }
                
                this.loading = false;
                console.log(result);
                this.error = undefined;
                /*this.dispatchEvent(
                    new ShowToastEvent({
                        title: ' Records Retrieve successfully',
                        message: 'Records Retrieve success',
                        variant: 'success',
                    }),
                );*/
            })
            .catch(error => {
                this.loading = false;
                this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while getting Records',
                        message: error.message,
                        variant: 'error',
                    }),
                );
                this.accounts = undefined;
            });
        } 
        
        getMoreAccountsData() {
            this.loading = true;
            getMoreAccounts({
                accIds : this.loadedAccountIds,
                offset : 10
            })
            .then(result => {
                //console.log(result);
                let accountList = JSON.parse(JSON.stringify(result));
                console.log(accountList);
                for(let acc of accountList) {
                    acc['show'] = false;
                    acc['NA'] = false;
                    if( !acc.Rating ) {
                        acc['NA'] = true;
                    }
                    this.loadedAccountIds.push(acc.Id);
                    this.accounts.push(acc);
                }
                this.loading = false;
            })
            .catch(error => {
                window.console.log(JSON.stringify(error));
                this.loading = false;
            });
        }

}