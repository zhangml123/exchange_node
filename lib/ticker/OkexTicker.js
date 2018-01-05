'use strict'
var common = require("../../common");
var Main = require("../../main");
var WebSocket = require('ws');
var request = require('request');
class OkexTicker extends common {
	constructor(params){
		super();
		this.params = params;
	}
	getOrderBook(){
		var self = this;
		var a_arr = new Array();
		var b_arr = new Array();
		var frequency = 10;
		var symbol =(this.params.balances.okex.I_C + '_' + this.params.balances.okex.B_C).toLowerCase();
		try{
			var ws = new WebSocket('wss://real.okex.com:10441/websocket');

			ws.on('open', function open() {
				console.log("connected")
				var data = { 
					'event':'addChannel',
					'channel':'ok_sub_spot_' + symbol + '_depth'
			  		}
			  ws.send(JSON.stringify(data));
			});
			ws.on('message', function incoming(data) {

				//console.log(data)
				if(frequency == 10 ){
					frequency = 0;
					request('https://www.okex.com/api/v1/depth.do?symbol=' + symbol, function (error, response, body) {
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
					var a = JSON.parse(data)[0].data.asks;
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
					var b = JSON.parse(data)[0].data.bids;
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
			 			self.params.orders.okexLowestAsk = JSON.stringify(lowestAsk);
			 			self.params.orders.okexHighestBid = JSON.stringify(highestBid);
			 			var main = new Main(self.params); 
						main.refreshData();
					}
				}
			},request);
			ws.on('close', function close() {
				self.getOrderBook();
			  console.log('disconnected');
			});
		}catch(e){
			self.params.orders.okexLowestAsk = null;
			self.params.orders.okexHighestBid = null;
			console.log(e); return false;
		}
	
	}	

}

module.exports = OkexTicker;