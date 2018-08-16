const 
	path = require("path"),
	fs = require("fs"),
	http = require("http")

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