function toggleList(getPath, targetId, self){
	var reciever = document.getElementById(targetId)
	console.log(self.className)
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

var editor = ace.edit("editor")
document.addEventListener("keydown", function(event) {
	if (event.keyCode == 83 && (navigator.platform.match("Mac") ? event.metaKey : event.ctrlKey)) {
		event.preventDefault()

		var xhr = new XMLHttpRequest()
		xhr.open("PUT", document.location.href)
		xhr.addEventListener("error", function(){
			alert(xhr.responseText)
		})
		xhr.send(editor.getValue())
	}
});
