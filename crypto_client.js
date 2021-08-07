// Assuming https://raw.githubusercontent.com/juhoen/hybrid-crypto-js/master/web/hybrid-crypto.min.js is imported
var crypt = new Crypt({
    aesStandard: "AES-CTR",
    rsaStandard: "RSAES-PKCS1-V1_5"
})

var keyPromise = rsa.generateKeyPairAsync();

export async function key(){
	return await keyPromise;
}

export function encrypt({file, to}){
	return new Promise(resolve => {
		var reader = new FileReader();
		reader.onload = () => {
			//In case I forget server side code for this is as such:
			/*
			socket.on("get public key", ({id}, callback) => {
				if (!keys[id]) callback({error: true, message: "Key not found"});
				callback({error: false, key: keys[id]});
			})
			*/
			const publicKey = await new Promise(res => {
				socket.emit("get public key", {id: to}, ({error, key, message}) => {
					if (error) {
						console.error(message);
						return
					} else {
						res(key);
					}
				})
			});
			crypt.encrypt(publicKey, reader.result);
		}
		reader.readAsDataURL(file)
	})
}
