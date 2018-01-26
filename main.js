'use strict'
var Exchange = require("./exchange");
class main {
	constructor(params){
		
		this.params = params;
		this.db = params.db;
	}
	refreshData(){

		if(new Date().getTime() - this.params.freshTime < 50){
			//console.log("\x1B[33m Warning : freshTime < 50... = " + (new Date().getTime() - this.params.freshTime)  +"\x1B[0m \n");
			return;
		}
		this.params.freshTime = new Date().getTime();
		console.log(new Date())
		var self = this;
		for(var k in this.params.orders){
			for(var kp in this.params.orders[k]){
				if(this.params.orders[k][kp] == null){
					console.log("\x1B[33m Warning : 获取数据... "+k + kp+" \x1B[0m \n");
					return false;
				}
			}
		}

		this.db.query("SELECT * FROM exc_balance ORDER BY timestamp desc LIMIT 1 ",(data)=>{
			
			if(data == null){
				console.log("\x1B[31m Error : 数据库异常 \x1B[0m \n");
				return false;
			}
			if(!data.balance){
				console.log("\x1B[31m Error : 获取余额失败 \x1B[0m \n");
				return false;
			}
			var result = []
			this.params.exchanges.map((v,k)=>{
				var exchangeA = v;
				var exchanges = self.params.exchanges;
				result.push(self.comparePrice(exchangeA,exchanges,data.balance));
			})
			result.map((v,k)=>{
				if(v.str_profit){
					console.log(v.str_profit)
				}
				if(v.str_createorder){
					console.log(v.str_createorder)
				}
				
				if(v.str_amount_error){
					console.log(v.str_amount_error)
				}
			})
			
			if(typeof (this.params.balanceSaved) === "number" ){
				if(new Date().getTime() - this.params.balanceSaved  < 10000){
					console.log(new Date().getTime() - this.params.balanceSaved);
					console.log("\x1B[33m Error : saving the balance... \x1B[0m \n");
					return false;
				}else{
					var msg =  "balanceSaved  error : new Date().getTime() - this.params.balanceSaved = " + (new Date().getTime() - this.params.balanceSaved);
					throw {"level":"warning","type":"getbalance","exchange":"——","msg":msg}
				}
			}


			var orders = [];
			result.map((v,k)=>{
				if((v.orders).length != 0){
					orders = orders.concat(v.orders)
				}
			})
				
			if(orders.length > 0){
				console.log(orders)
				this.createOrder(orders)
			}else{
				console.log("\n")
				return false;
			}
		})
	}

	createOrder(orders){
		console.log("createorder")
		var orders1 = [];
		var orders2 = [];
		var orders3 = [];
		orders.map((v,k)=>{
			if(v.pair === "eosbtc"){
				orders1.push(v);
			}
			if(v.pair === "ethbtc"){
				orders2.push(v)
			}
			if(v.pair === "eoseth"){
				orders3.push(v)
			}
		})
		var orders_c = [];
		if(orders1.length > 0 ){
			orders_c = orders1;
		}
		if(orders1.length == 0 && orders2.length > 0){
			orders_c = orders2;
		}
		if(orders1.length == 0 && orders2.length == 0 && orders3.length > 0){
			orders_c = orders3;
		}

		orders_c.sort((a,b)=>{return b.Profit - a.Profit});
		var order = {};
		var sell = {};
		var buy = {};
		var exchange = orders_c[0].exchange;
		var price  = orders_c[0].price;
		var amount = orders_c[0].amount;
		var pair = orders_c[0].pair;
		sell.exchange = exchange[0];
		sell.price = price[0];
		buy.exchange = exchange[1];
		buy.price = price[1];
		order.pair = pair;
		order.sell = sell;
		order.buy = buy;
		order.amount = amount;
		
		console.log(order);
		//return;
		
		//throw "order"
		this.orderSubmit(order);


	}


