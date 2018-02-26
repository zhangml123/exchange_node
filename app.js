'use strict'
var Exception = require("./exception");
var config = require("./config.json");
var INIT = require("./init");
class App {
	constructor(init){
		this.params = init ? init : INIT;
		this.interval = null;
	}
	run(){
		console.log(this.params);
		console.log("run");
		this.params.db.query("UPDATE exc_set SET service = 1 WHERE id = 1",function(data){});
		//刷新余额
		var Exchange = require("./exchange");
		var exchagne = new Exchange('',this.params);
		exchagne.db_balance(new Date().getTime(),true);
		this.params.exchanges.map((v,k)=>{
			if(v.status == "closed")return;
			var e = config[v.name];
			console.log(e)

			v.pairs.map((vp,kp)=>{
				var Ticker = require(e.ticker);
				var ticker = new Ticker(this.params,{
					"B_C":e["currency"][vp.B_C],
					"I_C":e["currency"][vp.I_C]
				});
				if(v.name == "huobi" || v.name == "hitbtc" || v.name == "bigone"){
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
		var main = new Main(this.params);
		main.queryFailedOrder(exchagne);

		//显示交易所状态
		var self = this;
		setInterval(function(){
			if(self.params.exchanges.length > 0){
				self.params.exchanges.map((v,k)=>{
					if(v.status === "open"){
						console.log("\x1B[32m "+JSON.stringify(v)+"\x1B[0m \n");
						self.exchangeStatus(v)
					}else{
						console.log("\x1B[33m "+JSON.stringify(v)+"\x1B[0m \n");
						self.exchangeStatus(v)
					}
					
					
				})
			}
		},30000)
	}
	exchangeStatus(exchange){
		var self = this;
		self.params.db.query("SELECT * FROM exc_exchange_status WHERE `name` = \""+ exchange.name +"\" LIMIT 1" ,function(rs){
			console.log(rs)
			if(rs){
				if(exchange.status === "open"){
					self.params.db.query("UPDATE exc_exchange_status SET `status` = \"open\" WHERE `name` = \""+ exchange.name +"\"" ,function(){})
				}else{
					self.params.db.query("UPDATE exc_exchange_status SET `status` = \"closed\" WHERE `name` = \""+ exchange.name +"\"" ,function(){})
				}
			}else{
				var _data = {
					name :exchange.name,
					status : "open" 
				}
				self.params.db.insert("exc_exchange_status",_data,function(rs){
					console.log(rs)

				})
			}
		})
	}
}

module.exports = App;