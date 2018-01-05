'use strict'
var common = require("./common")
class exchange extends common{
	constructor(order,params){
		super();
		this.params = params;
		this.db = params.db;
		this.order = order;
		this.I_C = this.params.balances.binance.I_C 
		this.B_C = this.params.balances.binance.B_C;
	}
	trade(){
		var order_sell = this.order.sell;
		var order_buy = this.order.buy;
		var b = this.getExchangeBs(order_buy.exchange);
		var s = this.getExchangeBs(order_sell.exchange);
		//设置差价
		var sell_price = order_sell.price;
		var buy_price = order_buy.price;
		var fee_sell = sell_price * s.r;
		var fee_buy = buy_price * b.r;

		if((sell_price - buy_price) < (fee_sell + fee_buy +0)) {

			console.log("\x1B[31m Error :　price difference < fee + 0  = " + (fee_sell + fee_buy +0) + "\x1B[0m \n")
			return false;
		}
		//设置交易量
		var amount = this.order.amount;
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
	}
	submitOrder(amount){
		var self = this;
		var current_time = new Date().getTime();
		if(current_time - self.params.lastTime < 1000){
			console.log("\x1B[31m  Error :　repeat submission ; rest time = "+ ( 1000- current_time +  self.params.lastTime) + "\x1B[0m \n");
			return false;
		}
		self.params.lastTime = current_time + 1;
		self.order_sell_submited = false;
		self.order_buy_submited = false;
		console.log("balanceSaved =" + self.params.balanceSaved)
		
		self.params.balanceSaved = false;
		console.log("balanceSaved =" + self.params.balanceSaved)
		/*  提交卖单**/
		var params_sell = {};
		params_sell.exchange = self.order.sell.exchange;
		params_sell.side = "sell";
		params_sell.price = self.order.sell.price;
		params_sell.amount = amount;
		params_sell.clientOrderId = "sellorder" + String(current_time) + Math.floor(Math.random () * 1000);
		var error = [];
		var rs_sell = {};

		this._submitOrder(params_sell,function(data){
			if(data.result == true ){
				rs_sell.transactTime = data.transactTime;
				rs_sell.orderId = data.orderId;
				rs_sell.clientOrderId = data.clientOrderId ?  data.clientOrderId : params_sell.clientOrderId;
			}
			if(data.error){
				rs_sell.status = JSON.stringify(data);
				var error_order_sell = {
					exchange:params_sell.exchange,
					submitTime:current_time,
					orderId:params_sell.clientOrderId,
					type:"sell",
					msg : JSON.stringify(data),
				};
				self.saveErrorOrder(error_order_sell);
			}
			rs_sell.exchange = params_sell.exchange;
			rs_sell.side = "sell";
			rs_sell.price = params_sell.price;
			rs_sell.quantity = params_sell.amount;
			self.order_sell_submited = true;
			self.saveOrder(
				rs_sell,
				current_time
			);
		});

		/* 提交买单*/
		var params_buy = {};
		params_buy.exchange = self.order.buy.exchange;
		params_buy.side = "buy";
		params_buy.price = self.order.buy.price;
		params_buy.amount = amount;
		params_buy.clientOrderId = "buyorder" + String(current_time) + Math.floor(Math.random () * 1000);
		var rs_buy = {};
		this._submitOrder(params_buy,function(data){
			if(data.result == true ){
				rs_buy.transactTime = data.transactTime;
				rs_buy.orderId = data.orderId;
				rs_buy.clientOrderId = data.clientOrderId ? data.clientOrderId : params_buy.clientOrderId;
			}

			if(data.error){
				rs_buy.status = JSON.stringify(data);
				var error_order_buy = {
					exchange:params_buy.exchange,
					submitTime:current_time,
					orderId:params_buy.clientOrderId,
					type:"buy",
					msg : JSON.stringify(data),
				}
				self.saveErrorOrder(error_order_buy);
				
			}
			rs_buy.exchange = params_buy.exchange;
			rs_buy.side = "buy";
			rs_buy.price = params_buy.price;
			rs_buy.quantity = params_buy.amount;
			self.order_buy_submited = true;
			self.saveOrder(
				rs_buy,
				current_time
			);
		})
	}

