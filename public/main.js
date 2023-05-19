/*
@todo Organize code in main.js
@body The code of main.js is pretty messy and could use some organization.
*/
setup();

var app = Vue.createApp({
  data() {
    return {
      clients: [],
      messages: [
        "Devices nearby or on the same network as you will show up here.",
        "Click on a device to open the file chooser",
        "Set ?ip=anything in the url to connect with someone far away",
      ],
      messageIndex: 0,
    };
  },
  methods: {
    /* When the user clicks on a button, the button's id is stored in app.justClicked. Then, the
    user is prompted to select a file. The file is then sent to the server. */
    upload_to_client: async (event) => {
      var t = event.target;
      app.justClicked = t.getAttribute("data-id");
      file = await getFile();
      console.log("File input changed: ", file);
      sendFile({ file, id: app.justClicked });
    },
  },
  computed: {
    message() {
      return this.messages[this.messageIndex];
    },
  },
  watch: {
    clients() {
      setTimeout(() => {
        console.log("clients updated");
        for (let el of document.querySelectorAll(
          "[data-id]:not([drag-initiated])"
        )) {
          addDrag(el);
        }
      }, 500);
    },
  },
}).mount("#app");

/* Every five seconds, increase the messageIndex by one. If the messageIndex is greater than the
number of messages, reset the messageIndex to zero. */
setInterval(() => {
  app.messageIndex++;
  if (app.messageIndex > app.messages.length - 1) {
    app.messageIndex = 0;
  }
}, 5000);

var socket = io();
var ip;
var id = null;

/* When the page loads, we fetch the user's IP address from an external service, and then we send
that IP address to the server. The server then generates a key for the user, and sends it back to
the client. The client then sends the key back to the server, and the server then sends the key to
the server. */
if (param('ip')) {
  connectWithIP(param('ip'));
} else {
  fetch("https://icanhazip.com/")
    .then((res) => res.text())
    .then((ip) => connectWithIP(ip))
    .catch((e) => connectWithIP(hash(new Date().toDateString())))
}
async function connectWithIP(ip) {
  if (param("dev")) {
    console.log(
      `%cHello dev!%c\nGo to https://ondrop.dev/errors/${ip} to see logging from this IP address.`,
      "color: orange; font-weight: 500; font-size: 1.3rem;",
      "color: gray; font-style: italic;"
    );
  }
  if (!localStorage.getItem("name")) {
    localStorage.setItem(
      "name",
      await prompt({ title: "Name", text: "Enter your name below." })
    );
  }
  // Wait for key to be generated.
  await cryptoLoadPromise;
  await until(() => window.c);
  // c is the crypto lib from crypto_client.js
  await c.key();
  var stuff = {
    name: localStorage.getItem("name"),
    userAgent: navigator.userAgent,
  };
  if (param("ip")) {
    stuff.hash = param("ip");
  } else {
    //IP is hashed server side
    stuff.addr = ip;
  }
  console.log('Emit IP', stuff, ip)
  socket.emit("ip", stuff);
}

