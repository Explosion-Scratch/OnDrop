;(async () => {
	window = self;

	eval(await fetch("https://cdn.jsdelivr.net/gh/juhoen/hybrid-crypto-js@0.2.4/web/hybrid-crypto.min.js").then(res => res.text()))

	onmessage = async function(e) {
		if (e.data.type) return;
		const [ messageType, messageId, data ] = e.data
		let result
		switch (messageType) {
			case 'get key':
				result = await keyPromise
				break
			case 'encrypt':
				result = await encrypt(data)
				break
			case 'decrypt':
				result = await decrypt(data)
				break
		}

		// Return result to the UI thread
		postMessage([ messageId, result ])
	}

	function emit(event, data, cb){
		postMessage({
			type: "emit",
			event,
			data,
		})
		if (!cb) return;
		self.addEventListener("message", handler)
		function handler({data}){
			if (data.type = "emitRes"){
				console.log(`Got data:`, data.data)
				cb(data.data);
				self.removeEventListener("message", handler)
			}
		}
	}

	var crypt = new Crypt({
			aesStandard: "AES-CTR",
			rsaStandard: "RSAES-PKCS1-V1_5"
	})
	var rsa = new RSA();

	var keyPromise = rsa.generateKeyPairAsync().then(async key => {
		emit("public key", {key: key});
		return key;
	})


	async function key(){
		return await keyPromise;
	}

	//Hopefully this can be used in place of the actual file data and nothing much else has to be changed.
	function encrypt({file, to}){
		return new Promise(resolve => {
			var reader = new FileReader();
			reader.onload = async () => {
				//In case I forget server side code for this is as such:
				/*
				socket.on("get public key", ({id}, callback) => {
					if (!keys[id]) callback({error: true, message: "Key not found"});
					callback({error: false, key: keys[id]});
				})
				*/
				const publicKey = await new Promise(async res => {
					emit("get public key", {id: to}, ({error, key, message}) => {
						if (error) {
							console.error(message);
							return
						} else {
							res(key);
						}
					})
				});
				resolve(crypt.encrypt(publicKey, reader.result))
			}
			reader.readAsDataURL(file)
		})
	}


	async function decrypt(fileString){
		const { privateKey } = await keyPromise;
		return crypt.decrypt(privateKey, fileString).message;//Should return the data URL if everything works right.
	}

})();