#!/usr/bin/env node

const
	path = require("path"),
	fs = require("fs"),
	http = require("http"),
	opn = require("opn"),
	port = Math.round(Math.random() * 8000) + 1000,
	url = require('url'),
	querystring = require('querystring'),
	editorFile = fs.readFileSync("./gui.html", "utf8").replace(/<script[^>]+src=\"([^\"]+)\"[^>]*>/g, function(matched, src){
		return "<script>" + fs.readFileSync(src, "utf8")
	}),
	processPath = process.cwd()

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

async function onGet(req, res){
	var parsedUrl = url.parse(req.url)
	if (parsedUrl.query){
		var requestQuery = querystring.parse(parsedUrl.query)
	}

	var editorPage, content
	try{
		var stats = await makePromise(fs.stat, processPath + parsedUrl.pathname)
		if (stats.isFile()){
			content = await makePromise(fs.readFile, processPath + parsedUrl.pathname, 'utf8')
		}
		else {
			content = ""
		}
	}
	catch(o3o){
		content = ""
	}


	if (requestQuery && requestQuery.list){
		editorPage = editorFile
	}
	else {
		editorPage = editorFile.replace(/(<div id\=\"editor\">)(<\/div>)/, function(matched, open, closed){
			return open + content + closed
		})
	}
	res.write(editorPage)

	res.end()
}

var server = http.createServer(function(req, res){
	if (req.method === "GET"){
		return onGet(req, res)
	}
})

server.listen(port)
opn("http://localhost:" + port + "/").then(function(){
	console.log("server is listening on port", port)
}, function(){
	console.log("failed to open default browser. Script terminated")
	server.close()
})