	orderSubmit(order){
		//throw "order"
		var self = this
		var db = self.db;
		var params = self.params;
		if(	self.params.autoExchange === true ){
			if(self.params.pause === false){
				var exchange = new Exchange(order,params);
				exchange.trade();
			}else{
				console.log(" \x1B[33m 交易已暂停 \x1B[0m \n");
				
				var time = new Date().getTime() - 5 * 60 * 1000;
				self.db.query("SELECT COUNT( * ) FROM exc_order WHERE (status = 0 and submitTime > "+time+") ",function(data){
					for(var k in data){var count = data[k]}
					if(count < 5){
						self.db.query("UPDATE exc_set SET pause = 1 WHERE id = 1",function(data){});
					}
				})

				var time = new Date().getTime() - 20 * 60 * 1000;
				self.db.query("SELECT COUNT( * ) FROM exc_order WHERE (status = 0 and submitTime > "+time+") ",function(data){
					for(var k in data){var count = data[k]}
					if(count > 15 ){
						throw "failed order = "+ count + " > 15";
					}
				})

			}
		}else{
			console.log(" \x1B[33m 交易已关闭 \x1B[0m \n");
		}
		self.db.findOne("exc_set",(data)=>{
			if(data){
				if(data.pause == 1){
					self.params.pause = false
				}else if(data.pause == 0){
					self.params.pause = true
				}
				if(data.autoExchange == 1){
					self.params.autoExchange = true
				}else if(data.autoExchange == 0){
					self.params.autoExchange = false
				}
			}else{
				return;
			}
			
		})
	}

