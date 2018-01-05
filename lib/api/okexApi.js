'use strict'
var request = require('request');
var md5 = require('crypto-js/md5');
class okexApi{
	constructor(key,secret,url){
		this.HITBTC_API_URL = 'https://www.okex.com';
		this.HITBTC_TRADING_API_URL_SEGMENT = '/api/v1/';
		this._key = key;
		this._secret = secret;
		this.url = this.HITBTC_API_URL;
		this._nonce = Date.parse(new Date());
	}
	balance(cb){
		this.cb = cb;
		var argument = {
					"api_key":this._key,
				};
		this._request("userinfo.do",argument,true);
	}
	newOrder(argument, cb){
		this.cb = cb;
		var obj={r:2,n:'api_key',c:this._key};
		argument.push(obj) ;
		argument.sort((a,b)=>{
			return a.r-b.r
		})
		var param = {}
		argument.map((v,k)=>{
			param[v.n]= v.c
		})
		this._request("trade.do",param,true);
	}
	queryOrder(argument, cb){
		this.cb = cb;
		var param = {
			"api_key":this._key,
			"order_id":argument.orderId,
			"symbol":argument.symbol
		}
		this._request("order_info.do",param,true);
	}
	_request(method,argument,isPost){
		var requestUri = this.HITBTC_TRADING_API_URL_SEGMENT 
		+ method 
		var argument = argument ? argument : [];
		var params = Object.keys(argument)
	    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(argument[k]))
	    .join('&');
	    var signature =  this._signature(isPost ? params : "");
	    var _data = params+'&sign='+signature;
		if(params && isPost == false){
			requestUri +=('&'+ params);
		}else if(!params && isPost == false){
			url = this.url + requestUri;
			var option = {
				url:url,
				method:"get",
				headers:{
					'User-Agent': 'OKCoinPHP/v1',
					'contentType':'application/x-www-form-urlencoded'
				},
			}
		}else{
			var url = this.url+requestUri;
			var option = {
				url:url,
				method:"post",
				headers:{
					'User-Agent': 'OKCoinPHP/v1',
					'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
					
				},
				body: _data,
			}
		}
		var self = this
		request(option,function(error,response,body){
   			if(body){
   				self.cb(body)
   			}
		});
	}
	_signature(postData){
		return md5(postData+"&secret_key="+this._secret).toString().toUpperCase();
	}
	_getNonce(){
		return this._nonce++;
	}
}
module.exports = okexApi;