	_submitOrder(params,cb){
		var self = this;
		if(params.exchange === "binance"){
			self.binanceExchange("new_order",params,function(data){
				try{
					var data = JSON.parse(data)
				}catch(e){
					console.log(e)
				} 
				if(!data.code){
					data.transactTime = data.transactTime;
					data.orderId = data.orderId;
					data.clientOrderId = data.clientOrderId;
					data.result = true;
				}else{
					data.result = false;
				}
				if(!data.orderId || data.code){
					data.error = true;
				}else{
					data.error = false;
				}
				cb(data);
			},cb)
		}
		if(params.exchange === "hitbtc"){
			self.hitbtcExchange("new_order",params,function(data){
				try{
					var data = JSON.parse(data)
				}catch(e){
					console.log(e)
				}
				if(!data.error){
					data.transactTime = '';
					data.orderId = data.id;
					data.clientOrderId = data.clientOrderId;
					data.result = true;
				}else{
					data.result = false;
				}
				if(!data.id ||  data.error){
					data.error = true;
				}else{
					data.error = false;
				}
				cb(data);
			},cb)
		}
		if(params.exchange === "okex"){
			self.okexExchange("new_order",params,function(data){
				try{
					var data = JSON.parse(data)
				}catch(e){
					console.log(e)
				} 
				if(data.result == true){
					data.transactTime = '';
					data.orderId = data.order_id;
					data.clientOrderId = data.clientOrderId;
					data.result = true;
				}else{
					data.result = false;
				}
				if(!data.order_id || data.result == false){
					data.error = true;
				}else{
					data.error = false;
				}
				cb(data);
			},cb)
		}
		
	}

	getExchangeBs(exchange){
		switch(exchange){
			case "hitbtc" : var s = "available";var u = "BTC";var r = 0.001 ;break;
			case "binance" : var s = "free";var u = "BTC";var r = 0.0005 ; break;
			//case "bitfinex" : var s = "";var u = ""; var r = 0.002 ;break;
			case "okex" : var s = "free"; var u = "BTC" ;var r = 0.001;break;
			default : var s = "" ; var u = "";var r = '' ;break;
		}
		return {s:s,u:u,r:r};
	}


	binanceExchange(method,params,cb){
		if(method == "new_order"){
			console.log(params);
			var argument = {};
			var symbol = this.I_C + this.B_C;
			argument.symbol = symbol;
			argument.side = params.side;
			argument.price = params.price;
			argument.quantity = params.amount;
			argument.type = "limit";
			argument.timeInForce = "GTC";
			argument.recvWindow = "6000000";
			this.binanceApi.newOrder(argument,function(rs){
				console.log("\x1B[36m " + rs + "\x1B[0m \n");
				cb(rs)
			},cb)
		}else if(method == "balance"){

		}
	}
	hitbtcExchange(method,params,cb){
		if(method == "new_order"){

			console.log(params);
			var argument = {};
			var symbol = this.I_C + this.B_C;
			argument.symbol = symbol;
			argument.clientOrderId = params.clientOrderId;
			argument.side = params.side;
			argument.price = params.price;
			argument.quantity = params.amount;
			argument.type = "limit";
			argument.timeInForce = "GTC";
			this.hitbtcApi.newOrder(argument,function(rs){
				console.log("\x1B[36m " + rs + "\x1B[0m \n");
				cb(rs)
			},cb)
		}else if(method == "balance"){

		}
	}

