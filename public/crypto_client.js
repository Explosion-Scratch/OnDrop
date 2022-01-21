window.cryptWorker = new Worker("crypto_worker.js");

var publicKeyPromiseRes;
var publicKeyPromise = new Promise(
  (resolve) => (publicKeyPromiseRes = resolve)
);

window.c = {
  key: () => publicKeyPromise,
  encrypt: (stuff) => {
    encryptingNotice();
    return res("encrypt", stuff);
  },
  decrypt: (stuff) => res("decrypt", stuff),
};

window.cryptWorker.addEventListener("message", keyHandler);
window.cryptWorker.addEventListener("message", ({ data }) => {
  if (data.type === "localStorage") {
    var result;
    if (data.method === "get") {
      result = localStorage.getItem(data.name);
    }
    if (data.method === "set") {
      localStorage.setItem(data.name, data.data);
      result = data.data;
    }
    window.cryptWorker.postMessage({
      type: "localStorage",
      data: result,
    });
  }
});

/**
 * When the browser receives a message from the worker, it checks the message type. If the message
type is "key generated", it extracts the key from the message and calls the publicKeyPromiseRes
function.
 * @param e - The event object
 * @returns None
 */
function keyHandler(e) {
  const { type, key } = e.data;
  if (type === "key generated") {
    console.log("Got key generated message", key);
    publicKeyPromiseRes(key);
    window.cryptWorker.removeEventListener("message", keyHandler);
    //Show notice but no notification
    done(false);
  }
}

window.cryptWorker.addEventListener("message", ({ data }) => {
  if ((data.type = "emit")) {
    socket.emit(data.event, data.data, (res) => {
      window.cryptWorker.postMessage({ type: "emitRes", data: res });
    });
  }
});

/**
 * Take a message type and a message payload, and returns a promise that resolves to the message
payload.
 * @param messageType - The type of message to send to the webworker.
 * @param messagePayload - An array of the parameters to be passed to the webworker.
 * @returns A promise that resolves with the message payload.
 */
function res(messageType, messagePayload) {
  return new Promise((resolve, reject) => {
    // Generate a random message id to identify the corresponding event callback
    const messageId = Math.floor(Math.random() * 100000);

    // Post the message to the webworker
    window.cryptWorker.postMessage(
      [messageType, messageId].concat(messagePayload)
    );

    // Create a handler for the webworker message event
    const handler = function (e) {
      // Only handle messages with the matching message id
      if (e.data[0] === messageId) {
        // Remove the event listener once the listener has been called.
        e.currentTarget.removeEventListener(e.type, handler);

        // Resolve the promise with the message payload.
        resolve(e.data[1]);
      }
    };

    // Assign the handler to the webworker 'message' event.
    window.cryptWorker.addEventListener("message", handler);
  });
}
