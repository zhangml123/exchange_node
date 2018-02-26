'use strict'
var request = require('request');
var sha384 = require('crypto-js/hmac-sha384');
class bitfinexApi{
	constructor(key,secret,url){
		this.BITFINEX_API_URL = 'https://api.bitfinex.com';
		this.BITFINEX_TRADING_API_URL_SEGMENT = '/v1/';
		this._key = key;
		this._secret = secret;
		this.url = this.BITFINEX_API_URL;
	}
	balance(cb){
		this.cb = cb;
		this._request("balances",'',true);
	}
	newOrder(argument, cb){
		this.cb = cb;
		this._request("order/new",argument,true);
	}
	queryOrder(argument, cb){
		this.cb = cb;
		this._request("order/status",argument,true);
	}
	_request(method,argument,isPost){
		var requestUri = this.BITFINEX_TRADING_API_URL_SEGMENT 
		+ method;
		var argument = argument ? argument : {};
		var params = Object.keys(argument)
	    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(argument[k]))
	    .join('&');
		var cb = this.cb
		var _nonce = new Date().getTime();
		var nonce = (_nonce + 100).toString();
		var body = {
		  request: requestUri,
		  nonce,
		}
		for(var i in argument){
			body[i] = argument[i]
		}
		var payload = new Buffer(JSON.stringify(body))
			.toString('base64')
		var signature = this._signature(payload); 
	   if(params && isPost == false){
			requestUri += "?"+ params;
			var url = this.url+requestUri;
			var option = {
				url:url,
				method:"get",
				headers:{
					'X-BFX-APIKEY': this._key,
				    'X-BFX-PAYLOAD': payload,
				    'X-BFX-SIGNATURE': signature
				    
				},
			}
		}else{
			var url = this.url+requestUri;
			var option = {
				url:url,
				method:"post",
				headers:{
					'X-BFX-APIKEY': this._key,
				    'X-BFX-PAYLOAD': payload,
				    'X-BFX-SIGNATURE': signature
				},
				body: body,
				json: true
			}
		}
		
		var cb = this.cb
		request(option,function(error,response,body){
   			if(body){
   				console.log(body)
   				cb(body)
   			}
		},cb);
	}
	_signature(signature_str){
		return sha384( signature_str , this._secret).toString().toLowerCase();
	}

}
module.exports = bitfinexApi;