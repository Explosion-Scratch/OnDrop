
window.cryptWorker = new Worker('crypto.js');
window.key = null;

getWebWorkerResponse("generate-keys").then((_key) => {
	window.key = _key;
	ready();
})

export function encryptFile(file, destination){
	//Because of how this works files can be sent only to one person. We need to get their destination key from the server
	return new Promise(async (resolve, reject) => {
		var chunks = [];
		const CHUNK_SIZE = 300;//300 chars per encryption.
		const reader = new FileReader();
		reader.addEventListener("load", ({result}) => {
			let dataUrl = result;
			let dataUrl_chunks = chunkString(result, CHUNK_SIZE);
			//Encrypt each chunk
			chunks = dataUrl_chunks.map((section) => encrypt(section, destination));
			//Wait for all of it.
			await Promise.all(chunks);
			resolve(chunks);
		});
		/** https://stackoverflow.com/questions/7033639/split-large-string-in-n-size-chunks-in-javascript */
		function chunkString(str, length) {
		  return str.match(new RegExp('.{1,' + length + '}', 'g'));
		}
		reader.readAsDataURL(file);
	});
	
}

export async function decryptFile(chunks){
	//Decrypted should equal the original data url of the file sent, each peice being `CHUNK_SIZE` length containing a section of it.
	var decrypted = await Promise.all(chunks.map(decrypt));
	return decrypted.join("");//Join it back together.
}

export async function encrypt(message, destinationKey){
	return await getWebWorkerResponse("encrypt", [message, destinationKey])
}
export async function decrypt(message){
	return await getWebWorkerResponse("decrypt", [message])
}
export function getWebWorkerResponse (messageType, messagePayload) {
  return new Promise((resolve, reject) => {
    // Generate a random message id to identify the corresponding event callback
    const messageId = Math.floor(Math.random() * 100000)

    // Post the message to the webworker
    window.cryptWorker.postMessage([messageType, messageId].concat(messagePayload))

    // Create a handler for the webworker message event
    const handler = function (e) {
      // Only handle messages with the matching message id
      if (e.data[0] === messageId) {
        // Remove the event listener once the listener has been called.
        e.currentTarget.removeEventListener(e.type, handler)

        // Resolve the promise with the message payload.
        resolve(e.data[1])
      }
    }

    // Assign the handler to the webworker 'message' event.
    window.cryptWorker.addEventListener('message', handler)
  })
}
