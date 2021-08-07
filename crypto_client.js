
window.cryptWorker = new Worker('crypto.js');
window.key = null;

getWebWorkerResponse("generate-keys").then((_key) => {
	window.key = _key;
	ready();
})

export async function encryptFile(file){
  
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
