'use strict'
var config = require("./config.json");
var DATABASE = require("./db/db_conn");
var DB = new DATABASE();
var db = DB.db_connect();
var exchanges = [
	{
	"name":"binance",
	"pairs":[
		{"B_C":"btc","I_C":"eos"},
		{"B_C":"btc","I_C":"eth"},
		{"B_C":"eth","I_C":"eos"}
	],
	"status":
		"open"
		//"closed"
	},{
	"name":"hitbtc",
	"pairs":[
		{"B_C":"btc","I_C":"eos"},
		{"B_C":"btc","I_C":"eth"},
		{"B_C":"eth","I_C":"eos"}
	],
	"status":
		"open"
		//"closed"
	},{
	"name":"okex",
	"pairs":[
		{"B_C":"btc","I_C":"eos"},
		{"B_C":"btc","I_C":"eth"},
		{"B_C":"eth","I_C":"eos"}
	],
	"status":
		"open"
		//"closed"
	},{
	"name":"huobi",
	"pairs":[
		{"B_C":"btc","I_C":"eos"},
		{"B_C":"btc","I_C":"eth"},
		{"B_C":"eth","I_C":"eos"}
	],
	"status":
		"open"
		//"closed"
	},{
	"name":"bitfinex",
	"pairs":[
		{"B_C":"btc","I_C":"eos"},
		{"B_C":"btc","I_C":"eth"},
		{"B_C":"eth","I_C":"eos"}
	],
	"status":
		"open"
		//"closed"
	},{
	"name":"bigone",
	"pairs":[
		{"B_C":"btc","I_C":"eos"},
		{"B_C":"btc","I_C":"eth"},
		{"B_C":"eth","I_C":"eos"}
	],
	"status":
	     //"closed"
	     "open"
	}
];
var tickers = {}

var balances = [];
var rate = [];
var API = [];

exchanges.map((v,k)=>{
	if(v.status == "closed")return;
	var e = config[v.name];
	var Api = require(e.api);
	API[v.name] = new Api(e.api_key,e.secret_key);
	rate[v.name] = e.rate;
	var balance = {};
	balance.free = e.free;
	balance.locked = e.locked;
	tickers[v.name + 'LowestAsk'] = {}
	tickers[v.name + 'HighestBid'] = {}
	v.pairs.map((vp,kp)=>{
		var pair = vp.I_C + vp.B_C;
		balance[pair] = {}
		balance[pair].B_C = e["currency"][vp.B_C];
		balance[pair].I_C = e["currency"][vp.I_C];
		tickers[v.name + 'LowestAsk'][pair] = null;
		tickers[v.name + 'HighestBid'][pair] = null;
	})
	balances[v.name] = balance;
})
var freshTime = new Date().getTime();
var params = {
	API:API, 
	balances:balances,
	rate:rate,
	exchanges:exchanges,
	tickers:tickers,
	autoExchange : false,
	pause : true,
	stopTrade :false,
	lastTime : 0,
	balanceSaved : true,
	tickerError:false,
	freshTime: freshTime,
	db: db

}

module.exports = params;