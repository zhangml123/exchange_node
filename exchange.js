'use strict'
var common = require("./common")
class exchange extends common{
	constructor(order,params){
		super();
		this.params = params;
		this.db = params.db;
		this.order = order;
	}
	trade(){
	
		this.db.findOne("exc_balance",(data)=>{
			var order_sell = this.order.sell;
			var order_buy = this.order.buy;
			if(data == null){
				console.log("\x1B[31m Error : 数据库异常 \x1B[0m \n");
				return false;
			}
			var balance = data
			//console.log(data.balance)
			if(!data.balance){
				console.log("\x1B[31m Error : 获取余额失败 \x1B[0m \n");
				return false;
			}
			//计算最大交易量
			var balance_json = data.balance;
			//console.log(balance_json)
			
			
			var b = this.getExchangeBs(order_buy.exchange);
			var s = this.getExchangeBs(order_sell.exchange);
			
			var usd_buy = JSON.parse(balance_json)[order_buy.exchange][b.u][b.s];
			var btc_sell =JSON.parse(balance_json)[order_sell.exchange].BTC[s.s];

			
			var amount_max = [];
			amount_max.push(btc_sell);
			var btc_buy = usd_buy / (order_buy.price * ( 1 + b.r));
			amount_max.push(btc_buy);
			amount_max.sort((a,b)=>{return a-b});

			//设置差价
			var sell_price = order_sell.price;
			var buy_price = order_buy.price;
			var fee_sell = sell_price * s.r;
			var fee_buy = buy_price * b.r;

			if((sell_price - buy_price) < (fee_sell + fee_buy +1)) {

				console.log("\x1B[31m Error :　price difference < fee + １  = " + (fee_sell + fee_buy +1) + "\x1B[0m \n")
				return false;
			}

			//设置交易量
			var amount = this.order.amount;
			amount = Math.floor(amount * 100) / 100 ;
			if(amount > amount_max[0]){
				amount = Math.floor(amount_max[0] * 100) / 100 ;
			}
			if(amount > 0.1){
				amount = 0.1;
			}
			if(typeof amount != "number"){return false;}
			if(amount == 0){
				console.log(" \x1B[31m Error : amount = 0 , amount_max = "+amount_max[0]+" , order_amount = " + this.order.amount + "\x1B[0m \n");
				return false;
			}
			var sell_total = sell_price * amount;
			var buy_total = buy_price * amount;
			var fee = ( fee_sell + fee_buy ) * amount;
			var totalProfit = sell_total - buy_total - fee;


			//设置最低利润总额
			var lowestProfit = 0;
			if(totalProfit > lowestProfit){ 
				console.log("\x1B[36m 可以交易了 \x1B[0m \n");

				console.log("\x1B[36m " + JSON.stringify(this.order) + "\x1B[0m \n");
				//return;
				this.submitOrder(amount);
			}else{
				console.log("  \x1B[31m Error : totalProfit = "+totalProfit+" < " + lowestProfit + "\x1B[0m \n");
				return false;
			}

		});
		
	}
	submitOrder(amount){
		var self = this;
		var current_time = new Date().getTime();
		if(current_time - self.params.lastTime < 3000){
			console.log("\x1B[31m  Error :　repeat submission ; rest time = "+ ( 3000 - current_time +  self.params.lastTime) + "\x1B[0m \n");
			return false;
		}
		self.params.lastTime = current_time + 1;

		/*  提交买单**/
		var params_sell = {};
		params_sell.type = "sell";
		params_sell.price = self.order.sell.price;
		params_sell.amount = amount;
		params_sell.clientOrderId = "sellorder" + String(current_time) + Math.floor(Math.random () * 1000);
		var error = [];
		var rs_sell = {};
		if(self.order.sell.exchange == "binance"){
			self.binanceExchange("new_order",params_sell,function(data){
				try{
					var json_sell = JSON.parse(data)
					
				}catch(e){
					console.log(e)
				}
				if(!json_sell.code){
					var transactTime_sell = json_sell.transactTime;
					var orderId_sell = json_sell.orderId;
					var clientOrderId_sell = json_sell.clientOrderId;
				}else{
					error.push({
						sell_binance : json_sell,
					})
					rs_sell.status = json_sell;
				}
				json_sell.exchange = "binance";
				json_sell.side = "sell";
				self.saveOrder(
					json_sell,
					current_time
					);
			},current_time);
		}
		else if(self.order.sell.exchange == "hitbtc"){
			self.hitbtcExchange("new_order",params_sell,function(data){
				
				try{
					var json_sell = JSON.parse(data)
					
				}catch(e){
					console.log(e)
				} 
				if(!json_sell.code){
					rs_sell.orderId = json_sell.ExecutionReport.orderId;
					rs_sell.clientOrderId = json_sell.ExecutionReport.clientOrderId;
					if(json_sell.ExecutionReport.execReportType === "clientOrderId"){
						rs_sell.status = json_sell.ExecutionReport.orderRejectReason;
					}
				}else{
					error.push({
						sell_hitbtc : json_sell,
					})
					rs_sell.status = json_sell;
				}
				rs_sell.exchange = "hitbtc"
				rs_sell.side = "sell";
				rs_sell.price = json_sell.ExecutionReport.price;
				rs_sell.quantity = (json_sell.ExecutionReport.quantity) / 100 ;
				self.saveOrder(
					rs_sell,
					current_time
					);
			},current_time)
		}
		/* 提交买单*/
		var params_buy = {};
		params_buy.type = "buy";
		params_buy.price = self.order.buy.price;
		params_buy.amount = amount;
		params_buy.clientOrderId = "buyorder" + String(current_time) + Math.floor(Math.random () * 1000);
		var rs_buy = {};
		if(self.order.buy.exchange == "binance"){
			self.binanceExchange("new_order",params_buy,function(data){
				try{
					var json_buy = JSON.parse(data)
					
				}catch(e){
					console.log(e)
				}
				if(!json_buy.code){
					var transactTime_buy = json_buy.transactTime;
					var orderId_buy = json_buy.orderId;
					var clientOrderId_buy = json_buy.clientOrderId;
				}else{
					error.push({
						buy_binance : json_buy,
					})
					rs_buy.status = json_buy;
				}
				json_buy.exchange = "binance";
				json_buy.side = "buy";
				self.saveOrder(
					json_buy,
					current_time
					);
			},current_time);
		}
		else if(self.order.buy.exchange == "hitbtc"){
			self.hitbtcExchange("new_order",params_buy,function(data){
				try{
					var json_buy = JSON.parse(data)
					
				}catch(e){
					console.log(e)
				} 
				if(!json_buy.code){
					rs_buy.orderId = json_buy.ExecutionReport.orderId;
					rs_buy.clientOrderId = json_buy.ExecutionReport.clientOrderId;
					if(json_buy.ExecutionReport.execReportType === "clientOrderId"){
						rs_buy.status = json_buy.ExecutionReport.orderRejectReason;
					}
				}else{
					error.push({
						buy_hitbtc : json_buy,
					})
					rs_buy.status = json_buy;
				}
				rs_buy.exchange = "hitbtc";
				rs_buy.side = "buy"
				rs_buy.price = json_buy.ExecutionReport.price;
				rs_buy.quantity = (json_buy.ExecutionReport.quantity) / 100;
				self.saveOrder(
						rs_buy,
						current_time
					);
			},current_time)

		}
		
		

	}

