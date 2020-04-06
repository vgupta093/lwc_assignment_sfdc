public with sharing class AccountContactController {

    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts( String accId ) {
        try{
            if( !String.isBlank( accId ) ) {
               return [ SELECT Id,
                               Name,
                               Title,
                               Phone,
                               Email 
                        FROM Contact 
                        WHERE AccountId =: accId ];
            }
            return null;
        } catch( QueryException q ) {
            return null;
        }
    }
    
    
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts( Integer offset ) {
        try{
           return [ SELECT Id,
                           Name,
                           Type,
                           Phone,
                           Rating,
                           Rating_Icon__c
                    FROM Account
                    LIMIT :offset 
                    ];
        } catch( QueryException q ) {
            system.debug('My Exception:::'+q);
            return null;
        }
    }

    @AuraEnabled(cacheable=true)
    public static AccountContactWrapper findAccountContacts( String keyWord ) {
        system.debug('Keyword-->'+keyWord);
        Map<String,List<Id>> mapSObjectNameToListIds = new Map<String,List<Id>>();
        AccountContactWrapper acWrap = null;
        if( !String.isBlank( keyWord ) ) {
            

            List<List<sObject>> searchList =  [ FIND :keyWord IN NAME FIELDS RETURNING Contact(Id),Account(Id) ]; 
            
            Contact[] searchContacts = (Contact[])searchList[0];
            Account[] searchAccounts = (Account[])searchList[1];
            
            for (Account a : searchAccounts) {
                if( !mapSObjectNameToListIds.containsKey('Account') ) {
                    mapSObjectNameToListIds.put('Account', new List<Id>());
                }
                mapSObjectNameToListIds.get('Account').add(a.Id);
            }
            for (Contact con : searchContacts) {
                if( !mapSObjectNameToListIds.containsKey('Contact') ) {
                    mapSObjectNameToListIds.put('Contact',new List<Id>());
                }
                mapSObjectNameToListIds.get('Contact').add(con.Id);
            }
            system.debug('Map-->'+mapSObjectNameToListIds);
        }
        if( mapSObjectNameToListIds != null ) {
            List<Account> accList = null;
            List<Contact> conList = null;
            if( mapSObjectNameToListIds.containsKey('Account') ) {
                accList = new List<Account>( [ SELECT Id,
                                                      Name,
                                                      Type,
                                                      Phone,
                                                      Rating,
                                                      ( SELECT Id,
                                                               Name,
                                                               Title,
                                                               Phone,
                                                               Email 
                                                        FROM Contacts
                                                       )    
                                               FROM Account 
                                               WHERE Id IN: mapSObjectNameToListIds.get('Account')
                                             ] );
                                             System.debug('accList---->'+accList);
            }
            if( mapSObjectNameToListIds.containsKey('Contact') ) {
                conList = new List<Contact>( [ SELECT Id,
                                                      Name,
                                                      Title,
                                                      Phone,
                                                      Email,
                                                      AccountId,
                                                      Account.Type,
                                                      Account.Name,
                                                      Account.Phone,
                                                      Account.Rating,
                                                      Account.Rating_Icon__c 
                                               FROM Contact
                                               WHERE Id IN: mapSObjectNameToListIds.get('Contact')
                                             ] );
                                             System.debug('conList---'+conList);
            }
            acWrap = new AccountContactWrapper( accList, conList );
            System.debug('acWrap--'+acWrap);
        }
        return acWrap;
    }

    @auraEnabled(cacheable=true)
    public static List<Account> getMoreAccounts( List<Id> accIds, Integer offset ) {
        try{
            return [ SELECT Id,
                            Name,
                            Type,
                            Phone,
                            Rating,
                            Rating_Icon__c
                     FROM Account 
                     WHERE Id NOT IN: accIds
                     LIMIT :offset
                     ];
         } catch( QueryException q ) {
             system.debug('My Exception:::'+q);
             return null;
         }
    }

    public class AccountContactWrapper {
        @AuraEnabled public List<Account> accounts;
        @AuraEnabled public List<Contact> contacts;

        public AccountContactWrapper( List<Account> accounts, List<Contact> contacts ) {
            this.accounts = accounts;
            this.contacts = contacts;
        }
    }
}