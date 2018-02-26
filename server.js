'use strict'
var App = require("./app");
var INIT = require("./init");
var Exception = require("./exception")
INIT.exchanges = [
	{
	"name":"binance",
	"pairs":[
		{"B_C":"btc","I_C":"eos"},
		{"B_C":"btc","I_C":"eth"},
		{"B_C":"eth","I_C":"eos"}
	],
	"status":
	    /*
	     "closed"
	    /*/
	     "open"
	    //*/
	},{
	"name":"hitbtc",
	"pairs":[
		{"B_C":"btc","I_C":"eos"},
		{"B_C":"btc","I_C":"eth"},
		{"B_C":"eth","I_C":"eos"}
	],
	"status":
	    /*
	     "closed"
	    /*/
	     "open"
	    //*/
	},{
	"name":"okex",
	"pairs":[
		{"B_C":"btc","I_C":"eos"},
		{"B_C":"btc","I_C":"eth"},
		{"B_C":"eth","I_C":"eos"}
	],
	"status":
		/*
	     "closed"
	    /*/
	     "open"
	    //*/
	},{
	"name":"huobi",
	"pairs":[
		{"B_C":"btc","I_C":"eos"},
		{"B_C":"btc","I_C":"eth"},
		{"B_C":"eth","I_C":"eos"}
	],
	"status":
		/*
	     "closed"
	    /*/
	     "open"
	    //*/
	},{
	"name":"bitfinex",
	"pairs":[
		{"B_C":"btc","I_C":"eos"},
		{"B_C":"btc","I_C":"eth"},
		{"B_C":"eth","I_C":"eos"}
	],
	"status":
		/*
	     "closed"
	    /*/
	     "open"
	    //*/
	},{
	"name":"bigone",
	"pairs":[
		{"B_C":"btc","I_C":"eos"},
		{"B_C":"btc","I_C":"eth"},
		{"B_C":"eth","I_C":"eos"}
	],
	"status":
		/*
	     "closed"
	    /*/
	     "open"
	    //*/
	}
];;

//console.log(INIT)
var app = new App(INIT);



app.run();
//监听未捕获的异常

process.on('uncaughtException',function(err){
	var exception = new Exception(err,app);
	exception.handleException();
})
