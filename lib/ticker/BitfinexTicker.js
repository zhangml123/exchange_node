'use strict'
var Main = require("../../main");
var request = require('request');
var WebSocket = require('ws');
class BitfinexTicker {
	constructor(params,pairs){
		this.params = params;
		this.pairs = pairs;
	}
	getOrderBook(){
		var self = this;
		var a_arr = new Array();
		var b_arr = new Array();
		var frequency = 100;
		var symbol = "t" + this.pairs.I_C + this.pairs.B_C;
		var pair = (this.pairs.I_C + this.pairs.B_C).toLowerCase();
		try{
			var ws = new WebSocket('wss://api.bitfinex.com/ws/2');
			ws.on('open', function open() {
			  ws.send(JSON.stringify({ 
					event: 'subscribe',
					channel: 'book',
					symbol: symbol,
					prec: "P0",
					freq: "F0",
					len: "25" 
			  	}));
			});
			ws.on('message', function incoming(data) {
				if(frequency == 100 ){
					frequency = 0;
					request('https://api.bitfinex.com/v2/book/' + symbol + '/P0?len=25', function (error, response, body) {
						if (!error && response.statusCode == 200) {
						    try{
						    	 var data1  = JSON.parse(body)
						    }catch(e){
						    	console.log(e)
						    }
						    if(data1){
						    	var a_arr1 = [];
						    	var b_arr1 = [];
						    	data1.map((v,k)=>{
						    		if(v[2] < 0){
						    			a_arr1.push([v[0],v[2]])
						    		}
						    		if(v[2] > 0){
						    			b_arr1.push([v[0],v[2]])
						    		}
						    	})
						    	a_arr = a_arr1;
						    	b_arr = b_arr1;
						    }
						}
					})
				}else{
					frequency++;
					var ticker = JSON.parse(data)[1];
					if(ticker){
						var price = ticker[0];
						var count = ticker[1];
						var amount = ticker[2]
						if(typeof price == "number"){
							if(amount > 0 ){
								b_arr.map((vb,kb)=>{
									if(vb[0] == price){
										b_arr.splice(kb,1)
									}
								})
								if(count > 0){
									b_arr.push([price,amount])
								}
							}
							if(amount < 0 ){
								a_arr.map((va,ka)=>{
									if(va[0] == price){
										a_arr.splice(ka,1)
									}
								})
								if(count > 0){
									a_arr.push([price,amount])
								}
							}
							a_arr.sort((a,b)=>{
								return a[0]-b[0];
							})
							b_arr.sort((a,b)=>{
								return b[0]-a[0];
							})
							if(a_arr[0] && b_arr[0]){
								var highestBid = b_arr[0];
					 			var lowestAsk = a_arr[0];
					 			self.params.tickers.bitfinexLowestAsk[pair]  = JSON.stringify(lowestAsk);
								self.params.tickers.bitfinexHighestBid[pair]  = JSON.stringify(highestBid);
								var main = new Main(self.params); 
								main.refreshData();
							}
						}
					}
				}
			});
			ws.on('close', function close() {
				self.getOrderBook();
				self.params.tickers.bitfinexLowestAsk[pair]  = null;
				self.params.tickers.bitfinexHighestBid[pair]  = null;
			  	console.log('disconnected');
			  	setTimeout(function(){
					self.getOrderBook();
			 	},60000);
			});
			ws.on("error",function error(){
				self.params.tickers.bitfinexLowestAsk[pair]  = null;
				self.params.tickers.bitfinexHighestBid[pair]  = null;
			})
		}catch(e){
			self.params.tickers.bitfinexLowestAsk[pair]  =  null;
			self.params.tickers.bitfinexHighestBid[pair]  =  null;
			console.log(e); return false;
		}
	
	}	

}

module.exports = BitfinexTicker;