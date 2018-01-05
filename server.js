'use strict'
var DATABASE = require("./db/db_conn");
var DB = new DATABASE();
var db = DB.db_connect();
var exchangeList = require("./exchangeList.json");

// 设置交易对
const BENCHMARK_CURRENCY = "btc";
const INVERSTMENT_CURRENCY = "eos";

/////////////////

process.on('uncaughtException',function(err){
	db.query("UPDATE exc_set SET service = 0 WHERE id = 1",function(data){});
	throw err;
	console.log(err);

})//监听未捕获的异常




var orders = {}
var exchanges = [];
var balances = [];
var rate = [];


var addexchang = '';
exchangeList.map((v,k)=>{

	var balance = {};
	balance.B_C = v["currency"][BENCHMARK_CURRENCY];
	balance.I_C = v["currency"][INVERSTMENT_CURRENCY];
	balance.free = v.free;
	balance.locked = v.locked;
	balances[v.name] = balance;

	orders[v.name + 'LowestAsk'] = null;
	orders[v.name + 'HighestBid'] = null;

	exchanges.push(v.name);
	addexchang += v.name + ','
	rate[v.name] = v.rate;
})
console.log("\n \x1B[36m交易所：" + addexchang.substring(0,addexchang.length-1) + " \x1B[0m\n")
console.log(" \x1B[36m交易对：" + INVERSTMENT_CURRENCY +  BENCHMARK_CURRENCY  + " \x1B[0m\n")
var params = {

	balances:balances,
	rate:rate,
	exchanges:exchanges,
	orders:orders,
	autoExchange : false,
	pause : true,
	lastTime : 0,
	balanceSaved : true,
	db: db
}

exchangeList.map((v,k)=>{
	var Ticker = require(v.ticker);
	var ticker = new Ticker(params);
	ticker.getOrderBook();
});