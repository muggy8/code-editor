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

async function renderFsListing(targetPath){
	var fsList = await makePromise(fs.readdir, targetPath)
	fsList = fsList.filter(function(path){
		return path[0] !== "."
	})
	fsListStats = await Promise.all(fsList.map(function(path){
		var target = targetPath + "/" + path
		return makePromise(fs.lstat, target).then(function(stat){
			stat.target = target
			stat.linkPath = target.replace(processPath, "")
			stat.displayPath = path
			return stat
		})
	}))

	return fsListStats.map(function(stat){
		if (stat.isDirectory()){
			var randomNumber = Math.round(Math.random() * 1000000)
			return `
			<div>
				<a class="fs-directory-item" href="${stat.linkPath}" target="_${randomNumber}" onclick="event.preventDefault(); toggleList(this.href, this.target, this)">${stat.displayPath}</a>
				<div style="padding-left: 1em" id="_${randomNumber}"></div>
			</div>`
		}
		else if (stat.isFile()){
			return `
			<div>
				<a class="fs-file-item" href="${stat.linkPath}" target="_blank">${stat.displayPath}</a>
			</div>`
		}
        else {
            return `
            <div>
                ? ${stat.displayPath}
            </div>`
        }
	}).join("")
}

async function onGet(req, res){
	var parsedUrl = url.parse(req.url)
	if (parsedUrl.query){
		var requestQuery = querystring.parse(parsedUrl.query)
	}

	var content = "",
		editorPage = await makePromise(fs.readFile, __dirname + "/gui.html", "utf8")
	try{
		var stats = await makePromise(fs.stat, processPath + parsedUrl.pathname)
		if (stats.isFile()){
			content = await makePromise(fs.readFile, processPath + parsedUrl.pathname, 'utf8')
			content = escape(content)

			var mimeType = mime.lookup(processPath + parsedUrl.pathname)
			var modeType = mimeType && mimeType.split("/")[1]
			modeType && (editorPage = editorPage.replace("<body>", `<body data-content-type="${modeType}">`))
		}
	}
	catch(o3o){
		// meh whatever
		console.log("request for " + req.url + " failed because ", o3o)
	}


	if (requestQuery && requestQuery.list){
		editorPage = await renderFsListing(processPath + parsedUrl.pathname.replace(/\/$/, ""))
	}
	else {
		editorPage = editorPage.replace(/(<div id\=\"editor\">)(<\/div>)/, function(matched, open, closed){
			return open + content + closed
		})

		editorPage = editorPage.replace("<!--TREE-->", await renderFsListing(processPath))
	}
	res.write(editorPage)
	res.end()
}

async function getAssets(req, res){
	var parsedUrl = url.parse(req.url)
	try{
		var asset = await makePromise(fs.readFile, parsedUrl.pathname.replace(/^\/@\//, __dirname + "/"), "utf8");
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

function getBody(req){
	return new Promise(function(accept){
		var payload = ""
		req.on("data", function(chunk){
			payload += chunk.toString()
		})
		req.on('end', function(){
			accept(payload)
	    });
	})
}

var server = http.createServer(async function(req, res){

	// console.log("new request", req.method, req.url)
	var parsedUrl = url.parse(req.url)

	if (req.method === "GET"){
		if (parsedUrl.pathname && parsedUrl.pathname.substring(0, 3) === "/@/") {
			return getAssets(req, res)
		}
		else {
			return onGet(req, res)
		}
	}
	else if (req.method === "PUT"){
		try{
			// console.log(processPath + parsedUrl.pathname)
			await makePromise(fs.writeFile, processPath + parsedUrl.pathname, await getBody(req))
			res.writeHead(204)
			res.end()
		}
		catch(o3o){
			res.writeHead(400, { 'Content-Type': 'text/plain' })
			res.write("Failed to save file: " + o3o.toString())
			res.end()
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
