'use strict'
var common = require("../../common")
var http = require("http");
var Main = require("../../main");
class BinanceTicker extends common {
	constructor(params){
		super();
		this.params = params;
	}
	getOrderBook(){
		var self = this;
		var request = require('request');
		var a_arr = new Array();
		var b_arr = new Array();
		var frequency = 10;
		var WebSocket = require('ws');
		try{
			var ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth');

			ws.on('open', function open() {
			  ws.send("");
			});
			ws.on('message', function incoming(data) {
				if(frequency == 10 ){
					frequency = 0;
					request('https://www.binance.com/api/v1/depth?symbol=BTCUSDT&limit=10', function (error, response, body) {
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
			 			self.params.localStorage.setItem('binanceLowestAsk', JSON.stringify(lowestAsk));
						self.params.localStorage.setItem('binacneHighestBid', JSON.stringify(highestBid));
						var main = new Main(self.params); 
						main.refreshData();
					}
				}
			},request);
		}catch(e){
			self.params.localStorage.setItem('binanceLowestAsk', null);
			self.params.localStorage.setItem('binacneHighestBid', null);
			console.log(e); return false;
		}
	
	}	

}

module.exports = BinanceTicker;