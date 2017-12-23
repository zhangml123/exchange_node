'use strict'
var common = require("../../common")
var wsClient = require("../websocket/WebsocketClient");
var http = require("http");
var Main = require("../../main");
class BitFinexTicker extends common{
	constructor(localStorage){
		super()
	 	this.highestBid = 0;
	 	this.lowestAsk = 0;
	 	this.localStorage = localStorage;
	}
	getOrderBook(){
		var localStorage = this.localStorage
		var request = require('request');
		var url = "wss://api.bitfinex.com/ws/2"
		//var ws = new wsClient(url);
		var a_arr = [];
		var b_arr = [];
		var frequency = 80;
		var data = {
			"event":"subscribe",
			"channel": "book",
			"pair" :"BTCUSD",
			"freq": "F0",
			"prec":"P0"
		};
		var WebSocket = require('ws');
		var ws = new WebSocket('wss://api.bitfinex.com/ws/2');
		ws.on('open', function open() {
		  ws.send(JSON.stringify(data));
		});
		ws.on('message', function incoming(data) {
			if(frequency == 80 ){
				frequency = 0;
				request('https://api.bitfinex.com/v1/book/btcusd?limit_bids=10&limit_asks=10&group=1', function (error, response, body) {
					if (!error && response.statusCode == 200) {
					    try{
					    	 var data1  = JSON.parse(body)
					    }catch(e){
					    	console.log(e)
					    }
					    if(data1){
					    	var d_asks = data1.asks;
					    	var d_bids = data1.bids;
					    	a_arr = [];
					    	b_arr = [];
					    	d_asks.map((va,ka)=>{
					    		var obj = {};
					    		obj.ask = va["price"];
					    		obj.amount = va["amount"];
					    		a_arr.push(obj) 
					    	})
					    	d_bids.map((vb,kb)=>{
					    		var obj = {};
					    		obj.bid = vb["price"];
					    		obj.amount = vb["amount"];
					    		b_arr.push(obj) 
					    	})
					    }
					}
				})
			}else{
				frequency++;
				try{
					var data =JSON.parse(data) 
				}catch(e){
					console.log(e)
				}
				//console.log(data)
				if(data[0] && typeof(data[1][0]) === "number"){
					if(data[1][2] < 0){
						if(data[1][1] > 0){
							var obj = {};
							obj.ask = data[1][0];
							obj.amount =Math.abs(data[1][2]);
							a_arr.push(obj)
							a_arr.map((v,k)=>{
								if(v["ask"] == data[1][0] && v["amount"] != Math.abs(data[1][2])){
									a_arr.splice(k,1)
								}
							})
						}
						if(data[1][1] == 0){
							a_arr.map((v,k)=>{
								if(v["ask"] == data[1][0]){
									a_arr.splice(k,1)
								}
							})
						}
						a_arr.sort((a,b)=>{
							return a["ask"]-b["ask"];
						})
					}else if(data[1][2] > 0){
						if(data[1][1] > 0){
							var obj = {};
							obj.bid = data[1][0];
							obj.amount =Math.abs(data[1][2]);
							b_arr.push(obj)
							b_arr.map((v,k)=>{
								if(v["bid"] == data[1][0] && v["amount"] != Math.abs(data[1][2])){
									b_arr.splice(k,1)
								}
							})
							
						}
						if(data[1][1] == 0){
							b_arr.map((v,k)=>{
								if(v["bid"] == data[1][0]){
									b_arr.splice(k,1)
								}
							})
						}
						b_arr.sort((a,b)=>{
							return b["bid"]-a["bid"];
						})
					}
				}
				if(b_arr[0] && a_arr[0]){
					this.highestBid = b_arr[0];
		 			this.lowestAsk = a_arr[0];

		 			localStorage.setItem('bitfinexLowestAsk', JSON.stringify(this.lowestAsk));
					localStorage.setItem('bitfinexHighestBid', JSON.stringify(this.highestBid));

					//var main = new Main(); 
					//main.refreshData(localStorage);
				}
			}
		},localStorage,request);
	}
}

module.exports = BitFinexTicker;