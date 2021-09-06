(async () => {
  window = self;

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

  keyPromise.then(async (key) => {
    console.log("Public key generated");
    emit("public key", { key: key.publicKey });
    postMessage({ type: "key generated", key: key.publicKey });
    return key;
  });

  async function key() {
    return await keyPromise;
  }

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

  async function decrypt(fileString) {
    const { privateKey } = await keyPromise;
    return crypt.decrypt(privateKey, fileString).message; // Should return the data URL if everything works right.
  }
})();
