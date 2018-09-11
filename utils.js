function ajax(url, data, callback) {

	if(typeof data === 'object') {
	}
	else {
		callback = data;
		data = null;
	}

	var newXHR = new XMLHttpRequest();
	newXHR.addEventListener( 'load', function() {
		var response = JSON.parse(this.response);
		// console.log(response);
		if(callback) {
			callback(null, response);
		}
	});
  
  	var method;
  	if(data) {
  		method = 'POST';
  		data = JSON.stringify(data);
  	}
  	else {
  		method = 'GET';
  	}
	newXHR.open(method, url);
	newXHR.send(data);	
}

function sleep(ms, callback) {
	setTimeout(callback, ms);
}