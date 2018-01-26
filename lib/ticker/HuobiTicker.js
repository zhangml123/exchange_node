'use strict'
var http = require("http");
var Main = require("../../main");
var pako = require('pako');
class HuobiTicker {
	constructor(params,pairs){
		this.params = params;
		this.pairs = pairs;
	}
	getOrderBook(){
		var self = this;
		var request = require('request');
		var a_arr = new Array();
		var b_arr = new Array();
		var frequency = 10;
		var WebSocket = require('ws');
		var symbol = this.pairs.I_C + this.pairs.B_C;
		var pair = (this.pairs.I_C + this.pairs.B_C).toLowerCase();
		try{
			/*var ws = new WebSocket('wss://api.huobi.pro/ws');
			ws.on('open', function open() {
				console.log("connected")
			  ws.send(JSON.stringify({ 
					'sub':'market.' + symbol + '.depth.step0',
					'id':'id1'
			  		}));
			});
			ws.on('message', function incoming(data) {
				if(frequency == 10 ){
					frequency = 0;*/
					request('https://api.huobi.pro/market/depth?symbol=' + symbol + '&type=step0', function (error, response, body) {
						if (!error && response.statusCode == 200) {
						    try{
						    	 var data1  = JSON.parse(body)
						    }catch(e){
						    	console.log(e)
						    }
						   // console.log(data1.tick)
						    if(data1.tick){
						    	a_arr = data1.tick.asks 
						    	b_arr = data1.tick.bids;
						    	//console.log(a_arr)
						    	//console.log(b_arr)
						    	if(a_arr[0] && b_arr[0]){
									var highestBid = b_arr[0];
						 			var lowestAsk = a_arr[0];

						 			//console.log(highestBid)
						 			//console.log(lowestAsk)
						 			self.params.orders.huobiLowestAsk[pair] = JSON.stringify(lowestAsk);
						 			self.params.orders.huobiHighestBid[pair]  = JSON.stringify(highestBid);
									var main = new Main(self.params); 
									main.refreshData();
								}
						    }else{
						   		self.params.orders.huobiLowestAsk[pair]  = null;
						 		self.params.orders.huobiHighestBid[pair]  = null;
						    }
						}
					})
				//}else{
				//	frequency++;
					/*try {
					  var result = pako.inflate(data, {to:'string'});
					} catch (err) {
					  console.log(err);
					}

					if(!JSON.parse(result).tick){ return;}
					var a = JSON.parse(result).tick.asks;
					if(!a){return;}
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
					var b = JSON.parse(result).tick.bids;
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
					})*/
					/*if(a_arr[0] && b_arr[0]){
						var highestBid = b_arr[0];
			 			var lowestAsk = a_arr[0];

			 			//console.log(highestBid)
			 			//console.log(lowestAsk)
			 			self.params.orders.huobiLowestAsk = JSON.stringify(lowestAsk);
			 			self.params.orders.huobiHighestBid = JSON.stringify(highestBid);
						var main = new Main(self.params); 
						main.refreshData();
					}
				}

			},request);
			ws.on('close', function close() {
				self.getOrderBook();
			  console.log('disconnected');
			});*/
		}catch(e){
			self.params.orders.huobiLowestAsk = null;
			self.params.orders.huobiHighestBid = null;
			console.log(e); return false;
		}
	
	}	

}

module.exports = HuobiTicker;