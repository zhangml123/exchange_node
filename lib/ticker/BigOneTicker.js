'use strict'
var http = require("http");
var Main = require("../../main");
class BigOneTicker  {
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
		var symbol = this.pairs.I_C + '-' + this.pairs.B_C;
		var pair = (this.pairs.I_C + this.pairs.B_C).toLowerCase();
		try{
			request('https://api.big.one/markets/' + symbol + '/book', function (error, response, body) {
						if (!error && response.statusCode == 200) {
						    try{
						    	 var data1  = JSON.parse(body)
						    }catch(e){
						    	console.log(e)
						    }
						    if(data1){
						    	a_arr = data1.data.asks
						    	b_arr = data1.data.bids;
						    	//console.log(a_arr)
						    	//console.log(b_arr)
						    	if(a_arr[0] && b_arr[0]){
									var lowestAsk = [a_arr[0].price , a_arr[0].amount] ;
									var highestBid = [b_arr[0].price , b_arr[0].amount] ;
						 			self.params.tickers.bigoneLowestAsk[pair]  = JSON.stringify(lowestAsk);
									self.params.tickers.bigoneHighestBid[pair]  = JSON.stringify(highestBid);
									var main = new Main(self.params); 
									main.refreshData();
								}

						    }
						}
					})
		}catch(e){
			self.params.tickers.bigoneLowestAsk[pair]  = null;
				self.params.tickers.bigoneHighestBid[pair]  = null;
			console.log(e); return false;
		}
	
	}	

}

module.exports = BigOneTicker;