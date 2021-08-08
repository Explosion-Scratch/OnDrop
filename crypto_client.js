// Assuming https://raw.githubusercontent.com/juhoen/hybrid-crypto-js/master/web/hybrid-crypto.min.js is imported
/*
TODOS:
------
• Add public key list to server side
• Encrypt and decrypt in web worker instead of main thread (it doesn't seem to be that memory intensive though)
• Figure out what algorithms are best.
*/
window.cryptWorker = new Worker("crypto_worker.js")

window.c = {
	key: () => res("get key"),
	encrypt: (stuff) => res("encrypt", stuff),
	decrypt: (stuff) => res("decrypt", stuff),
}

window.cryptWorker.addEventListener("message", ({data}) => {
	if (data.type = "emit"){
		socket.emit(data.event, data.data, (res) => {
			window.cryptWorker.postMessage(res)
		})
	}
})


function res(messageType, messagePayload) {
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