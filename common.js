'use strict'
var HitbtcApi = require("./lib/api/hitbtcApi");
var BinanceApi = require("./lib/api/binanceApi");
var LocalStorage = require("node-localstorage").LocalStorage;
class common{
	constructor(params){
		var htibtc_key = ""
		var hitbtc_secret="";
		var binance_key = "";
		var binacne_secret = ""
		var localStorage_timestamp = new LocalStorage('./tinestamp');
		var hitbtcApi = new HitbtcApi(htibtc_key,hitbtc_secret);
		var binanceApi = new BinanceApi(binance_key,binacne_secret);
		this.localStorage_timestamp = localStorage_timestamp;
		this.hitbtcApi = hitbtcApi;
		this.binanceApi = binanceApi;
		this.pause = true;
	}
}

module.exports = common