'use strict'

class exchange {
	constructor(order,params){
		this.params = params;
		this.db = params.db;
		this.order = order;
		this.currency = this.params.balances;
	}
	trade(){
		var order_sell = this.order.sell;
		var order_buy = this.order.buy;
		var rate = this.params.rate;
		//设置差价
		var sell_price = order_sell.price;
		var buy_price = order_buy.price;
		var fee_sell = sell_price * rate[order_sell.exchange];
		var fee_buy = buy_price * rate[order_buy.exchange];

		if((sell_price - buy_price) < (fee_sell + fee_buy + 0)) {

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
		
		self.params.balanceSaved = new Date().getTime();
		console.log("balanceSaved =" + self.params.balanceSaved)
		/*  提交卖单**/
		var params_sell = {};
		var pair = this.order.pair;
		params_sell.pair = pair;
		params_sell.exchange = self.order.sell.exchange;
		params_sell.side = "sell";
		params_sell.price = self.order.sell.price;
		params_sell.amount = amount;
		params_sell.clientOrderId = "sellorder" + String(current_time) + Math.floor(Math.random () * 1000);
		var error = [];
		var rs_sell = {};
		console.log("submit-sell-order " + new Date().getTime())
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
					price : params_sell.price,
					amount :amount,
					msg :(typeof data.msg ) == "string" ? data.msg : JSON.stringify(data.msg),
				};
				console.log(error_order_sell)
				self.saveErrorOrder(error_order_sell);
			}
			rs_sell.pair = params_sell.pair;
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
		params_buy.pair = pair;
		params_buy.exchange = self.order.buy.exchange;
		params_buy.side = "buy";
		params_buy.price = self.order.buy.price;
		params_buy.amount = amount;
		params_buy.clientOrderId = "buyorder" + String(current_time) + Math.floor(Math.random () * 1000);
		var rs_buy = {};
		console.log("submit-buy-order " + new Date().getTime())
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
					price:params_buy.price,
					amount :amount,
					msg : (typeof data.msg) == "string" ? data.msg : JSON.stringify(data.msg),
				}
				console.log(error_order_buy)
				self.saveErrorOrder(error_order_buy);
			}
			rs_buy.pair = params_buy.pair;
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
			self.binanceExchange("new_order",params,function(data_binance){
				var data_binance = JSON.parse(data_binance)
				var data = {};
				if(!data_binance.code){
					data.transactTime = data_binance.transactTime;
					data.orderId = data_binance.orderId;
					data.clientOrderId = data_binance.clientOrderId;
					data.result = true;
				}else{
					data.result = false;
				}
				if(!data_binance.orderId || data_binance.code){
					data.error = true;
					data.msg = data_binance;
				}else{
					data.error = false;
				}
				cb(data);
			},cb)
		}
		if(params.exchange === "hitbtc"){
			self.hitbtcExchange("new_order",params,function(data_hitbtc){
				var data_hitbtc = JSON.parse(data_hitbtc)
				var data = {};
				if(!data_hitbtc.error){
					data.transactTime = '';
					data.orderId = data_hitbtc.id;
					data.clientOrderId = data_hitbtc.clientOrderId;
					data.result = true;
				}else{
					data.result = false;
				}
				if(!data_hitbtc.id ||  data_hitbtc.error){
					data.error = true;
					data.msg = data_hitbtc;
				}else{
					data.error = false;
				}
				cb(data);
			},cb)
		}
		if(params.exchange === "okex"){
			self.okexExchange("new_order",params,function(data_okex){
				var data_okex = JSON.parse(data_okex)
				var data = {}
				if(data_okex.result == true){
					data.transactTime = '';
					data.orderId = data_okex.order_id;
					data.clientOrderId = data_okex.clientOrderId;
					data.result = true;
				}else{
					data.result = false;
				}
				if(!data_okex.order_id || data_okex.result == false){
					data.error = true;
					data.msg = data_okex;
				}else{
					data.error = false;
				}
				cb(data);
			},cb)
		}
		if(params.exchange === "huobi"){
			self.huobiExchange("new_order",params,function(data_huobi){
				var data_huobi = JSON.parse(data_huobi)
				var data = {};
				if(data_huobi.status == "ok" && data_huobi.data){
					data.transactTime = '';
					data.orderId = data_huobi.data;
					data.clientOrderId = '';
					data.result = true;
				}else{
					data.result = false;
				}
				if(!data.orderId || !data_huobi.data){
					data.error = true;
					data.msg = data_huobi;
				}else{
					data.error = false;
				}
				cb(data);
			},cb)
			
		}
		if(params.exchange === "bitfinex"){
			self.bitfinexExchange("new_order",params,function(data_bitfinex){
				var data = {};
				if(data_bitfinex.order_id){
					data.transactTime = '';
					data.orderId = data_bitfinex.order_id;
					data.clientOrderId = '';
					data.result = true;
				}else{
					data.result = false;
				}
				if(!data_bitfinex || !data_bitfinex.order_id){
					data.error = true;
					data.msg = data_bitfinex;
				}else{
					data.error = false;
				}
				cb(data);
			},cb)
		}
		if(params.exchange === "bigone"){
			self.bigoneExchange("new_order",params,function(data_bigone){
				console.log(data_bigone)
				var data = {};
				if(data_bigone.data && data_bigone.data.order_id){
					data.transactTime = '';
					data.orderId = data_bigone.data.order_id;
					data.clientOrderId = '';
					data.result = true;
				}else{
					data.result = false;
				}
				if(data_bigone.error){
					data.error = true;
					data.msg = data_bigone;
				}else{
					data.error = false;
				}
				cb(data);
			},cb)
		}
		
	}
	binanceExchange(method,params,cb){
		if(method == "new_order"){
			console.log(params);
			var argument = {};
			var pair = params.pair;
			var symbol = this.currency.binance[pair].I_C + this.currency.binance[pair].B_C;
			argument.symbol = symbol;
			argument.side = params.side;
			argument.price = params.price;
			argument.quantity = params.amount;
			argument.type = "limit";
			argument.timeInForce = "GTC";
			argument.recvWindow = "6000000";
			this.params.API.binance.newOrder(argument,function(rs){
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
			var pair = params.pair;
			var symbol = this.currency.hitbtc[pair].I_C + this.currency.hitbtc[pair].B_C;
			argument.symbol = symbol;
			argument.clientOrderId = params.clientOrderId;
			argument.side = params.side;
			argument.price = params.price;
			argument.quantity = params.amount;
			argument.type = "limit";
			argument.timeInForce = "GTC";
			this.params.API.hitbtc.newOrder(argument,function(rs){
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
			var pair = params.pair;
			var symbol = this.currency.okex[pair].I_C + '_' + this.currency.okex[pair].B_C;
			var argument = [
					{r:1,n:'amount',c:amount},
					{r:3,n:'price' ,c:price},
					{r:4,n:'symbol',c:symbol},
					{r:5,n:'type'  ,c:params.side}
			];
			this.params.API.okex.newOrder(argument,function(rs){
				console.log("\x1B[36m " + rs + "\x1B[0m \n");
				cb(rs)
			},cb)
		}else if(method == "balance"){

		}
	}

	huobiExchange(method,params,cb){
		if(method == "new_order"){
			console.log(params);
			var argument = {};
			var pair = params.pair;
			argument['account-id'] = "709933";
			argument.amount = params.amount;
			argument.price = params.price;
			argument.source = "api";
			argument.symbol = this.currency.huobi[pair].I_C + this.currency.huobi[pair].B_C;
			argument.type = params.side + "-limit";
			this.params.API.huobi.newOrder(argument,function(rs){
				console.log("\x1B[36m " + rs + "\x1B[0m \n");
				cb(rs)
			},cb)
		}
	}

	bitfinexExchange(method,params,cb){
		if(method == "new_order"){
			console.log(params);
			var argument = {};
			var pair = params.pair;
			argument.symbol = this.currency.bitfinex[pair].I_C + this.currency.bitfinex[pair].B_C;
			argument.amount = (params.amount).toString();
			argument.price =  (params.price).toString();
			argument.exchange = "bitfinex";
			argument.side = params.side;
			argument.type = "exchange market";
			this.params.API.bitfinex.newOrder(argument,function(rs){
				console.log("\x1B[36m " + JSON.stringify(rs) + "\x1B[0m \n");
				cb(rs)
			},cb)
		}
	}

	bigoneExchange(method,params,cb){
		console.log("submitorder")
		if(method == "new_order"){
			console.log(params);
			var argument = {};
			var pair = params.pair;
			argument.order_market = this.currency.bigone[pair].I_C + "-" + this.currency.bigone[pair].B_C;
			argument.amount = (params.amount).toString();
			argument.price =  (params.price).toString();
			argument.order_side = params.side === "buy" ? "BID" : "ASK";
			this.params.API.bigone.newOrder(argument,function(rs){
				console.log("bigone submitorder return format = " + typeof rs)
				console.log("\x1B[36m " + JSON.stringify(rs) + "\x1B[0m \n");
				cb(rs)
			},cb)
		}
	}

	saveOrder(
		order,
		current_time
		){
			var self = this;
			var rs = {};
			var pair = order.pair;
			var symbol = this.currency[order.exchange][pair].I_C + this.currency[order.exchange][pair].B_C;
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
			this.db.insert("exc_order",rs,function(rs1){
				if(rs1){
					//查询订单
					self.queryOrder(order,false);
				}
			});
			//查询余额
			self.db_balance(current_time,false);
	}
	db_balance(current_time,direct){
		//throw JSON.stringify({"level":"warning","type":"saveBalance","msg":"saveBalance failed"})
		var self = this;
		if(!direct){
			console.log("self.order_sell_submited = " + self.order_sell_submited);
			console.log("self.order_buy_submited = " + self.order_buy_submited);
			if(!self.order_sell_submited || !self.order_buy_submited ){return false;}	
		}
		console.log("start to save balance");
		this.getBalance(function(arr){
			var balance = {};
			balance.balance = JSON.stringify(arr);
			balance.timestamp = current_time;
			balance.total_B_C = arr.total_B_C;
			balance.total_I_C = arr.total_I_C;
			self.db.insert("exc_balance",balance,function(rs){
				if(rs)
				{
					//if(!direct){
						//throw "save balance saved";
					//}
					self.params.balanceSaved = true;
				}else{
					throw {"level":"warning","type":"saveBalance","msg":"saveBalance failed"}
				}

				console.log("self.params.balanceSaved = " + self.params.balanceSaved)
			});
			self.check_balance();

		});

	}
	getBalance(cb){
		var self = this;
		self.balance = {};
		this.params.exchanges.map((pv,pk)=>{
			if(pv.name == "binance" && pv.status == "open"){
				this.params.API.binance.balance({recvWindow :"6000000"},function(rs_binance){
					try{
						var rs_binance = JSON.parse(rs_binance)
						var binance = {};
						rs_binance.balances.map((v,k) => {
							pv.pairs.map((vp,kp)=>{
								var pair = vp.I_C + vp.B_C;
								if(v.asset == self.currency.binance[pair].B_C){
									binance[self.currency.binance[pair].B_C] = v;
									
								}
								if(v.asset == self.currency.binance[pair].I_C){
									binance[self.currency.binance[pair].I_C] = v;
								}
							})
						})
						self.balance.binance = binance;
						self._getBalance(self.balance,cb);
					}catch(e){
						throw {"level":"warning","type":"getbalance","exchange":"binance","msg":rs_binance}
					};
					
				},cb);
			}

			if(pv.name == "hitbtc" && pv.status == "open"){
				this.params.API.hitbtc.balance(function(rs_hitbtc){
					try{
						var rs_hitbtc = JSON.parse(rs_hitbtc)
						var hitbtc = {};
						rs_hitbtc.map((v,k) =>{
							pv.pairs.map((vp,kp)=>{
								var pair = vp.I_C + vp.B_C;
								if(v.currency == self.currency.hitbtc[pair].B_C){
									hitbtc[self.currency.hitbtc[pair].B_C] = v;
								}
								if(v.currency == self.currency.hitbtc[pair].I_C){
									hitbtc[self.currency.hitbtc[pair].I_C] = v;
								}
							})
						})
						self.balance.hitbtc = hitbtc;
						self._getBalance(self.balance,cb);
					}catch(e){
						throw {"level":"warning","type":"getbalance","exchange":"hitbtc","msg":rs_hitbtc}
					};
					
				},cb);
				
			}
			if(pv.name == "okex" && pv.status == "open"){
				this.params.API.okex.balance(function(rs_okex){
					try{
						var rs_okex = JSON.parse(rs_okex).info.funds
						var okex = {};
						pv.pairs.map((vp,kp)=>{
							var pair = vp.I_C + vp.B_C;
							var B_C = self.currency.okex[pair].B_C;
							var I_C = self.currency.okex[pair].I_C;

							var B_C_free = rs_okex.free[B_C];
							var B_C_freezed = rs_okex.freezed[B_C];

							okex[B_C] = {"asset":B_C,"free":B_C_free,"freezed":B_C_freezed};
							var I_C_free = rs_okex.free[I_C];
							var I_C_freezed = rs_okex.freezed[I_C];

							okex[I_C] = {"asset":I_C,"free":I_C_free,"freezed":I_C_freezed};
						});
						self.balance.okex = okex;
						self._getBalance(self.balance,cb);
					}catch(e){
						throw {"level":"warning","type":"getbalance","exchange":"okex","msg":rs_okex};
					};
				},cb);
				
			}
			if(pv.name == "huobi" && pv.status == "open"){
				this.params.API.huobi.balance(function(rs_huobi){
					try{
						var rs_huobi = JSON.parse(rs_huobi).data.list
						var huobi = {};
						pv.pairs.map((vp,kp)=>{
							var pair = vp.I_C + vp.B_C;
							var B_C = self.currency.huobi[pair].B_C;
							var I_C = self.currency.huobi[pair].I_C;
							var B_C_trade,B_C_frozen,I_C_trade,I_C_frozen;
							rs_huobi.map((v,k)=>{
								if(v.currency == B_C && v.type == "trade"){ B_C_trade = v.balance;	}
								if(v.currency == B_C && v.type == "frozen"){ B_C_frozen = v.balance; }
								if(v.currency == I_C && v.type == "trade"){	I_C_trade = v.balance; }
								if(v.currency == I_C && v.type == "frozen"){I_C_frozen = v.balance;	}
							})
							huobi[B_C] = {"asset":B_C,"trade":B_C_trade,"frozen":B_C_frozen};
							huobi[I_C] = {"asset":I_C,"trade":I_C_trade,"frozen":I_C_frozen};
						})
						self.balance.huobi = huobi;
						self._getBalance(self.balance,cb);
					}catch(e){
						throw {"level":"warning","type":"getbalance","exchange":"huobi","msg":rs_huobi}
					};
				},cb);
			}

			if(pv.name == "bitfinex" && pv.status == "open"){
				this.params.API.bitfinex.balance(function(rs_bitfinex){
					try{
						var bitfinex = {};
						pv.pairs.map((vp,kp)=>{
							var pair = vp.I_C + vp.B_C;
							var B_C = self.currency.bitfinex[pair].B_C;
							var I_C = self.currency.bitfinex[pair].I_C;
							var B_C_trade,B_C_frozen,I_C_trade,I_C_frozen;
							rs_bitfinex.map((v,k)=>{
								if(v.currency == B_C.toLowerCase() && v.type == "exchange"){ B_C_trade = v.available;}
								if(v.currency == B_C.toLowerCase() && v.type == "exchange"){ B_C_frozen = v.amount - v.available;}
								if(v.currency == I_C.toLowerCase() && v.type == "exchange"){ I_C_trade = v.available; }
								if(v.currency == I_C.toLowerCase() && v.type == "exchange"){ I_C_frozen = v.amount - v.available;}
							})
							bitfinex[B_C] = {"asset":B_C,"available":B_C_trade || 0 ,"locked":B_C_frozen || 0 };
							bitfinex[I_C] = {"asset":I_C,"available":I_C_trade || 0 ,"locked":I_C_frozen || 0 };
						})
						self.balance.bitfinex = bitfinex;
						self._getBalance(self.balance,cb);
					}catch(e){
						throw {"level":"warning","type":"getbalance","exchange":"bitfinex","msg":rs_bitfinex}
					};
				},cb);
			}

			if(pv.name == "bigone" && pv.status == "open"){
				console.log("savebalance-bigone-to")
				this.params.API.bigone.balance(function(rs_bigone){
					console.log("savebalance-bigone-get")
					try{
						var rs_bigone = JSON.parse(rs_bigone).data;
						var bigone = {};
						pv.pairs.map((vp,kp)=>{
							var pair = vp.I_C + vp.B_C;
							var B_C = self.currency.bigone[pair].B_C;
							var I_C = self.currency.bigone[pair].I_C;
							var B_C_trade,B_C_frozen,I_C_trade,I_C_frozen;
							rs_bigone.map((v,k)=>{
								if(v.type == "account"){
									if(v.account_type == B_C ){ B_C_trade = v.active_balance; }
									if(v.account_type == B_C ){ B_C_frozen = v.frozen_balance; }
									if(v.account_type == I_C ){ I_C_trade = v.active_balance; }
									if(v.account_type == I_C ){ I_C_frozen = v.frozen_balance; }
								}
							})
							bigone[B_C] = {"asset":B_C,"available":B_C_trade || 0 ,"locked":B_C_frozen || 0 };
							bigone[I_C] = {"asset":I_C,"available":I_C_trade || 0 ,"locked":I_C_frozen || 0 };
						})
						self.balance.bigone = bigone;
						self._getBalance(self.balance,cb);
					}catch(e){
						console.log(rs_bigone)
						throw {"level":"warning","type":"getbalance","exchange":"bigone","msg":rs_bigone}
					};
				},cb);
			}
		})
	}
	_getBalance(balance,cb){
		//console.log(balance);
		balance.total_B_C = 0;
		balance.total_I_C = 0;
		var back = {}
		var check = true;
		this.params.exchanges.map((v,k)=>{
			if(v.status == "open" && !balance[v.name]) check = false;
			if(v.status == "open") back[v.name] = balance[v.name];
			
		});
		if(!check){
			return;
		}
		back.timestamp = new Date().getTime();
		back.total_B_C = 0
		back.total_I_C =0 
		cb(back);
	}
	check_balance(){
		var self = this;
		//检查连续失败订单
		var time = new Date().getTime() -  5 * 60 * 1000;
		this.db.query("SELECT COUNT( * ) FROM exc_order WHERE (status = 0 and submitTime > "+time+" ) ",function(data){
			for(var k in data){var count = data[k]}
			if(count >= 5){
				self.db.query("UPDATE exc_set SET pause = 0 WHERE id = 1",function(data){});
				//self.params.pause = true;
				//throw "order error check_balance"
			}
		})
	}
	queryOrder(order,direct){
		var self = this;
		var exchange = order.exchange;
		var argument = {};
		if(order.exchange == "binance"){
			argument.orderId = order.orderId;
			argument.origClientOrderId = order.clientOrderId;
			argument.symbol = self.currency.binance[order.pair].I_C + self.currency.binance[order.pair].B_C;
			this.params.API.binance.queryOrder(argument,function(rs){
				try{
					console.log("\x1B[36m " + rs + "\x1B[0m \n");
					var rs = JSON.parse(rs);
					if(rs && rs.status === "FILLED"){
						var status = "FILLED";
						self.orderFilled(order);
					}else if(rs && rs.status === "CANCELED"){
						var status = "CANCELED";
						self.orderCanceled(order);
					}else{
						var status = "NOT FILLED";
					}
					console.log("\x1B[36m " + JSON.stringify({
						exchange:"binance",
						side:order.side,
						status:rs.status,
					}) + "\x1B[0m \n");
				}catch(e){
					throw {"level":"warning","type":"queryOrder","exchange":"binance","msg":rs}
				}
			})
		}else if(order.exchange == "hitbtc"){
			argument.clientOrderId = order.clientOrderId;
			this.params.API.hitbtc.queryOrder(argument,function(rs){
				try{
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
				}catch(e){
					throw {"level":"warning","type":"queryOrder","exchange":"hitbtc","msg":rs}
				}
			})
		}else if(order.exchange == "okex" && direct){
			argument.orderId = order.orderId;
			argument.symbol = self.currency.okex[order.pair].I_C + '_' + self.currency.okex[order.pair].B_C;
			this.params.API.okex.queryOrder(argument,function(rs){
				try{
					console.log("\x1B[36m " + rs + "\x1B[0m \n");
					var rs = JSON.parse(rs);
					if(rs.result == true && rs.orders[0].status == 2){
						var status = "FILLED";
						self.orderFilled(order);
					}else if(rs.result == true && rs.orders[0].status == -1){
						var status = "CANCELED";
						self.orderCanceled(order);
					}else{
						var status = "NOT FILLED";
					}
					console.log("\x1B[36m " + JSON.stringify({
						exchange:"okex",
						side:order.side,
						status:status,
					}) + "\x1B[0m \n");

				}catch(e){
					throw {"level":"warning","type":"queryOrder","exchange":"okex","msg":rs}
				}
			})	
		}else if(order.exchange == "huobi"){
			argument.orderId = order.orderId;
			this.params.API.huobi.queryOrder(argument,function(rs){
				try{
					console.log("\x1B[36m " + rs + "\x1B[0m \n");
					var rs = JSON.parse(rs);
					if(rs.data && rs.data.state == "filled"){
						var status = "FILLED";
						self.orderFilled(order);
					}else if(rs.data && rs.data.state == "canceled"){
						var status = "CANCELED";
						self.orderCanceled(order);
					}else{
						var status = "NOT FILLED";
					}
					console.log("\x1B[36m " + JSON.stringify({
						exchange:"huobi",
						side:order.side,
						status:status,
					}) + "\x1B[0m \n");
				}catch(e){
					throw {"level":"warning","type":"queryOrder","exchange":"huobi","msg":rs}
				}
			})
		}else if(order.exchange == "bitfinex" && direct){
			argument.order_id = parseInt(order.orderId);
			this.params.API.bitfinex.queryOrder(argument,function(rs){
				try{
					console.log("\x1B[36m " + JSON.stringify(rs) + "\x1B[0m \n");
					if(!rs.is_live && !rs.is_cancelled){
						var status = "FILLED";
						self.orderFilled(order);
					}else if( rs.is_cancelled ){
						var status = "CANCELED";
						self.orderCanceled(order);
					}else{
						var status = "NOT FILLED";
					}
					console.log("\x1B[36m " + JSON.stringify({
						exchange:"bitfinex",
						side:order.side,
						status:status,
					}) + "\x1B[0m \n");
				}catch(e){
					throw {"level":"warning","type":"queryOrder","exchange":"bitfinex","msg":JSON.stringify(rs)}
				}
			})

		}else if(order.exchange == "bigone" && direct){
			argument.order_id = order.orderId;
			console.log("queryorder-bigone-to")
			this.params.API.bigone.queryOrder(argument,function(rs){
				try{
					
					console.log("\x1B[36m " + rs + "\x1B[0m \n");
					var data = JSON.parse(rs).data 
					if(data && data.order_state == "filled"){
						var status = "FILLED";
						self.orderFilled(order);
					}else if(data && data.order_state == "canceled"){
						var status = "CANCELED";
						self.orderCanceled(order);
					}else{
						var status = "NOT FILLED";
					}
					console.log("\x1B[36m " + JSON.stringify({
						exchange:"bigone",
						side:order.side,
						status:status,
					}) + "\x1B[0m \n");
				}catch(e){
					throw {"level":"warning","type":"queryOrder","exchange":"bigone","msg":rs}
				}
			})
		}
	}
	orderFilled(order){
		//console.log("UPDATE exc_order SET status = 1 WHERE clientOrderId = \"" + order.clientOrderId + "\"");
		this.db.query("UPDATE exc_order SET status = 1 WHERE clientOrderId = \"" + order.clientOrderId + "\"",function(data){})

	}
	orderCanceled(order){
		this.db.query("UPDATE exc_order SET status = 2 WHERE clientOrderId = \"" + order.clientOrderId + "\"",function(data){})
	}
	saveErrorOrder(order){
		this.db.insert("exc_error_order",order);
		console.log(typeof order)
		console.log(order)
		throw {"level":"error","type":"submitOrderError","exchange":order.exchange,"msg":order}
	}
}

module.exports = exchange;