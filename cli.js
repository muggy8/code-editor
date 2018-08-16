const 
	path = require("path"),
	fs = require("fs"),
	http = require("http"),
	opn = require("opn"),
	port = Math.round(Math.random() * 8000) + 1000

function makePromise(called){
	var callingArgs = []
	var context = this
	for(var i = 1; i < arguments.length; i++){
		callingArgs.push(arguments[i])
	}
	return new Promise(function(accept, reject){
		callingArgs.push(function(err, payload){
			if (err){
				reject(err)
			}
			else {
				accept(payload)
			}
		})
		called.apply(context, callingArgs)
	})
}

var server = http.createServer(function(req, res){
	res.write("hello world")
	
	res.end()
})

server.listen(port)
opn("http://localhost:" + port + "/")
console.log("server is listening on port", port)