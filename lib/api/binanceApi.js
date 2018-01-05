'use strict'
var request = require('request');
var sha256 = require('crypto-js/hmac-sha256');
class binanceApi{

	constructor(key,secret,url){
		this.HITBTC_API_URL = 'https://api.binance.com';
		this.HITBTC_TRADING_API_URL_SEGMENT = '/api/v3/';
		this._key = key;
		this._secret = secret;
		this.url = this.HITBTC_API_URL;
		this._nonce = Date.parse(new Date());
	}
	balance(argument, cb){
		this.cb = cb;
		this._request("account",argument,false);

	}
	newOrder(argument, cb){
		this.cb = cb;
		this._request("order",argument,true);
	}
	queryOrder(argument, cb){
		this.cb = cb;
		this._request("order",argument,false);
	}
	_request(method,argument,isPost){
		var requestUri = this.HITBTC_TRADING_API_URL_SEGMENT 
		+ method ;
		var argument = argument ? argument : [];
		var params = Object.keys(argument)
	    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(argument[k]))
	    .join('&');
		var timestamp = this._getNonce();
 	    var _data = params + '&timestamp=' + timestamp + '&signature=' + this._signature(timestamp,params)
		if(params && isPost == false){
			requestUri += "?"+ _data;
			var signature =  this._signature(requestUri,isPost ? params : "")
			var url = this.url+requestUri;
			var option = {
				url:url,
				method:"get",
				headers:{
					'X-MBX-APIKEY':this._key,
				},
			}
		}else{
			var signature =  this._signature(requestUri,isPost ? params : "")
			var url = this.url+requestUri;
			var option = {
				url:url,
				method:"post",
				headers:{
					'X-MBX-APIKEY':this._key,
				},
				body: _data,
			}
		}
		
		var cb = this.cb
	//	console.log(option)
		request(option,function(error,response,body){
   			if(body){
   				cb(body)
   			}
		},cb);
	}
	_signature(timestamp,params){
		return sha256( params + '&timestamp='+timestamp , this._secret).toString().toLowerCase();
	}
	_getNonce(){
		return this._nonce++;
	}
}
module.exports = binanceApi;


