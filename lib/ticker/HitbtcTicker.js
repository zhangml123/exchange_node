'use strict'
var Main = require("../../main");
var WebSocket = require('ws');
var request = require('request');
class HitbtcTicker {
	constructor(params,pairs){
		this.params = params;
		this.pairs = pairs;
	}
	getOrderBook(){
		var self = this;
		var a_arr = new Array();
		var b_arr = new Array();
		var frequency = 10;
		var symbol = this.pairs.I_C + this.pairs.B_C;
		var pair = (this.pairs.I_C + this.pairs.B_C).toLowerCase();
		try{
			/*var ws = new WebSocket('wss://api.hitbtc.com/api/2/ws');
			ws.on('open', function open() {
			  ws.send(JSON.stringify({
				"method": "subscribeOrderbook",
				"params": {
				"symbol": symbol
				},
				"id": 10
			  }));
			});
			ws.on('message', function incoming(data) {

				if(frequency == 10){
					frequency =0;*/
					request('https://api.hitbtc.com/api/2/public/orderbook/' + symbol + '?limit=10', function (error, response, body) {
						if (!error && response.statusCode == 200) {
						    try{
						    	 var data1  = JSON.parse(body)
						    }catch(e){
						    	console.log(e)
						    }
						    if(data1){
						    	a_arr = data1.ask
						    	b_arr = data1.bid;
						    }

							if(a_arr.length != 0 && b_arr.length != 0){
								var lowestAsk = [a_arr[0].price,a_arr[0].size] ;
								var highestBid = [b_arr[0].price,b_arr[0].size] ;
								self.params.tickers.hitbtcLowestAsk[pair]  = JSON.stringify(lowestAsk);
								self.params.tickers.hitbtcHighestBid[pair]  = JSON.stringify(highestBid);
								var main = new Main(self.params); 
								main.refreshData();
							}
						 
						}
					})
				/*}else{
					frequency++
					var data = JSON.parse(data)
					if(data.params){
						//console.log(data.params)
						var a = data.params.ask
						a.map((v,k)=>{
							a_arr.map((va,ka)=>{
								if(va.price == v.price ){
									a_arr.splice(ka,1)
								}
							})
							if(v.size != 0){
								a_arr.push(v);
							}
						})
						a_arr.sort((a,b)=>{
							return a.price-b.price;
						})

						var b = data.params.bid
						b.map((v,k)=>{
							b_arr.map((vb,kb)=>{
								if(vb.price == v.price ){
									b_arr.splice(kb,1)
								}
							})
							if(v.size != 0){
								b_arr.push(v);
							}
						})
						b_arr.sort((a,b)=>{
							return b.price - a.price;
						})


						if(a_arr.length != 0 && b_arr.length != 0){
							var lowestAsk = [a_arr[0].price,a_arr[0].size] ;
							var highestBid = [b_arr[0].price,b_arr[0].size] ;

							console.log("lowestAsk = "+lowestAsk)
							console.log("highestBid = "+lowestAsk)
							self.params.orders.hitbtcLowestAsk[pair]  = JSON.stringify(lowestAsk);
							self.params.orders.hitbtcHighestBid[pair]  = JSON.stringify(highestBid);
							var main = new Main(self.params); 
							main.refreshData();
						}
					}
				}

			})
			ws.on('close', function close() {
				self.getOrderBook();
				self.params.orders.hitbtcLowestAsk[pair]  = null;
				self.params.orders.hitbtcHighestBid[pair]  = null;
			 	console.log('disconnected');
			});*/
		}catch(e){
			self.params.tickers.hitbtcLowestAsk[pair]  = null;
			self.params.tickers.hitbtcHighestBid[pair]  = null;
			console.log(e); return false;
		}
	}	

}

module.exports = HitbtcTicker;