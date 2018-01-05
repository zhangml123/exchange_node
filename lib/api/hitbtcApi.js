'use strict'
var request = require('request');
var sha512 = require('crypto-js/hmac-sha512');
class hitbtcApi{
	constructor(key,secret,url){
		this.HITBTC_API_URL = 'https://api.hitbtc.com';
		this.HITBTC_TRADING_API_URL_SEGMENT = '/api/2/';
		this._key = key;
		this._secret = secret;
		this.url = this.HITBTC_API_URL;
		this._nonce = Date.parse(new Date());
	}
	balance(cb){
		this.cb = cb;
		this._request("trading/balance","",false);

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
		+ method;
		var argument = argument ? argument : [];
		var params = Object.keys(argument)
	    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(argument[k]))
	    .join('&');
		var cb = this.cb
		var auth = "Basic " + new Buffer(this._key  + ":" + this._secret).toString("base64")
	    if(isPost == false){
	    	if(params){
				requestUri +=('&'+ params);
			}
			if(method === "order"){
				requestUri = this.HITBTC_TRADING_API_URL_SEGMENT + method + "/" + argument.clientOrderId;
			}
			url = this.url + requestUri;
		
			var option = {
				url:url,
				method:"get",
				headers : {
		            "Authorization" : auth
		        }
			}
			//console.log(option);
			request.get(option,function(error,response,body){
	   			if(body){
	   				cb(body)
	   			}
			},cb);
		}else{
			var url = this.url+requestUri;
			var option = {
				url:url,
				method:"post",
				body: params,
				headers : {
		            "Authorization" : auth
		        }
			}
			request.post(option,function(error,response,body){
	   			if(body){
	   				cb(body)
	   			}
			},cb);
		}
		
		
		
	}
	_getNonce(){
		return this._nonce++;
	}
}
module.exports = hitbtcApi;