	getExchangeBs(exchange){
		switch(exchange){
			case "hitbtc" : var s = "cash";var u = "USD";var r = 0.001 ;break;
			case "binance" : var s = "free";var u = "USDT";var r = 0.0005 ; break;
			case "bitfinex" : var s = "";var u = "";var r = 0.002 ;break;
			default : var s = "" ; break;
		}
		return {s:s,u:u,r:r};
	}


	binanceExchange(method,params,cb){
		if(method == "new_order"){
			var argument = {};
			argument.symbol = "BTCUSDT";
			argument.side = params.type;
			argument.price = params.price;
			argument.quantity = params.amount;
			/*argument.side = "buy";
			argument.price = "10";
			argument.quantity = "0.01";*/

			argument.type = "limit";
			argument.timeInForce = "GTC";
			argument.recvWindow = "6000000";
			this.binanceApi.newOrder(argument,function(rs){
				console.log("\x1B[36m " + JSON.stringify(rs) + "\x1B[0m \n");
				cb(rs)
			},cb)
		}else if(method == "balance"){

		}
	}
	hitbtcExchange(method,params,cb){
		if(method == "new_order"){
			var argument = {};
			argument.symbol = "BTCUSD";
			argument.clientOrderId = params.clientOrderId;
			argument.side = params.type;
			argument.price = params.price;
			argument.quantity = params.amount * 100 ;
			/*argument.side = "sell";
			argument.price = "7000";
			argument.quantity = 1;*/

			argument.type = "limit";
			argument.timeInForce = "GTC";
			this.hitbtcApi.newOrder(argument,function(rs){
				console.log("\x1B[36m " + JSON.stringify(rs) + "\x1B[0m \n");
				cb(rs)
			},cb)
		}else if(method == "balance"){

		}
	}
	saveOrder(
		order,
		current_time
		){
			var rs = {};
			rs.symbol = "BTCUSDT";
			rs.exchange = order.exchange;
			rs.type = (order.side).toLowerCase();
			rs.orderId = order.orderId ? order.orderId : '';
			rs.clientOrderId = order.clientOrderId ? order.clientOrderId : "";
			rs.price = order.price;
			rs.amount = order.quantity ? order.quantity : order.origQty;
			rs.submitTime = current_time;
			rs.transactTime = order.transactTime ? order.transactTime : "——";
			this.db.insert("exc_order",rs);
			//查询余额
			this.db_balance(current_time);

	}
	db_balance(current_time){
		var self = this;
		this.getBalance(function(arr){
			var balance = {};
			balance.balance = JSON.stringify(arr);
			balance.timestamp = current_time;
			balance.total_btc = arr.total_btc;
			balance.total_usd = arr.total_usd;
			self.db.insert("exc_balance",balance);
			self.check_balance();

		});

	}

