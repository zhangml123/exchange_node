'use strict'
var request = require('request');
var sha256 = require('crypto-js/hmac-sha256');
var Base64 = require('crypto-js/enc-base64') ;
class huobiApi{
	constructor(key,secret,url){
		this.HITBTC_API_URL = 'https://api.huobi.pro';
		this.HITBTC_TRADING_API_URL_SEGMENT = '/v1/';
		this._key = key;
		this._secret = secret;
		this.url = this.HITBTC_API_URL;
		this._nonce = Date.parse(new Date());
	}
	balance(cb){
		this.cb = cb;
		this._request("account/accounts/709933/balance",'',false);
	}
	newOrder(argument, cb){
		this.cb = cb;
		this._request("order/orders/place",argument,true);
		
	}
	queryOrder(argument, cb){
		this.cb = cb;
		var orderId = argument.orderId;
		this._request("order/orders/" + orderId,'',false);
	}
	_request(method,argument,isPost){
		var argument = argument ? argument : {};
		var argument_e = argument;
		var argument_t = {};
		argument_t.AccessKeyId = this._key;
		argument_t.SignatureMethod = "HmacSHA256";
		argument_t.SignatureVersion = "2";
		argument_t.Timestamp = this._getTimestamp();
		var params = Object.keys(argument_t)
	    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(argument_t[k]))
	    .join('&');
	    var signature_str = (isPost ? "POST": "GET")+"\napi.huobi.pro\n/v1/" + method + "\n" + params;
	    var signature =  this._signature(signature_str);
	    var requestUri = this.HITBTC_TRADING_API_URL_SEGMENT 
		+ method ;
	    
		if( isPost == false){
			if(params){
				requestUri += ('?'+ params + "&Signature=" + signature);
			}
			var url = this.url + requestUri;
			var option = {
				url:url,
				method:"get",
				headers:{
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
				},
			}
		}else{
			var url = this.url + requestUri + '?' + params + "&Signature=" + signature;
			var option = {
				url:url,
				method:"post",
				headers:{
					'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36',
					'Content-type':'application/json;charset=UTF-8'
				},
				body:JSON.stringify(argument_e)
			}
		}
		var cb = this.cb
		request(option,function(error,response,body){
   			if(body){
   				cb(body)
   			}
		},cb);
	}
	_signature(signature_str){
		return encodeURIComponent(Base64.stringify(sha256(signature_str, this._secret,true)));
	}
	_getNonce(){
		return this._nonce++;
	}
	_getTimestamp(){

		Date.prototype.Format = function (fmt) { //author: meizz 
		    var o = {
		        "M+": this.getUTCMonth() + 1, //月份 
		        "d+": this.getUTCDate(), //日 
		        "h+": this.getUTCHours(), //小时 
		        "m+": this.getUTCMinutes(), //分 
		        "s+": this.getUTCSeconds(), //秒 
		        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		        "S": this.getMilliseconds() //毫秒 
		    };
		    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		    for (var k in o)
		    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		    return fmt;
		}
		return (new Date()).Format("yyyy-MM-ddThh:mm:ss");
	}
}
module.exports = huobiApi;