var joinedTime = -1;
socket.on("joined room", async (_) => {
  joinedTime = Date.now();
  console.log("Joined room: ", _);
  if (!param("file_picker")) {
    rewriteUrl();
    return;
  }
  /* If there is a file_picker URL param, show the file upload button. */
  await new Promise((resolve) => {
    alert({
      title: "Click 'upload' to upload a file",
      text: "This dialog shows up because '?file_picker' is in the URL.",
      buttontext: "Upload",
    }).then(resolve);
    document.querySelector("#popup-close").style.width = "100%";
  });
  // If we get file from service worker. (share_target)
  var file = await getFile();
  console.log("File ", file);
  for (let item of document.querySelectorAll("[data-id]")) {
    var id = item.getAttribute("data-id");
    socket.emit("uploading", { id });
    socket.emit("file", {
      file: await c.encrypt({ file, to: id }),
      name: file.name,
      type: file.type,
      to: id,
    });
  }
  rewriteUrl();

  function rewriteUrl() {
    // Share target, but I was too lazy to name the variable.
    var stgt = param("share_target")
      ? `&share_target=${escape(param("share_target"))}`
      : "";
    history.replaceState({}, "OnDrop", `?ip=${_}${stgt}`);
  }
});
/* When a new client connects, add them to the list of clients. */
socket.on("new client", async (_) => {
  app.clients = [...app.clients, _];

  console.log("New client: ", _);
  if (!param("share_target"))
    return console.log(
      "Would ask for `share_target` but query param isn't in url"
    );
  if (Date.now() - joinedTime > 0 && Date.now() - joinedTime < 15000) {
    console.log("Asking for file");
    joinedTime = -1;
    (await navigator.serviceWorker.ready).active.postMessage({
      type: "GET_FILE",
    });
  }
});
/* When a client disconnects, remove them from the list of clients. */
socket.on("client left", (_) => {
  console.log("Client left: ", _);
  app.clients = app.clients.filter((i) => i.id !== _.id);
});
/* Listen for the ID of the current client */
socket.on("id", (_) => {
  console.log("This client's id is: ", _);
  id = _;
});
/* When a file is uploaded, the server emits an event with the file's id and the id of the user who
uploaded it. The client checks if the id matches its own id. If it does, it sets the uploading
attribute on itself. If it doesn't, it sets the uploading attribute on the element with the matching
id. */
socket.on("uploading", ({ id: _id, toId }) => {
  if (_id === id) {
    [...document.querySelectorAll("[data-id]")]
      .find((i) => i.getAttribute("data-id") === toId)
      .setAttribute("uploading", "");
    return console.log(
      "Uploader is self, setting uploading attribute on other el."
    );
  }
  console.log("Somebody is uploading: ", _id);
  [...document.querySelectorAll("[data-id]")]
    .find((i) => i.getAttribute("data-id") === _id)
    .setAttribute("uploading", "");
});
/* When the server emits the `done uploading` event, it will send a payload containing the id of the
user that just uploaded. We then use that id to find the corresponding user in the DOM and
remove the `uploading` attribute. */
socket.on("done uploading", ({ id: _id }) => {
  console.log("Done uploading", _id);
  [...document.querySelectorAll("[data-id]")]
    .find((i) => i.getAttribute("data-id") === _id)
    .removeAttribute("uploading");
});
/* When a file is sent to us, we want to decrypt it and then download it. */
socket.on("got file", async (info) => {
  console.log("info.fromId is: ", info.fromId, info.fromId === id);
  if (info.fromId === id) {
    // This is to get file events from self, this means we can sense when the
    // upload is done. We want to stop flashing the square.
    uploadNotice();
    [...document.querySelectorAll("[data-id]")]
      .find((i) => i.getAttribute("data-id") === info.to)
      .removeAttribute("uploading");
    return;
  }
  if (info.to !== id) return;
  decryptingNotice();
  var encryptedText = await fetch(info.url).then((res) => res.text());
  info.url = dataURItoBlob(await c.decrypt(encryptedText));
  done();
  alert({
    title: `${info.from} sent you a file:`,
    backgroundclick: true,
    text: `<a target="_blank" href=${JSON.stringify(
      info.url
    )} class="underline">${info.name
      }</a><br><a id="download_link" href=${JSON.stringify(
        info.url
      )} download=${JSON.stringify(info.name)}>Download</a>`,
    buttontext: `Download`,
  });

  document
    .getElementById("download_link")
    .addEventListener("click", removePopup);
  document.getElementById("popup-bg").addEventListener("click", removePopup);
  document.getElementById("popup-close").remove();
  console.log("Got file", info, info.to === id);
  function removePopup() {
    [...document.querySelectorAll("#popup, #popup-bg")].forEach((i) =>
      i.remove()
    );
  }
});

/* Getting the value of a parameter from the URL. */
function param(name) {
  var params = new URLSearchParams(location.search);
  return params.get(name);
}

/* Load the crypto_client.js script */
var s = document.createElement("script");
var cryptoLoadPromiseRes;
var cryptoLoadPromise = new Promise(
  (resolve) => (cryptoLoadPromiseRes = resolve)
);

s.src = "crypto_client.js";
document.head.appendChild(s);
s.onload = async () => {
  publicKeyNotice();

  await new Promise((r) => setTimeout(r, 500));

  cryptoLoadPromiseRes();
};
/**
 * Converts a data URI to a Blob.
 * @param dataURI - The data URI to convert to a Blob
 * @returns The URL of the blob.
 */
