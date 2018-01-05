'use strict'
class db_function{
	constructor(connection,connectionErrorException){
		this.connection = connection;
		this.connectionErrorException = connectionErrorException;
	}
	findOne(table,cb){
		if(table){
			var self= this
			self.connection.query('SELECT * FROM ' + table + ' ORDER BY id desc LIMIT 1', function (error, results, fields) {
				if(error){
					console.log("mysql error")
					self.connectionErrorException(error,self);
					cb(null);
				}else{
					var order = results[0];
					cb(order);
				}
			}); 
		}
	}
	findAall(){

	}

	update(){

	}
	delete(){

	}
	insert(table,data,cb){
		if(table && data){
			var self= this
			var k1 = "";
			var v1 = "";
			for( var k in data ){
				k1 += k+","
				v1 += "\'"+data[k]+"\'"+","
			}
			self.connection.query('INSERT INTO ' + table + ' (' + k1.substr(0,k1.length-1) + ') VALUES (' + v1.substr(0,v1.length-1) + ') ',function(error,results,fields){
				if(error){
					console.log("mysql error")
					throw error;
				}else{
					if(cb){
						console.log(results.insertId);
						cb(results.insertId);
					}
				}
			});
		}
	}

	query(sql,cb){
		var self= this
		self.connection.query(sql,function(error,results,fields){
			if (error){
				console.log("mysql error")
				self.connectionErrorException(error,self);
				cb(null);
			}else{
				var data = results[0];
				cb(data);
			} 
		});
	}
}

module.exports = db_function;