	getBalance(cb){
		var self = this;
		self.hitbtcApi.balance(function(rs_hitbtc){
			var params = rs_hitbtc
			self.binanceApi.balance({
				recvWindow :"6000000"
			},function(rs_binance){
				var rs_hitbtc = params
				if(rs_hitbtc && rs_binance){
					try{
						var rs_hitbtc = JSON.parse(rs_hitbtc)
						var rs_binance = JSON.parse(rs_binance)
					}catch(e){console.log(e)}
					var balance = {};
					var hitbtc = {};
					var hitbtc_btc ="";
					var hitbtc_usdt = ""
					var binance_btc = "";
					var binance_usdt = "";
					rs_hitbtc.balance.map((v,k) =>{
						if(v.currency_code == "BTC"){
							hitbtc.BTC = v;
							hitbtc_btc = parseFloat(v.cash) + parseFloat(v.reserved)
						}
						if(v.currency_code == "USD"){
							hitbtc.USD = v;
							hitbtc_usdt = parseFloat(v.cash) + parseFloat(v.reserved)
						}
					})
					balance.hitbtc = hitbtc; 
					var binance = {};
					rs_binance.balances.map((v,k) => {
						if(v.asset == "BTC"){

							binance.BTC = v;
							binance_btc = parseFloat(v.free) + parseFloat(v.locked)
						}
						if(v.asset == "USDT"){
							binance.USDT = v;
							binance_usdt =parseFloat(v.free) + parseFloat(v.locked)
						}
					})
					balance.binance = binance; 
					balance.timestamp = new Date().getTime();
					
					if(binance_btc && binance_usdt && hitbtc_btc && hitbtc_usdt){
						balance.total_btc = (parseFloat(binance_btc) + parseFloat(hitbtc_btc)).toFixed(8);
						balance.total_usd = (parseFloat(binance_usdt) + parseFloat(hitbtc_usdt)).toFixed(8); 
					}
					cb(balance);
				}
			},params,cb)
		},cb)
	}
	check_balance(){
		var self = this;
		//检查连续失败订单
		var time = new Date().getTime() - 60 * 1000;
		self.db.query("SELECT COUNT( * ) FROM exc_order WHERE (status = 0 and submitTime > " + time + " ) ",function(data){
			for(var k in data){var count = data[k]}
			if(count >= 3 ){
				self.db.query("UPDATE exc_set SET pause = 0 WHERE id = 1",function(data){});
			}
		})
	}
}

module.exports = exchange;