function dataURItoBlob(dataURI) {
  var mime = dataURI.split(",")[0].split(":")[1].split(";")[0];
  var binary = atob(dataURI.split(",")[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return URL.createObjectURL(new Blob([new Uint8Array(array)], { type: mime }));
}
/**
 * Open the file picker and ask for a file.
 * @returns {Promise.<File>} The file object.
 */
async function getFile() {
  return new Promise((resolve) => {
    var e = document.createElement("input");
    e.style.display = "none";
    e.type = "file";
    document.body.appendChild(e);
    e.onchange = (event) => {
      resolve(e.files[0]);
      e.remove();
    };
    e.click();
  });
}
/**
 * Emit events for file upload
 * @param opts The options
 * @param opts.file A JS file object to upload
 * @param opts.to The ID of the user to send the file to
 */
async function sendFile(opts) {
  socket.emit("uploading", { id, to: opts.id });
  socket.emit("file", {
    file: await c.encrypt({ file: opts.file, to: opts.id }),
    name: opts.file.name,
    type: opts.file.type,
    to: opts.id || opts.to,
  });
}

async function setup() {
  //Notifications
  setTimeout(notifs, 10000);

  //Service worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("sw.js")
      .then((reg) => console.log("Service worker registered"))
      .catch((err) => console.log("Service worker not registered", err));

    navigator.serviceWorker.ready.then((r) => {
      console.log("Service worker ready", r);
      navigator.serviceWorker.addEventListener("message", async (event) => {
        // Set this then detection is done once we join a room.
        window["SERVICE_WORKER_FILE"] = event.data.file;
        console.log("Got service worker file", event.data);
        var { file } = event.data;
        console.log("File ", file);
        for (let item of document.querySelectorAll("[data-id]")) {
          var to_id = item.getAttribute("data-id");
          sendFile({
            file,
            id: to_id,
          });
        }
      });
    });
  }

  //Cookies and error messages
  const { getCookie, setCookie, removeCookie } = await import("./cookies.js");
  if (getCookie("error")) {
    console.log("Got error cookie from server: %o", getCookie("error"));
    alert(JSON.parse(unescape(getCookie("error"))));
    document.querySelector("#popup-close").style.width = "100%";
    removeCookie("error");
  }

  //Dev mode
  /* If the `dev` parameter is present, then the `window.onerror` event is hooked up to the
  socket.io server. The `window.onerror` event is triggered when an error occurs in the browser. The
  `window.onerror` event is sent to the server, and the server then sends the error to the client.
  */
  if (param("dev")) {
    window.onerror = function (message, source, line, col, error) {
      socket.emit("error", {
        ip: ip,
        type: "window_onerror__message",
        message,
      });
    };
    var oldconsole = {};
    window["LOGGING_MESSAGES"] = {};
    for (let item of ["log", "error", "info"]) {
      oldconsole[item] = console[item];
      window["LOGGING_MESSAGES"][item] = [];
      console[item] = (...args) => {
        socket.emit("error", {
          ip,
          type: item,
          message: args,
        });
        window["LOGGING_MESSAGES"][item].push(args);
        oldconsole[item](...args);
      };
    }
  }

  //Set up pasting
  document.onpaste = async function (event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData)
      .items;
    console.log(JSON.stringify(items)); // might give you mime types
    for (var index in items) {
      var item = items[index];
      var file = item;
      if (item.kind === "file") {
        file = item.getAsFile();
      } else if (item.kind === "string") {
        file = await new Promise((res) => file.getAsString(res));
        file = new File([file], "message.txt", { type: "text/plain" });
      } else {
        return;
      }
      for (let item of document.querySelectorAll("[data-id]")) {
        var to_id = item.getAttribute("data-id");
        sendFile({ id: to_id, file });
      }
    }
  };
}
/**
 * If the user has not granted permission to send notifications, then request permission.
 * @returns none
 */
function notifs() {
  if (Notification.permission !== "default") return;
  notice(
    "Grant access to notifications to get notifications when a file is sent or finishes uploading!"
  );

  Notification.requestPermission().then((result) => {
    if (result === "granted") {
      notice("Thanks!");
    } else {
      // Incognito does not bother asking, and immediately rejects
      // notice("Ok, that's fine.");
    }
  });
}
/**
 * Given a string and a seed, return a hash of the string using the seed.
 * @param str - the string to hash
 * @param [seed=0] - 0xdeadbeef
 * @returns The hash value.
 */
function hash(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
/**
 * Add file dragover listeners to an element and add a dragging attribute if holding a file over it.
 * @param dropZone - The element that will be the drop zone.
 * @returns The file object.
 */
function addDrag(dropZone) {
  dropZone.setAttribute("drag-initiated", "");
  // Optional.   Show the copy icon when dragging over.  Seems to only work for
  // chrome.
  dropZone.addEventListener("dragover", function (e) {
    e.stopPropagation();
    e.preventDefault();
    dropZone.setAttribute("dragging", "");
    e.dataTransfer.dropEffect = "copy";
  });

  // Get file data on drop
  dropZone.addEventListener("drop", async function (e) {
    dropZone.setAttribute("uploading", "");
    dropZone.removeAttribute("dragging");
    e.stopPropagation();
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    if (!file) {
      file = e.dataTransfer.items[0];
      console.log(file);
      file =
        file.getAsFile() || (await new Promise((res) => file.getAsString(res)));
      if (typeof file === "string") {
        file = new File([file], "message.txt", { type: "text/plain" });
      }
      console.log(file);
      if (!file) return;
      file.name = "file";
    }

    sendFile({ file, id: dropZone.getAttribute("data-id") });
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.removeAttribute("dragging");
  });
}

/**
 * Waits until the provided function returns a truthy value.
 * @param {Function} func - The function to execute.
 * @param {Number} int - The number of milliseconds to wait for the setInterval.
 * @returns {Promise} A promise that resolves with the truthy value returned by the function.
 * @example
 * // Wait until isLoggedIn returns truthy value
 * await until(() => isLoggedIn());
 */
function until(func, int = 100) {
  return new Promise(resolve => {
    let result = func();
    if (result) {
      resolve(result);
    } else {
      let interval = setInterval(() => {
        result = func();
        if (result) {
          clearInterval(interval);
          resolve(result);
        }
      }, int);
    }
  });
}