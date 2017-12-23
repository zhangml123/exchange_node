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
		var localStorage  = this.params.localStorage;
		this.binanceLowestAsk = localStorage.getItem('binanceLowestAsk');
		this.binacneHighestBid = localStorage.getItem('binacneHighestBid');
		this.hitbtcLowestAsk = localStorage.getItem('hitbtcLowestAsk');
		this.hitbtcHighestBid = localStorage.getItem('hitbtcHighestBid');


		//console.log(this.binanceLowestAsk)
		//console.log(this.binacneHighestBid );

		//this.bitfinexLowestAsk = localStorage.getItem('bitfinexLowestAsk');
		//this.bitfinexHighestBid = localStorage.getItem('bitfinexHighestBid');
		try{
			var binanceLAPrice = parseFloat(JSON.parse(this.binanceLowestAsk)[0]).toFixed(8);
			var binanceLAAmount = parseFloat(JSON.parse(this.binanceLowestAsk)[1]).toFixed(8); 
			var binanceHBPrice = parseFloat(JSON.parse(this.binacneHighestBid)[0]).toFixed(8);
			var binanceHBAmount = parseFloat(JSON.parse(this.binacneHighestBid)[1]).toFixed(8);

			var hitbtcLAPrice = parseFloat(JSON.parse(this.hitbtcLowestAsk)[0]).toFixed(8);
			var hitbtcLAAmount = parseFloat(JSON.parse(this.hitbtcLowestAsk)[1]).toFixed(8);
			var hitbtcHBPrice = parseFloat(JSON.parse(this.hitbtcHighestBid)[0]).toFixed(8);
			var hitbtcHBAmount = parseFloat(JSON.parse(this.hitbtcHighestBid)[1]).toFixed(8);

			//var bitfinexLAPrice = parseFloat(JSON.parse(this.bitfinexLowestAsk).ask).toFixed(8);
			//var bitfinexLAAmount = parseFloat(JSON.parse(this.bitfinexLowestAsk).amount).toFixed(8);
			//var bitfinexHBPrice = parseFloat(JSON.parse(this.bitfinexHighestBid).bid).toFixed(8);
			//var bitfinexHBAmount = parseFloat(JSON.parse(this.bitfinexHighestBid).amount).toFixed(8);
		}catch(e){
			console.log(e)

		}
		
		if( binanceLAPrice && binanceLAAmount &&
			binanceHBPrice && binanceHBAmount &&
			hitbtcLAPrice && hitbtcLAAmount &&
			hitbtcHBPrice && hitbtcHBAmount //&&
			//bitfinexLAPrice && bitfinexLAAmount &&
			//bitfinexHBPrice && bitfinexHBAmount

		){
			//console.log("binance  最高bid = \x1B[36m"+parseFloat(binanceHBPrice).toFixed(8) +'\x1B[0m amount = '+parseFloat(binanceHBAmount).toFixed(8) +"binance 最低ask = \x1B[36m"+parseFloat(binanceLAPrice).toFixed(8) +'\x1B[0m amount = '+parseFloat(binanceLAAmount).toFixed(8) +'\n') ;
			//console.log("hitbtc   最高bid = \x1B[33m"+parseFloat(hitbtcHBPrice).toFixed(8) +'\x1B[0m amount = '+parseFloat(hitbtcHBAmount).toFixed(8) +"binance 最低ask = \x1B[33m"+parseFloat(hitbtcLAPrice).toFixed(8) +'\x1B[0m amount = '+parseFloat(hitbtcLAAmount).toFixed(8) +'\n') ;
			//console.log("bitfinex 最高bid = \x1B[32m"+parseFloat(bitfinexHBPrice).toFixed(8) +'\x1B[0m amount = '+parseFloat(bitfinexHBAmount).toFixed(8) +"binance 最低ask = \x1B[32m"+parseFloat(bitfinexLAPrice).toFixed(8) +'\x1B[0m amount = '+parseFloat(bitfinexLAAmount).toFixed(8) +'\n') ;

			var binanceToHitbtcPrice = parseFloat(binanceHBPrice - hitbtcLAPrice).toFixed(8);
		//	var binanceToBitfinexPrice =  parseFloat(binanceHBPrice - bitfinexLAPrice).toFixed(8);

			var hitbtcToBinancePrice =  parseFloat(hitbtcHBPrice - binanceLAPrice).toFixed(8);
			//var hitbtcToBitfinexPrice =  parseFloat(hitbtcHBPrice - bitfinexLAPrice).toFixed(8);

			//var bitfinexToBinancePrice =  parseFloat(bitfinexHBPrice - binanceLAPrice).toFixed(8);
			//var bitfinexToHitbtcPrice =  parseFloat(bitfinexHBPrice - hitbtcLAPrice).toFixed(8);

			/*console.log("binance  最高bid = "+binanceHBPrice+" hitbtc  最低ask = "+hitbtcLAPrice+" 差价 = \x1B[36m"+binanceToHitbtcPrice+
						"\x1B[0m bitfinex 最低ask = "+bitfinexLAPrice+" 差价 = \x1B[36m"+binanceToBitfinexPrice+"\x1B[0m\n");
			console.log("hitbtc   最高bid = "+hitbtcHBPrice+" binance 最低ask = "+binanceLAPrice+" 差价 = \x1B[36m"+hitbtcToBinancePrice+
						"\x1B[0m bitfinex 最低ask = "+bitfinexLAPrice+" 差价 = \x1B[36m"+hitbtcToBitfinexPrice+"\x1B[0m\n");
			console.log("bitfinex 最高bid = "+bitfinexHBPrice+" hitbtc  最低ask = "+hitbtcLAPrice+" 差价 = \x1B[36m"+bitfinexToHitbtcPrice+
						"\x1B[0m binance  最低ask = "+binanceLAPrice+" 差价 = \x1B[36m"+bitfinexToBinancePrice+"\x1B[0m\n\n");
*/

			console.log("binance  最高bid = "+binanceHBPrice+" hitbtc  最低ask = "+hitbtcLAPrice+" 差价 = \x1B[36m"+binanceToHitbtcPrice+
						"\x1B[0m hitbtc   最高bid = "+hitbtcHBPrice+" binance 最低ask = "+binanceLAPrice+" 差价 = \x1B[36m"+hitbtcToBinancePrice+"\x1B[0m \n")

			var rate= {};
			rate.binance = 0.0005;
			rate.hitbtc = 0.001;
			rate.bitfinex = 0.002;

			var orders = [];
			if(binanceToHitbtcPrice > 0 && hitbtcToBinancePrice <= 0){
				var binanceToHitbtcProfit = binanceHBPrice * ( 1 - rate.binance ) - hitbtcLAPrice * ( 1 +  rate.hitbtc);
				if(binanceToHitbtcProfit > 0){
					console.log("createOrder - binance To hitbtc");
					var amount = (binanceHBAmount - hitbtcLAAmount) >= 0 ? hitbtcLAAmount : binanceHBAmount;
					orders.push({exchange:["binance","hitbtc"],price:[binanceHBPrice,hitbtcLAPrice],amount:amount,Profit:binanceToHitbtcProfit})
				}else{
					console.log("\x1B[31m binanceToHitbtcProfit = "+binanceHBPrice+" * ( 1 - "+rate.binance+" )"+" - "+hitbtcLAPrice +" * ( 1 +  "+rate.hitbtc+") = " + binanceToHitbtcProfit +"\x1B[0m \n")	
				}
				//this.createOrder(["binance","hitbtc"],[binanceHBPrice,hitbtcLAPrice],amount);
			}
		/*	if(binanceToBitfinexPrice > 0 && bitfinexToBinancePrice <= 0){
				var binanceToBitfinexProfit = binanceHBPrice * (1 - rate.binance ) - bitfinexLAPrice * ( 1 + rate.bitfinex);
				if(binanceToBitfinexProfit > 0){
					console.log("createOrder - binance To bitfinex");
					var amount = (binanceHBAmount - bitfinexLAAmount) >= 0 ? bitfinexLAAmount : binanceHBAmount;
					orders.push({exchange:["binance","bitfinex"],price:[binanceHBPrice,bitfinexLAPrice],amount:amount,Profit:binanceToBitfinexProfit})
				}else{
					console.log("binanceToBitfinexProfit = "+binanceHBPrice+" * ( 1 - "+rate.binance+" )"+" - "+bitfinexLAPrice +" * ( 1 +  "+rate.bitfinex+") = " + binanceToBitfinexProfit)	
				}
				//this.createOrder(["binance","bitfinex"],[binanceHBPrice,bitfinexLAPrice],amount);
			}*/
			if(hitbtcToBinancePrice > 0 && binanceToHitbtcPrice <= 0){
				var hitbtcToBinanceProfit = hitbtcHBPrice * ( 1 - rate.hitbtc ) - binanceLAPrice * ( 1 + rate.binance);
				if(hitbtcToBinanceProfit > 0 ){
					console.log("createOrder - hitbtc To binance");
					var amount = ((hitbtcHBAmount - binanceLAAmount) >= 0) ? binanceLAAmount : hitbtcHBAmount;
					orders.push({exchange:["hitbtc","binance"],price:[hitbtcHBPrice,binanceLAPrice],amount:amount,Profit:hitbtcToBinanceProfit})
				}else{
					console.log("\x1B[31m hitbtcToBinanceProfit = "+hitbtcHBPrice+" * ( 1 - "+rate.hitbtc+" )"+" - "+binanceLAPrice +" * ( 1 +  "+rate.binance+") = " + hitbtcToBinanceProfit +"\x1B[0m \n")	
				}
				//this.createOrder(["hitbtc","binance"],[hitbtcHBPrice,binanceLAPrice],amount);
			}
			/*if(hitbtcToBitfinexPrice > 0 && bitfinexToHitbtcPrice <= 0 ){
				var hitbtcToBitfinexProfit = hitbtcHBPrice * ( 1 - rate.hitbtc ) - bitfinexLAPrice * ( 1 + rate.bitfinex);
				if(hitbtcToBitfinexProfit > 0 ){
					console.log("createOrder - hitbtc To bitfinex");
					var amount = (hitbtcHBAmount - bitfinexLAAmount) >= 0 ? bitfinexLAAmount : hitbtcHBAmount;
					orders.push({exchange:["hitbtc","bitfinex"],price:[hitbtcHBPrice,bitfinexLAPrice],amount:amount,Profit:hitbtcToBitfinexProfit})
				}else{
					console.log("hitbtcToBitfinexProfit = "+hitbtcHBPrice+" * ( 1 - "+rate.hitbtc+" )"+" - "+bitfinexLAPrice +" * ( 1 +  "+rate.bitfinex+") = " + hitbtcToBitfinexProfit)	
				}
				//this.createOrder(["hitbtc","bitfinex"],[hitbtcHBPrice,bitfinexLAPrice],amount);
			}
			if(bitfinexToHitbtcPrice > 0 && hitbtcToBitfinexPrice <= 0){
				var bitfinexToHitbtcProfit = bitfinexHBPrice * ( 1 - rate.bitfinex ) - hitbtcLAPrice * ( 1 + rate.hitbtc);
				if(bitfinexToHitbtcProfit > 0 ){
					console.log("createOrder - bitfinex To hitbtc");
					var amount = (bitfinexHBAmount - hitbtcLAAmount) >= 0 ? hitbtcLAAmount : bitfinexHBAmount;
					orders.push({exchange:["bitfinex","hitbtc"],price:[bitfinexHBPrice,hitbtcLAPrice],amount:amount,Profit:bitfinexToHitbtcProfit})
				}else{
					console.log("bitfinexToHitbtcProfit = "+bitfinexHBPrice+" * ( 1 - "+rate.bitfinex+" )"+" - "+hitbtcLAPrice +" * ( 1 +  "+rate.hitbtc+") = " + bitfinexToHitbtcProfit)	
				}
				//this.createOrder(["bitfinex","hitbtc"],[bitfinexHBPrice,hitbtcLAPrice],amount);
			}
			if(bitfinexToBinancePrice > 0 && binanceToBitfinexPrice <= 0){
				var bitfinexToBinanceProfit = bitfinexHBPrice * ( 1 - rate.bitfinex ) - binanceLAPrice * ( 1 + rate.binance);
				console.log(bitfinexToBinanceProfit)
				if(bitfinexToBinanceProfit > 0 ){
					console.log("createOrder - bitfinex To binance");
					var amount = (bitfinexHBAmount - binanceLAAmount) >= 0 ? binanceLAAmount : bitfinexHBAmount;
					orders.push({exchange:["bitfinex","binance"],price:[bitfinexHBPrice,binanceLAPrice],amount:amount,Profit:bitfinexToBinanceProfit})
				}else{
					console.log("bitfinexToBinanceProfit = "+bitfinexHBPrice+" * ( 1 - "+rate.bitfinex+" )"+" - "+binanceLAPrice +" * ( 1 +  "+rate.binance+") = " + bitfinexToBinanceProfit)	
				}
				//this.createOrder(["bitfinex","binance"],[bitfinexHBPrice,binanceLAPrice],amount)
			}*/
			this.createOrder(orders);
		}else{
			console.log("获取数据...")
		}
	}

	createOrder(orders){

		if(orders.length == 1){
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
			this.orderSubmit(order);
		}else if(orders.length == 2){
			if(orders[0].Profit >= orders[1].Profit){
				console.log(orders[0])

			}else{
				console.log(orders[1])
			}

		}else if(orders.length == 3){
			if(orders[0].Profit >= orders[1].Profit && orders[0].Profit >= orders[2].Profit){
				console.log(orders[0])
				//this.orderSubmit(orders[0]);
			}else if(orders[1].Profit >= orders[0].Profit && orders[1].Profit >= orders[2].Profit){
				console.log(orders[1])
				//this.orderSubmit(orders[1]);
			}else if(orders[2].Profit >= orders[0].Profit && orders[2].Profit >= orders[1].Profit){
				console.log(orders[2])
				//this.orderSubmit(orders[2]);
			}
		}

	}


	orderSubmit(order){
		var self = this
		var db = self.db;
		var params = self.params;
		if(	self.params.autoExchange === true ){
			if(self.params.pause === false){
				
				console.log(order);
				var exchange = new Exchange(order,params);
				exchange.trade();
			}else{
				console.log(" \x1B[33m 交易已暂停 \x1B[0m \n");
				var time = new Date().getTime() - 60 * 1000;
				self.db.query("SELECT COUNT( * ) FROM exc_order WHERE (status = 0 and submitTime > " + time + " ) ",function(data){
					for(var k in data){var count = data[k]}
					if(count < 3 ){
						self.db.query("UPDATE exc_set SET pause = 1 WHERE id = 1",function(data){});
					}
				})

			}
		}else{
			console.log(" \x1B[33m 交易已关闭 \x1B[0m \n");
		}
		self.db.findOne("exc_set",(data)=>{
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
		})
	}
}


module.exports = main;