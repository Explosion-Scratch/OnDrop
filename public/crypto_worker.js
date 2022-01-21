(async () => {
  window = self;

/* The above code is fetching the crypto_lib.js file from the web, and then running it. */
  eval(await fetch("crypto_lib.js").then((res) => res.text()));

  onmessage = async function (e) {
    if (e.data.type) return;
    const [messageType, messageId, data] = e.data;
    let result;
    switch (messageType) {
      case "get key":
        result = await key().then((a) => {
          console.log("Finished key promise");
          return a;
        });
        break;
      case "encrypt":
        result = await encrypt(data);
        break;
      case "decrypt":
        result = await decrypt(data);
        break;
    }

    // Return result to the main thread
    postMessage([messageId, result]);
  };
  /**
   * Cannot generate summary
   * @param method - The method to call on the localStorage object– We're in a web worker so we can't directly access it.
   * @param name - The name of the key to use.
   * @param data - {
   * @returns A promise that resolves to the data that was stored.
   */
  function localStorage(method, name, data) {
    return new Promise((resolve) => {
      self.addEventListener("message", ({ data }) => {
        if (data.type === "localStorage") {
          resolve(data.data);
        }
      });
      postMessage({ type: "localStorage", method, name, data });
    });
  }
  /**
   * Takes an event name and some data, and sends a message to the parent window. It also takes a
  callback function, and calls it with the data from the parent window.
   * @param event - The name of the event to emit.
   * @param data - The data to be sent to the worker.
   * @param cb - a callback function that will be called when the event is emitted.
   * @returns The data that was emitted.
   */
  function emit(event, data, cb) {
    postMessage({
      type: "emit",
      event,
      data,
    });
    if (!cb) return;
    self.addEventListener("message", handler);
    function handler({ data }) {
      if ((data.type = "emitRes")) {
        console.log(`Got data:`, data.data);
        cb(data.data);
        self.removeEventListener("message", handler);
      }
    }
  }

  var crypt = new Crypt({
    aesStandard: "AES-CTR",
    rsaStandard: "RSAES-PKCS1-V1_5",
  });
  var rsa = new RSA();

/* We generate a key pair, and store it in localStorage. */
  var keyPromise = new Promise(async (resolve) => {
    var pair = await localStorage("get", "keyPair");
    if (pair) {
      console.log("Key pair gotten from localStorage.", pair);
      resolve(JSON.parse(pair));
    }
    if (!pair) console.log("Generating pair");
    var pair = await rsa.generateKeyPairAsync();
    await localStorage("set", "keyPair", JSON.stringify(pair));
    console.log(pair);
    resolve(pair);
  });

  /* 1. Generate a key pair using the `crypto.generateKeyPair()` function.
  2. Wait for the key to be generated.
  3. Send the public key to the main thread. */
  keyPromise.then(async (key) => {
    console.log("Public key generated");
    emit("public key", { key: key.publicKey });
    postMessage({ type: "key generated", key: key.publicKey });
    return key;
  });

  async function key() {
    return await keyPromise;
  }

 /**
  * Encrypt a file and send it to the user with a certain public key.
  * @param options The options object
  * @param {File} options.file The JavaScript file object to encrypt
  * @param {String} options.to The person to send the file to.
  * @returns The encrypted file.
  */
  function encrypt({ file, to }) {
    return new Promise((resolve) => {
      var reader = new FileReader();
      reader.onload = async () => {
        const publicKey = await new Promise(async (res) => {
          emit("get public key", { id: to }, ({ error, key, message }) => {
            if (error) {
              console.log("Tried to get public key for %o id", to);
              console.error(message);
              return;
            } else {
              res(key);
            }
          });
        });
        resolve(crypt.encrypt(publicKey, reader.result));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * It takes a file string, decrypts it with the private key, and returns the decrypted data URL.
   * @param fileString - The encrypted file as a string.
   * @returns The data URL.
   */
  async function decrypt(fileString) {
    const { privateKey } = await keyPromise;
    return crypt.decrypt(privateKey, fileString).message; // Should return the data URL if everything works right.
  }
})();
