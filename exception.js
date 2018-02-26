'use strict'

class Exception {
	constructor(error,app){
		this.db = app.params.db;
		this.error = error;
		this.params = app.params;
	}
	handleException(){
		//if(this.error.level){
		if(false){
			try{
				var error = this.error;
				console.log(error)
				if(	(error.level == "warning" && error.type == "getbalance")){
					console.log(error);
					console.log("\x1B[1;37;41m Error : save balance error, getting balance...\x1B[0m \n");
					var Exchange = require("./exchange");
					var exchange = new Exchange('',this.params);
					exchange.db_balance(new Date().getTime(),true);
				}else if(error.level == "warning" && error.type == "queryOrder"){
					console.log("\x1B[1;37;41m Error : query order error.\x1B[0m \n");
					console.log(error);
				}else if(error.level == "error" && error.type == "submitOrderError"){
					if(error.msg.msg == '{"code":-1021,"msg":"Timestamp for this request is outside of the recvWindow.","result":false,"error":true}'){
						console.log(this.error)
						console.log("\x1B[1;37;41m Error : submitOrderError \x1B[0m \n")
						var Exchange = require("./exchange");
						var exchange = new Exchange('',this.params);
						exchange.db_balance(new Date().getTime(),true);
					}else{
						this.saveSystemError();
					}
				}else{
					this.saveSystemError();
				}
			}catch(err){
				var self = this;
				self.error = err;
				setTimeout(function(){
					self.handleException();
				},10000)
			}

		}else{
			this.saveSystemError();
		}
	}
	saveSystemError(){
		var self = this;
		var msg = (typeof this.error) == "string" ? this.error : JSON.stringify(this.error)
		var data = {
			timestamp : new Date().getTime(),
			msg : msg
		}
		console.log(data)
		this.db.insert("exc_system_error",data,function(rs){
			if(self.error.exchange){
				self.params.exchanges.map((v,k)=>{
					if(v.name == self.error.exchange){
						self.params.exchanges[k].status = "closed";
					}
					console.log(self.params);
					//process.exit();
					self.db.query("UPDATE exc_exchange_status SET `status` = \"closed\" WHERE `name` = \""+ self.error.exchange +"\"" ,function(){})
				})
			}else{
				console.log(self.error.exchange)
				self.db.query("UPDATE exc_set SET service = 0 WHERE `id` = 1",function(data){
					process.exit();
				})
			}
			
		});

	}
}

module.exports = Exception;