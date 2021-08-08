// Assuming https://raw.githubusercontent.com/juhoen/hybrid-crypto-js/master/web/hybrid-crypto.min.js is imported
/*
TODOS:
------
• Add public key list to server side
• Encrypt and decrypt in web worker instead of main thread (it doesn't seem to be that memory intensive though)
• Figure out what algorithms are best.
*/
var crypt = new Crypt({
    aesStandard: "AES-CTR",
    rsaStandard: "RSAES-PKCS1-V1_5"
})
var rsa = new RSA();

var keyPromise = rsa.generateKeyPairAsync().then(async (res) => {
	(await socket).emit("public key", {key: res.publicKey});
	return res
});

window.c = {
	key, 
	encrypt,
	decrypt,
	keyPromise,
	rsa,
	crypt,
}


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
				(await socket).emit("get public key", {id: to}, ({error, key, message}) => {
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
