'use strict'
var common = require("../../common")
var http = require("http");
var Main = require("../../main");

class HitbtcTicker extends common{
	constructor(params){
		super();
		this.params = params;
	}
	getOrderBook(){
		var self = this;
		var url = "https://api.hitbtc.com/api/1/public/BTCUSD/orderbook?format_price=number&format_amount=number";
		var options = {  
		    hostname: 'api.hitbtc.com',  
		    port: '',  
		    path: '/api/1/public/BTCUSD/orderbook?format_price=number&format_amount=number',  
		    method: 'GET'  
		}; 
		
		var req = http.request(options,(res)=>{
			res.on('data', function (chunk) {
				try{
					var chunk = JSON.parse(chunk.toString())
				}catch(e){
					//console.log(e)
				} 
		        if(chunk.asks && chunk.bids){
					var lowestAsk = chunk.asks[0];
					var highestBid = chunk.bids[0];
					self.params.localStorage.setItem('hitbtcLowestAsk', JSON.stringify(lowestAsk));
					self.params.localStorage.setItem('hitbtcHighestBid', JSON.stringify(highestBid));
					var main = new Main(self.params); 
					main.refreshData();

				}
		    })
		});
		req.end();

	}	

}

module.exports = HitbtcTicker;