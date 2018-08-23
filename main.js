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
