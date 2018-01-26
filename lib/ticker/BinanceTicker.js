'use strict'
var Main = require("../../main");
var request = require('request');
var WebSocket = require('ws');
class BinanceTicker {
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
			var ws = new WebSocket('wss://stream.binance.com:9443/ws/' + symbol.toLowerCase() + '@depth');
			ws.on('open', function open() {
			  ws.send("");
			});
			ws.on('message', function incoming(data) {
				if(frequency == 10 ){
					frequency = 0;
					request('https://api.binance.com/api/v1/depth?symbol=' + symbol + '&limit=10', function (error, response, body) {
						if (!error && response.statusCode == 200) {
						    try{
						    	 var data1  = JSON.parse(body)
						    }catch(e){
						    	console.log(e)
						    }
						    if(data1){
						    	a_arr = data1.asks 
						    	b_arr = data1.bids;
						    }
						}
					})
				}else{
					frequency++;
					//console.log(frequency)
					var a = JSON.parse(data).a;
					//console.log(a)
					//console.log("\n")
					a.map((v,k)=>{
						a_arr.map((va,ka)=>{
							if(va[0] == v[0] ){
								a_arr.splice(ka,1)
							}
						})
						if(v[1] != 0){
							a_arr.push(v);
						}
					})
					a_arr.sort((a,b)=>{
						return a[0]-b[0];
					})
					//console.log(JSON.stringify(a_arr));
					//console.log("\n")
					var b = JSON.parse(data).b;
					b.map((v,k)=>{
						
						b_arr.map((vb,kb)=>{
							if(vb[0] == v[0] ){
								b_arr.splice(kb,1)
							}
						})
						if(v[1] != 0){
							b_arr.push(v);
						}
					})
					b_arr.sort((a,b)=>{
						return b[0]-a[0];
					})

					if(a_arr[0] && b_arr[0]){
						var highestBid = b_arr[0];
			 			var lowestAsk = a_arr[0];
			 			
			 			self.params.orders.binanceLowestAsk[pair]  = JSON.stringify(lowestAsk);
						self.params.orders.binanceHighestBid[pair]  = JSON.stringify(highestBid);
						var main = new Main(self.params); 
						main.refreshData();
					}
				}
			});
			ws.on('close', function close() {
				self.getOrderBook();
				self.params.orders.binanceLowestAsk[pair]  = null;
				self.params.orders.binanceHighestBid[pair]  = null;
			  	console.log('disconnected');
			  	setTimeout(function(){
					self.getOrderBook();
			 	},60000);
			});
		}catch(e){
			self.params.orders.binanceLowestAsk[pair]  =  null;
			self.params.orders.binanceHighestBid[pair]  =  null;
			console.log(e); return false;
		}
	
	}	

}

module.exports = BinanceTicker;