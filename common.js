'use strict'
var HitbtcApi = require("./lib/api/hitbtcApi");
var BinanceApi = require("./lib/api/binanceApi");
var OkexApi = require("./lib/api/okexApi");
class common{
	constructor(params){
		var htibtc_key = "";
		var hitbtc_secret="";
		var binance_key = "";
		var binacne_secret = "";
		var okex_key = "";
		var okex_secret = "";
		
		var hitbtcApi = new HitbtcApi(htibtc_key,hitbtc_secret);
		var binanceApi = new BinanceApi(binance_key,binacne_secret);
		var okexApi = new OkexApi(okex_key,okex_secret);
		this.hitbtcApi = hitbtcApi;
		this.binanceApi = binanceApi;
		this.okexApi = okexApi;
	
	}




	




	
}

module.exports = common