	comparePrice(exchangeA, exchanges, balance){
		var self = this;
		var orders = [];
		var str_createorder = "";
		var str_profit = "";
		var str_amount_error = "";
		this.params.Pairs.map((vp,kp)=>{
			try{
				var pair = vp.I_C + vp.B_C
				var exchangeAHighestBid = this.params.orders[exchangeA+"HighestBid"][pair];
				var exchangeALowestAsk = this.params.orders[exchangeA+"LowestAsk"][pair];
				var exchangeAHBP = parseFloat(JSON.parse(exchangeAHighestBid)[0]);
				var exchangeAHBA = parseFloat( JSON.parse(exchangeAHighestBid)[1]);
				var str = "";
				exchanges.map( exchangeB =>{
					if(exchangeA != exchangeB){
						var exchangeBHighestBid = this.params.orders[exchangeB+"HighestBid"][pair];
						var exchangeBLowestAsk = this.params.orders[exchangeB+"LowestAsk"][pair];
						var exchangeBLAP = parseFloat(JSON.parse(exchangeBLowestAsk)[0]);
						var exchangeBLAA = parseFloat(JSON.parse(exchangeBLowestAsk)[1]);
						str += " " + exchangeB + " 最低ask = " + exchangeBLAP + " 差价 = \x1B[36m "+ parseFloat(exchangeAHBP - exchangeBLAP).toFixed(8) +" \x1B[0m "
						var AToBPrice = exchangeAHBP - exchangeBLAP;
						var rate = self.params.rate;
						if(AToBPrice > 0){
							var Profit = exchangeAHBP * ( 1 - rate[exchangeA] ) - exchangeBLAP * ( 1 + rate[exchangeB]);
							if(Profit > 0){
								str_createorder += "createOrder - " + pair + " - " + exchangeA + " To " + exchangeB + "\n";
								var amount = ((exchangeAHBA - exchangeBLAA) >= 0) ? exchangeBLAA : exchangeAHBA;
								var orderAmount = amount;
								var balances = self.params.balances;
								var balanceA = balances[exchangeA];
								var balanceB = balances[exchangeB];
								
								try{
									var I_C_sell = JSON.parse(balance)[exchangeA][balanceA[pair].I_C][balanceA.free];
									var B_C_buy = JSON.parse(balance)[exchangeB][balanceB[pair].B_C][balanceB.free];
								}catch(err){
									throw {"level":"error","type":"getbalance","msg":err}
								}
								if(exchangeB === "hitbtc"){ B_C_buy = B_C_buy - 0.001 }
								var I_C_buy = B_C_buy / (exchangeBLAP * ( 1 + rate[exchangeB]));

								var amount_max = [];
								amount_max.push(I_C_sell);
								amount_max.push(I_C_buy);
								amount_max.sort((a,b)=>{return a-b});

								var digit = 0 , amount_top = 0;


								//设置 amount 位数
								if(pair === "eosbtc"){
									digit = 1;
								}
								if(pair === "ethbtc"){
									digit = 1000;
								}
								if(pair === "eoseth"){
									digit = 100;
								}
								amount = Math.floor(amount * digit) / digit;

								//设置交易所交易对最小限制
								var min_amount = []
								//btc 最小交易量0.002   binance
								if(vp.B_C === "btc"){
									min_amount.push(Math.ceil(0.002 / exchangeAHBP * digit) / digit);
									min_amount.push(Math.ceil(0.002 / exchangeBLAP * digit) /digit);
								}
								//eth 最小交易量0.02   binance
								if(vp.B_C === "eth"){
									min_amount.push(Math.ceil(0.02 / exchangeAHBP * digit) /  digit);
									min_amount.push(Math.ceil(0.02 / exchangeBLAP * digit) /  digit);
								}
								min_amount.sort((a,b)=>{return b-a});
								if(amount > amount_max[0]){
									amount = Math.floor(amount_max[0] * digit) / digit ;
								}
								if(vp.I_C === "btc"){
									amount_top = 0.1;
								}
								if(vp.I_C === "eth"){
									amount_top = 2
								}
								if(vp.I_C === "eos"){
									amount_top = 200
								}

								if(amount > amount_top){
									amount = amount_top;
								}
								if(typeof amount != "number"){return false;}
								if(amount > min_amount[0] ){
									orders.push({pair:pair,exchange:[exchangeA, exchangeB],price:[exchangeAHBP, exchangeBLAP],amount:amount,Profit:Profit})
								}else{
									str_amount_error += " \x1B[31m Error :amount = "+ amount +"  min_amount = "+min_amount[0]+"  , amount_max = "+amount_max[0]+" , order_amount = " + orderAmount + "\x1B[0m \n";
								}
							}else{
								str_profit += "\x1B[31m " + pair +" - " + exchangeA + "To" + exchangeB + "Profit = "+ exchangeAHBP +" * ( 1 - "+ rate[exchangeA] +" )"+" - "+ exchangeBLAP +" * ( 1 +  "+ rate[exchangeB] +") = " + Profit +"\x1B[0m \n"
							}
							 
						}
					}
				})
				console.log( "\x1B[36m" + pair+" \x1B[0m " + exchangeA + " 最高bid = "+ exchangeAHBP + str +"\n");

			}catch(e){
				console.log(e);
				return false;
			}
		})
		
		return {orders:orders,str_createorder:str_createorder,str_profit:str_profit,str_amount_error};

	}

	queryFailedOrder(exchange){
			//查询未成交订单
		var self = this;
		var once = 0;
		setInterval(function(){
			if(typeof (self.params.balanceSaved) == "boolean" && self.params.balanceSaved == true){
				self.db.findAll("SELECT * FROM exc_order WHERE (status = 0 ) order by id desc limit "+once+",1",function(data){
					once ++ 
					if(data.length != 0){
						if(self.params.exchanges.indexOf(data[0].exchange) == -1 ){return;}
						var order = data[0];
						order.pair = (data[0].symbol).toLowerCase();
						order.side = data[0].type;
						self._queryFailedOrder(exchange,order);
					}else{
						once = 0;
					}
				})

				//检查订单
				var limit = 5;
				self.db.findAll("SELECT * FROM exc_order WHERE (status = 0 ) order by id desc limit "+limit,function(data){
					if(data.length < limit) return;
					data.sort((a,b)=>{
						return b.price - a.price;
					})
					if(data[0].price == data[limit-1].price){
						self.params.autoExchange = false;
						throw "重复失败订单>"+limit;
					}else{

					}
				})
			}
		},1000);
	}

	_queryFailedOrder(exchange,order){
		exchange.queryOrder(order,true);
	}
}


module.exports = main;