	okexExchange(method,params,cb){
		if(method == "new_order"){
			console.log(params);
			var argument = [];
			var amount = params.amount;
			var price = params.price;
			var type = params.side;
			var symbol = (this.I_C + '_' + this.B_C).toLowerCase();
			var argument = [
					{r:1,n:'amount',c:amount},
					{r:3,n:'price' ,c:price},
					{r:4,n:'symbol',c:symbol},
					{r:5,n:'type'  ,c:params.side}
			];
			this.okexApi.newOrder(argument,function(rs){
				console.log("\x1B[36m " + rs + "\x1B[0m \n");
				cb(rs)
			},cb)
		}else if(method == "balance"){

		}
	}
	saveOrder(
		order,
		current_time
		){
			var self = this;
			var rs = {};
			var symbol = this.I_C + this.B_C;
			rs.symbol = symbol;
			rs.exchange = order.exchange;
			rs.type = (order.side).toLowerCase();
			rs.orderId = order.orderId ? order.orderId : '——';
			rs.clientOrderId = order.clientOrderId ? order.clientOrderId : "——";
			rs.price = order.price;
			rs.amount = order.quantity ? order.quantity : order.origQty;
			rs.submitTime = current_time;
			rs.transactTime = order.transactTime ? order.transactTime : "——";
			rs.status = order.status ? order.status : 0;
			this.db.insert("exc_order",rs,function(rs){
				if(rs){
					//查询订单
					self.queryOrder(order);
				}

			});
			//查询余额
			this.db_balance(current_time);
			
	}
	db_balance(current_time){
		var self = this;
		console.log("self.order_sell_submited = " + self.order_sell_submited);
		console.log("self.order_buy_submited = " + self.order_buy_submited);
		if(!self.order_sell_submited || !self.order_buy_submited ){return false;}
		console.log("start to save balance");
		this.getBalance(function(arr){
			var balance = {};
			balance.balance = JSON.stringify(arr);
			balance.timestamp = current_time;
			balance.total_B_C = arr.total_B_C;
			balance.total_I_C = arr.total_I_C;

			console.log("balnace = "+JSON.stringify(balance));
			self.db.insert("exc_balance",balance,function(rs){
				console.log(rs)
				if(rs)
				{
					//throw "save balance saved"

					self.params.balanceSaved = true;
				}else{
					throw "save balance failed"
				}

				console.log("self.params.balanceSaved = " + self.params.balanceSaved)
			});
			self.check_balance();

		});

	}
	getBalance(cb){
		var self = this;
		self.balance = {};
		this.hitbtcApi.balance(function(rs_hitbtc){
			try{var rs_hitbtc = JSON.parse(rs_hitbtc)}catch(e){console.log(e)};
			var hitbtc = {};
			rs_hitbtc.map((v,k) =>{
				if(v.currency == self.B_C){
					hitbtc[self.B_C] = v;
					self.balance.hitbtc_B_C = parseFloat(v.available) + parseFloat(v.reserved)
				}
				if(v.currency == self.I_C){
					hitbtc[self.I_C] = v;
					self.balance.hitbtc_I_C = parseFloat(v.available) + parseFloat(v.reserved)
				}
			})
			self.balance.hitbtc = hitbtc;
			self._getBalance(self.balance,cb);
		},cb)
		this.binanceApi.balance({recvWindow :"6000000"},function(rs_binance){
			
			try{var rs_binance = JSON.parse(rs_binance)}catch(e){console.log(e)};
			var binance = {};
			rs_binance.balances.map((v,k) => {
				if(v.asset == self.B_C){
					binance[self.B_C] = v;
					self.balance.binance_B_C = parseFloat(v.free) + parseFloat(v.locked)
				}
				if(v.asset == self.I_C){
					binance[self.I_C] = v;
					self.balance.binance_I_C =parseFloat(v.free) + parseFloat(v.locked)
				}
			})
			self.balance.binance = binance;
			self._getBalance(self.balance,cb);

		},cb)
		this.okexApi.balance(function(rs_okex){
			try{var rs_okex = JSON.parse(rs_okex)}catch(e){console.log(e)};
			var okex = {};
			console.log(rs_okex)
			var B_C_free = rs_okex.info.funds.free[(self.B_C).toLowerCase()];
			var B_C_freezed = rs_okex.info.funds.freezed[(self.B_C).toLowerCase()];

			okex[self.B_C] = {"asset":self.B_C,"free":B_C_free,"freezed":B_C_freezed};
			self.balance.okex_B_C = parseFloat(B_C_free) + parseFloat(B_C_freezed);

			var I_C_free = rs_okex.info.funds.free[(self.I_C).toLowerCase()];
			var I_C_freezed = rs_okex.info.funds.freezed[(self.I_C).toLowerCase()];

			okex[self.I_C] = {"asset":self.I_C,"free":I_C_free,"freezed":I_C_freezed};
			self.balance.okex_I_C = parseFloat(I_C_free) + parseFloat(I_C_freezed);
			self.balance.okex = okex;
			self._getBalance(self.balance,cb);
		},cb)
	}

