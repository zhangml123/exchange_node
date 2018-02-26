'use strict'
var request = require('request');
var md5 = require('crypto-js/md5');
class bigoneApi{
	constructor(userid,apikey,url){
		this.HITBTC_API_URL = 'https://api.big.one';
		this.HITBTC_TRADING_API_URL_SEGMENT = '/';
		this._key = apikey;
		this._userid = userid;
		this.url = this.HITBTC_API_URL;
		this._nonce = Date.parse(new Date());
	}
	balance(cb){
		this.cb = cb;
		this._request("accounts",'',false);
	}
	newOrder(argument, cb){
		this.cb = cb;
		
		this._request("orders",argument,true);
	}
	queryOrder(argument, cb){
		this.cb = cb;
		this._request("orders",argument,false);
	}
	_request(method,argument,isPost){
		var requestUri = this.HITBTC_TRADING_API_URL_SEGMENT 
		+ method 
		var argument = argument ? argument : [];
	    var _data = argument;
	    var uuid = require('node-uuid');  
	    var auth = "Bearer " + this._key;
		if(isPost == false){
			if(argument.length != 0 && argument.order_id != "")	requestUri += ('/'+ argument.order_id);
			url = this.url + requestUri;
			var option = {
				url:url,
				method:"get",
				headers:{
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
					"Authorization":auth,
					'Big-Device-Id':uuid.v4() ,
					"Content-Type": "application/json"
				},
			}
		}else{
			var url = this.url+requestUri;
			var option = {
				url:url,
				method:"post",
				headers:{
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
					'Authorization':auth,
					'Big-Device-Id':uuid.v4() ,
					'Content-Type': 'application/json'
				},

				body: _data,
				json: true
			}
		}
		
		var cb = this.cb
		request(option,function(error,response,body){
   			if(body){
   				cb(body)
   			}
		},cb);
	}
	_signature(postData){
		return md5(postData+"&secret_key="+this._secret).toString().toUpperCase();
	}
	_getNonce(){
		return this._nonce++;
	}
}
module.exports = bigoneApi;