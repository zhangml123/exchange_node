'use strict'
var request = require('request');
var sha512 = require('crypto-js/hmac-sha512');
class hitbtcApi{
	constructor(key,secret,url){
		this.HITBTC_API_URL = 'http://api.hitbtc.com';
		this.HITBTC_TRADING_API_URL_SEGMENT = '/api/1/trading/';
		this._key = key;
		this._secret = secret;
		this.url = this.HITBTC_API_URL;
		this._nonce = Date.parse(new Date());
	}
	balance(cb){
		this.cb = cb;
		this._request("balance","",false);

	}
	newOrder(argument, cb){
		this.cb = cb;
		this._request("new_order",argument,true);
	}
	_request(method,argument,isPost){
		var requestUri = this.HITBTC_TRADING_API_URL_SEGMENT 
		+ method 
		+ '?nonce=' + this._getNonce()
		+ '&apikey=' + this._key;
		var argument = argument ? argument : [];
		var params = Object.keys(argument)
	    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(argument[k]))
	    .join('&');
	    var signature =  this._signature(requestUri,isPost ? params : "")
		if(params && isPost == false){
			requestUri +=('&'+ params);
		}else if(!params && isPost == false){
			url = this.url + requestUri;
			var option = {
				url:url,
				method:"get",
				headers:{
					'X-Signature':signature,
				},
			}
		}else{
			var url = this.url+requestUri;
			var option = {
				url:url,
				method:"post",
				headers:{
					'X-Signature':signature,
				},
				body: params,
			}
		}
		
		var cb = this.cb
		request(option,function(error,response,body){
   			if(body){
   				cb(body)
   			}
		},cb);
	}
	_signature(uri,postData){
		return sha512(uri + postData,this._secret).toString().toLowerCase();
	}
	_getNonce(){
		return this._nonce++;
	}
}
module.exports = hitbtcApi;