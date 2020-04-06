"use strict";
var jforce = require('jsforce');
const envMapping = {'SandBox':'https://test.salesforce.com',
                    'Production':'https://login.salesforce.com'}

class JSForce{

    redirectToAuthentication(res,env){
        this.oauth2 = new jforce.OAuth2({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET_ID,
            redirectUri: process.env.REDIRECT_URI,
            loginUrl : envMapping[env]
        });
        this.con = new jforce.Connection({ oauth2 : this.oauth2,loginUrl :envMapping[env] });
        res.redirect(this.oauth2.getAuthorizationUrl({scope : 'full refresh_token' }));
    }

    authenticateConnection(authCode){
        return this.con.authorize(authCode);
    }

    createConnection(username,password,env){
        this.con = new jforce.Connection({loginUrl :envMapping[env] });
        return this.con.login(username, password);
    }

    

    describeMetadata(version){
        let con = this.con;
        return new Promise(function(resolve,reject){
            con.metadata.describe(version,function(err,response){
               if(err){
                   reject(err);
               }
               resolve(response);
            });
        });
    }
}


module.exports = new JSForce();