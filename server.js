'use strict'
var DATABASE = require("./db/db_conn");
var DB = new DATABASE();
var db = DB.db_connect();
var exchangeList = require("./exchangeList.json");
var Exception = require("./exception");

// 设置交易对
var Pairs = [
	{"B_C":"btc","I_C":"eos"},
	{"B_C":"btc","I_C":"eth"},
	{"B_C":"eth","I_C":"eos"}
];
//设置交易所
var Exchanges = [
	"binance",
	"hitbtc",
	"okex",
	"huobi"
]
var orders = {}
var exchanges = [];
var balances = [];
var rate = [];
var API = [];
var pairs = '';

var addexchang = '';
exchangeList.map((v,k)=>{
	var Api = require(v.api);
	API[v.name] = new Api(v.api_key,v.secret_key);
	rate[v.name] = v.rate;
	var balance = {};
	balance.free = v.free;
	balance.locked = v.locked;
	if(Exchanges.indexOf(v.name) != -1 ){
		orders[v.name + 'LowestAsk'] = {}
		orders[v.name + 'HighestBid'] = {}
		exchanges.push(v.name);
		addexchang += v.name + ','
	}
	Pairs.map((vp,kp)=>{
		var pair = vp.I_C + vp.B_C;
		balance[pair] = {}
		balance[pair].B_C = v["currency"][vp.B_C];
		balance[pair].I_C = v["currency"][vp.I_C];
		if(k == 1)pairs += pair + ' ';
		if(Exchanges.indexOf(v.name) != -1 ){
			orders[v.name + 'LowestAsk'][pair] = null;
			orders[v.name + 'HighestBid'][pair] = null;
		}
	})
	balances[v.name] = balance;
})


console.log("\n \x1B[36m交易所：" + addexchang.substring(0,addexchang.length-1) + " \x1B[0m\n");
console.log(" \x1B[36m交易对：" + pairs + " \x1B[0m\n");

var freshTime = new Date().getTime();
var params = {
	API:API,
	Pairs:Pairs,
	balances:balances,
	rate:rate,
	exchanges:exchanges,
	orders:orders,
	autoExchange : false,
	pause : true,
	lastTime : 0,
	balanceSaved : true,
	freshTime: freshTime,
	db: db
}

db.query("UPDATE exc_set SET service = 1 WHERE id = 1",function(data){});
/////////////////

process.on('uncaughtException',function(err){
	var exception = new Exception(err,params,db);
	exception.handleException();

})//监听未捕获的异常

//刷新余额
var Exchange = require("./exchange");
var exchagne = new Exchange('',params);
exchagne.db_balance(new Date().getTime(),true);
exchangeList.map((v,k)=>{
	if(Exchanges.indexOf(v.name) == -1 ){return;}
	Pairs.map((vp,kp)=>{
		var Ticker = require(v.ticker);
		var ticker = new Ticker(params,{
			"B_C":v["currency"][vp.B_C],
			"I_C":v["currency"][vp.I_C]
		});
		if(v.name == "huobi" || v.name == "hitbtc"){
			setInterval(function(){
				ticker.getOrderBook();
			},200);
		}else{
			ticker.getOrderBook();
		}
	})
})

//查询订单
var Main = require("./main");
var main = new Main(params);
main.queryFailedOrder(exchagne);


