'use strict'
var HitbtcTicker = require("./lib/ticker/HitbtcTicker");
var BinanceTicker = require("./lib/ticker/BinanceTicker");
var BitFinexTicker = require("./lib/ticker/BitFinexTicker");
var LocalStorage = require("node-localstorage").LocalStorage;
var DATABASE = require("./db/db_conn");
var localStorage = new LocalStorage('./scratch');
localStorage.clear();
var DB = new DATABASE(localStorage);
var db = DB.db_connect();
var params = {
	localStorage : localStorage,
	autoExchange : false,
	pause : true,
	lastTime : 0,
	db: db
}
var hitbtcTicker = new HitbtcTicker(params);
var binanceTicker = new BinanceTicker(params);
setInterval(function(){
	hitbtcTicker.getOrderBook();	
},500);
binanceTicker.getOrderBook();
//bitFinexTicker.getOrderBook();

