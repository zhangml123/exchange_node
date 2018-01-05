'use strict'
var Exchange = require("./exchange");
var common = require("./common")
class main extends common{
	constructor(params){
		super();
		this.params = params;
		this.db = params.db;
	}
	refreshData(){
		var self = this;
		for(var k in this.params.orders){

			if(this.params.orders[k] == null){
				console.log("\x1B[33m Warning : 获取数据... \x1B[0m \n");
				return false;
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
			if(this.params.balanceSaved === false){
				console.log("\x1B[33m Error : saving the balance... \x1B[0m \n");
				return false;
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
		orders.sort((a,b)=>{return b.Profit - a.Profit});
		var order = {};
		var sell = {};
		var buy = {};
		var exchange = orders[0].exchange;
		var price  = orders[0].price;
		var amount = orders[0].amount;
		sell.exchange = exchange[0];
		sell.price = price[0];
		buy.exchange = exchange[1];
		buy.price = price[1];
		order.sell = sell;
		order.buy = buy;
		order.amount = amount;
		console.log(order);
		
//return ;
	
		this.orderSubmit(order);


	}


	orderSubmit(order){
		var self = this
		var db = self.db;
		var params = self.params;
		if(	self.params.autoExchange === true ){

			console.log("self.params.pause1111 = "+self.params.pause)
			if(self.params.pause === false){
				var exchange = new Exchange(order,params);
				exchange.trade();
			}else{
				console.log(" \x1B[33m 交易已暂停 \x1B[0m \n");
				
				var time = new Date().getTime() - 300 * 1000;
				self.db.query("SELECT COUNT( * ) FROM exc_order WHERE (status = 0 and submitTime > "+time+") ",function(data){
					for(var k in data){var count = data[k]}
					if(count < 5){
						self.db.query("UPDATE exc_set SET pause = 1 WHERE id = 1",function(data){});
					}
				})

				var time = new Date().getTime() - 600 * 1000;
				self.db.query("SELECT COUNT( * ) FROM exc_order WHERE (status = 0 and submitTime > "+time+") ",function(data){
					for(var k in data){var count = data[k]}
					if(count > 8 ){
						throw "failed order = "+ count + " > 8";
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
		var exchangeAHighestBid = this.params.orders[exchangeA+"HighestBid"];
		var exchangeALowestAsk = this.params.orders[exchangeA+"LowestAsk"];
		var exchangeAHBP = parseFloat(JSON.parse(exchangeAHighestBid)[0]).toFixed(8);
		var exchangeAHBA = parseFloat( JSON.parse(exchangeAHighestBid)[1]).toFixed(8);
		var str = "";
		var str_createorder = "";
		var str_profit = "";
		var str_amount_error = "";
		exchanges.map( exchangeB =>{
			if(exchangeA != exchangeB){
				var exchangeBHighestBid = this.params.orders[exchangeB+"HighestBid"];
				var exchangeBLowestAsk = this.params.orders[exchangeB+"LowestAsk"];
				var exchangeBLAP = parseFloat(JSON.parse(exchangeBLowestAsk)[0]).toFixed(8);
				var exchangeBLAA = parseFloat(JSON.parse(exchangeBLowestAsk)[1]).toFixed(8);
				
				str += " " + exchangeB + " 最低ask = " + exchangeBLAP + " 差价 = \x1B[36m "+ parseFloat(exchangeAHBP - exchangeBLAP).toFixed(8) +" \x1B[0m "
				var AToBPrice = exchangeAHBP - exchangeBLAP;
				var rate = self.params.rate;
				if(AToBPrice > 0){
					var Profit = exchangeAHBP * ( 1 - rate[exchangeA] ) - exchangeBLAP * ( 1 + rate[exchangeB]);
					if(Profit > 0){
						str_createorder += "createOrder - " + exchangeA + " To " + exchangeB + "\n";
						var amount = ((exchangeAHBA - exchangeBLAA) >= 0) ? exchangeBLAA : exchangeAHBA;
						var orderAmount = amount;
						var balances = self.params.balances;
						var balanceA = balances[exchangeA];
						var balanceB = balances[exchangeB]

						var I_C_sell = JSON.parse(balance)[exchangeA][balanceA.I_C][balanceA.free];
						var B_C_buy = JSON.parse(balance)[exchangeB][balanceB.B_C][balanceB.free];
						if(exchangeB === "hitbtc"){ B_C_buy = B_C_buy - 0.001 }
						var I_C_buy = B_C_buy / (exchangeBLAP * ( 1 + rate[exchangeB]));

						var amount_max = [];
						amount_max.push(I_C_sell);
						amount_max.push(I_C_buy);
						amount_max.sort((a,b)=>{return a-b});
						amount = Math.floor(amount ) ;



						console.log("I_C_sell = "+I_C_sell)
						console.log("I_C_buy = "+I_C_buy)
						console.log(amount_max)
						if(amount > amount_max[0]){
							amount = Math.floor(amount_max[0]) ;
						}
						if(amount > 500){
							amount = 500;
						}

						console.log("amount = "+amount)
						if(typeof amount != "number"){return false;}
						if(exchangeA === "binance" && (exchangeAHBP * amount) <= 0.002 ) amount = 0;
						if(exchangeB === "binance" && (exchangeBLAP * amount) <= 0.002) amount = 0;
						if(amount >= 5 ){
							
							orders.push({exchange:[exchangeA, exchangeB],price:[exchangeAHBP, exchangeBLAP],amount:amount,Profit:Profit})
						}else{
							str_amount_error += " \x1B[31m Error : amount < 5 , amount_max = "+amount_max[0]+" , order_amount = " + orderAmount + "\x1B[0m \n";
						}
					}else{
						str_profit += "\x1B[31m " + exchangeA + "To" + exchangeB + "Profit = "+ exchangeAHBP +" * ( 1 - "+ rate[exchangeA] +" )"+" - "+ exchangeBLAP +" * ( 1 +  "+ rate[exchangeB] +") = " + Profit +"\x1B[0m \n"
					}
					 
				}

			}
		})
		console.log( exchangeA + " 最高bid = "+ exchangeAHBP + str +"\n");
		return {orders:orders,str_createorder:str_createorder,str_profit:str_profit,str_amount_error};

	}
}


module.exports = main;