	_getBalance(balance,cb){
		if(!balance.hitbtc || !balance.binance || !balance.okex){ return;}
		balance.timestamp = new Date().getTime();
		balance.total_B_C = (parseFloat(balance.binance_B_C) + parseFloat(balance.hitbtc_B_C) + parseFloat(balance.okex_B_C)).toFixed(8);
		balance.total_I_C = (parseFloat(balance.binance_I_C) + parseFloat(balance.hitbtc_I_C) + parseFloat(balance.okex_I_C)).toFixed(8); 
		cb({
			hitbtc:balance.hitbtc,
			binance:balance.binance,
			okex:balance.okex,
			total_B_C:balance.total_B_C,
			total_I_C:balance.total_I_C
		});
	}
	check_balance(){
		var self = this;
		//检查连续失败订单
		var time = new Date().getTime() - 300 * 1000;
		this.db.query("SELECT COUNT( * ) FROM exc_order WHERE (status = 0 and submitTime > "+time+" ) ",function(data){
			for(var k in data){var count = data[k]}
			if(count >= 5){
				self.db.query("UPDATE exc_set SET pause = 0 WHERE id = 1",function(data){});
				//self.params.pause = true;
				//throw "order error check_balance"
			}
		})
	}
	queryOrder(order){
		var self = this;
		var exchange = order.exchange;
		var argument = {};
		if(order.exchange == "binance"){
			argument.orderId = order.orderId;
			argument.origClientOrderId = order.clientOrderId;
			argument.symbol = this.I_C + this.B_C;
			this.binanceApi.queryOrder(argument,function(rs){
				var rs = JSON.parse(rs);
				if(rs && rs.status === "FILLED"){
					self.orderFilled(order);
					
				}
				console.log("\x1B[36m " + JSON.stringify({
					exchange:"binance",
					side:order.side,
					status:rs.status,
				}) + "\x1B[0m \n");
			})
		}else if(order.exchange == "hitbtc"){
			argument.clientOrderId = order.clientOrderId;
			this.hitbtcApi.queryOrder(argument,function(rs){
				console.log("\x1B[36m " + rs + "\x1B[0m \n");
				var rs = JSON.parse(rs);
				if(rs.error && rs.error.code == 20002){
					var status = "FILLED";
					self.orderFilled(order);
				}else{
					var status = "NOT FILLED";
				}
				console.log("\x1B[36m " + JSON.stringify({
					exchange:"hitbtc",
					side:order.side,
					status:status,
				}) + "\x1B[0m \n");
			})
		}else if(order.exchange == "okex"){
			/*argument.orderId = order.orderId;
			argument.symbol = (this.I_C + '_' + this.B_C).toLowerCase();
			this.okexApi.queryOrder(argument,function(rs){
				console.log("\x1B[36m " + rs + "\x1B[0m \n");
				var rs = JSON.parse(rs);
				if(rs.result == true && rs.orders[0].status == 2){
					var status = "FILLED";
					self.orderFilled(order);
				}else{
					var status = "NOT FILLED";
				}
				console.log("\x1B[36m " + JSON.stringify({
					exchange:"okex",
					side:order.side,
					status:status,
				}) + "\x1B[0m \n");
				
			})	*/
		}
	}
	orderFilled(order){
		//console.log("UPDATE exc_order SET status = 1 WHERE clientOrderId = \"" + order.clientOrderId + "\"");
		this.db.query("UPDATE exc_order SET status = 1 WHERE clientOrderId = \"" + order.clientOrderId + "\"",function(data){})

	}
	saveErrorOrder(order){
		this.db.insert("exc_error_order",order);
		throw " order error saveErrorOrder";
	}
}

module.exports = exchange;