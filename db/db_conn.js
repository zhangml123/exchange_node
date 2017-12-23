'use strict'
var mysql = require('mysql');

class db_conn{
	constructor(localstorage){
		this.localstorage = localstorage
		this.connection;
	}
	db_connect(){
		var self = this;
		 self.connection = mysql.createConnection({
		  host     : 'localhost',
		  user     : '',
		  password : '',
		  database : ''
		});
		self.connection.connect(function(e){
			console.log("connecting error")

		});
		self.connection.on("error",function(e){
			console.log("db error ",e);
			if (e.code === 'PROTOCOL_CONNECTION_LOST') {
				var connection = mysql.createConnection({
				  host     : 'localhost',
				  user     : '',
				  password : '',
				  database : ''
				});
				connection.connect()
				console.log("adsfasdfasd")
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
		console.log(e);
		console.log("reconnecting to mysql server")
		/*var connection = mysql.createConnection({
		  host     : 'localhost',
		  user     : '',
		  password : '',
		  database : ''
		});
		connection.connect()
		db_func.connection = connection ;*/
	}


	db_conn1(){

	}
}

module.exports = db_conn;