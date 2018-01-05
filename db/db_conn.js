'use strict'
var mysql = require('mysql');

class db_conn{
	constructor(){
		this.connection;
	}
	db_connect(){
		var self = this;
		self.option = {
		  host     : 'localhost',
		  user     : '',
		  password : '',
		  database : ''
		}
		self.connection = mysql.createConnection(self.option);
		self.connection.connect(function(e){
			console.log("connecting mysql")
		});
		self.connection.on("error",function(e){
			console.log("db error ",e);
			if (e.code === 'PROTOCOL_CONNECTION_LOST') {
				var connection = mysql.createConnection(self.option);
				connection.connect()
				self.connection = connection
	        } else {
	            throw e;
	        }
		})
		var DB = require("./db_function");
		var error = this.connectionErrorException;
		var db = new DB(self.connection,error);
		return db;
	}
	connectionErrorException(e,db_func){
		console.log("reconnecting to mysql server")
	}
}

module.exports = db_conn;