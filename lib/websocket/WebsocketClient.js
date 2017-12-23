'use strict'
var wsClient = require('websocket').client;
class WebsocketClient{
	constructor(url){
		this.url = url;
	}
	connect(data,callback){
		
		var client = new wsClient();
		client.on('connectFailed', function(error) {
			error('Connect Error: ' + error.toString());
		});

		client.on('connect', function(connection) {
		console.log('WebSocket Client Connected');
		
		connection.on('error', function(error) {
		    console.log("Connection Error: " + error.toString());
		});
		connection.on('close', function() {
		    console.log('echo-protocol Connection Closed');
		});

		connection.on('message', function(message) {
		    if (message.type === 'utf8') {
		        callback(message.utf8Data);
		    }
		    console.log(message)
		});
		function sendNumber() {
		    if (connection.connected) {
		        connection.send(data);
		        setTimeout(sendNumber, 1000);
		    }
		}
		sendNumber();
		});

		client.connect(this.url, '');
	}
	

}

module.exports = WebsocketClient;