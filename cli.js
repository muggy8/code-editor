#!/usr/bin/env node

const
	path = require("path"),
	fs = require("fs"),
	http = require("http"),
	opn = require("opn"),
	port = Math.round(Math.random() * 8000) + 1000,
	url = require('url'),
	querystring = require('querystring'),
	escape = require('escape-html'),
	mime = require('mime-types'),
	typeFilePlaceholder = "/* type-file script to be inserted here */"
	editorFile = fs.readFileSync("./gui.html", "utf8").replace(/<script[^>]+src=\"([^\"]+)\"[^>]*>/g, function(matched, src){
		return "<script>" + fs.readFileSync(src, "utf8") + "\n" + typeFilePlaceholder
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

	var editorPage = editorFile,
		content = ""
	try{
		var stats = await makePromise(fs.stat, processPath + parsedUrl.pathname)
		if (stats.isFile()){
			content = await makePromise(fs.readFile, processPath + parsedUrl.pathname, 'utf8')
			content = escape(content)

			var mimeType = mime.lookup(processPath + parsedUrl.pathname)
			var modeType = mimeType && mimeType.split("/")[1]
			// var modeTypeScript = await makePromise(fs.readFile, "./node_modules/ace-builds/src-min-noconflict/mode-" + modeType + ".js", "utf8")
			// modeTypeScript && (editorPage = editorPage.replace(typeFilePlaceholder, function(){
			// 	return modeTypeScript + "\nvar modeType = '" + modeType + "';"
			// }))
			modeType && (editorPage = editorPage.replace(typeFilePlaceholder, "var modeType = '" + modeType + "';\n"))
		}
	}
	catch(o3o){
		// meh whatever
		console.log("request for " + req.url + " failed because ", o3o)
	}


	if (requestQuery && requestQuery.list){
		// editorPage = editorFile
	}
	else {
		editorPage = editorPage.replace(/(<div id\=\"editor\">)(<\/div>)/, function(matched, open, closed){
			return open + content + closed
		})

	}
	res.write(editorPage)
	res.end()
}

async function getNodeModule(req, res){
	var parsedUrl = url.parse(req.url)
	try{
		var asset = await makePromise(fs.readFile, parsedUrl.pathname.replace(/^\/@\//, "./node_modules/"), "utf8");
	}
	catch (o3o){
		res.writeHead(404, { 'Content-Type': 'text/plain' })
		res.write("404 not found")
		res.end()
		// console.log("cannot find ./node_modules" + parsedUrl.pathname)
		return
	}

	res.writeHead(200, { 'Content-Type': mime.lookup(parsedUrl.pathname) })
	res.write(asset)
	res.end()
}

var server = http.createServer(function(req, res){

	console.log("new request", req.url)

	if (req.method === "GET"){
		var parsedUrl = url.parse(req.url)
		if (parsedUrl.pathname && parsedUrl.pathname.substring(0, 3) === "/@/") {
			return getNodeModule(req, res)
		}
		else {
			return onGet(req, res)
		}
	}
})

server.listen(port)
opn("http://localhost:" + port + "/").then(function(){
	console.log("server is listening on port", port)
}, function(){
	console.log("failed to open default browser. Script terminated")
	server.close()
})
