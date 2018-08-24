function toggleList(getPath, targetId, self){
	var reciever = document.getElementById(targetId)
	if (self.className.indexOf("active") > -1) {
		self.className = self.className.replace(" active", "")
	}
	else{
		var xhr = new XMLHttpRequest()
		xhr.open("GET", getPath + "?list=1")
		xhr.addEventListener("load", function(){
			reciever.innerHTML = xhr.responseText
			self.className += " active"
		})
		xhr.send()
	}
}

void function(){
    var editor = ace.edit("editor")
    var titleEle = document.head.appendChild(document.createElement("title"))
    titleEle.innerHTML = document.location.pathname.replace(/\/?[^\/]+\//g, "")

    document.addEventListener("keydown", function(event) {
    	if (event.keyCode == 83 && (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)) {
    		event.preventDefault()

    		var xhr = new XMLHttpRequest()
    		xhr.open("PUT", document.location.href)
    		xhr.addEventListener("error", function(){
    			alert(xhr.responseText)
    		})
    		xhr.addEventListener("load", function(){
    			if (xhr.status < 400 && xhr.status >= 200){
                    if (titleEle.innerHTML[0] === '*') {
                        titleEle.innerHTML = titleEle.innerHTML.replace("*", "")
                    }
                }
    		})
    		xhr.send(editor.getValue())
    	}
    })

    document.addEventListener("keydown", function(event) {
        if (titleEle.innerHTML[0] !== '*') {
            titleEle.innerHTML = "*" + titleEle.innerHTML
        }
    })
}()
