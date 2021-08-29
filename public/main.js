setup_dev_mode();

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

function notifs() {
  if (Notification.permission !== "default") return;
  notice(
    "Grant access to notifications to get notifications when a file is sent or finishes uploading!"
  );

  Notification.requestPermission().then((result) => {
    if (result === "granted") {
      notice("Thanks!");
    } else {
      //notice("Ok, that's fine.");
    }
  });
}

setTimeout(notifs, 10000);

const hash = function (str, seed = 0) {
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
};

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

setInterval(() => {
  app.messageIndex++;
  if (app.messageIndex > app.messages.length - 1) {
    app.messageIndex = 0;
  }
}, 5000);

document.onpaste = async function (event) {
  var items = (event.clipboardData || event.originalEvent.clipboardData).items;
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
      sendFile({ to: to_id, file });
    }
  }
};

function addDrag(dropZone) {
  dropZone.setAttribute("drag-initiated", "");
  // Optional.   Show the copy icon when dragging over.  Seems to only work for chrome.
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

var socket = io();
var ip;
var id = null;

fetch("https://icanhazip.com/")
  .then((res) => res.text())
  .then(async (data) => {
    ip = param("ip") || data;
    if (param("dev")) {
      console.log(
        `%cHello dev!%c\nGo to https://ondrop.explosionscratc.repl.co/errors/${ip} to see logging from this IP address.`,
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
    //Wait for key to be generated.
    await cryptoLoadPromise;
    await c.key();
    var stuff = {
      name: localStorage.getItem("name"),
      userAgent: navigator.userAgent,
    };
    if (param("ip")) {
      stuff.hash = param("ip");
    } else {
      stuff.addr = ip;
    }
    socket.emit("ip", stuff);
    ready();
  });

function ready() {
  // var blob = new Blob(["test"], {type: "text/plain"});
  // TODO: Add person for destination
  // socket.emit("file", {file: blob, type: blob.type})
}
var joinedTime = -1;
socket.on("joined room", async (_) => {
  joinedTime = Date.now();
  console.log("Joined room: ", _);
  if (!param("file_picker")) {
    rewriteUrl();
    return;
  }
  await new Promise((resolve) => {
    alert({
      title: "Click 'upload' to upload a file",
      text: "This dialog shows up because '?file_picker' is in the URL.",
      buttontext: "Upload",
    }).then(resolve);
    document.querySelector("#popup-close").style.width = "100%";
  });
  // If we get file from service worker.
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
socket.on("client left", (_) => {
  console.log("Client left: ", _);
  app.clients = app.clients.filter((i) => i.id !== _.id);
});
socket.on("test message", (_) => console.log("Got test message: ", _));
socket.on("id", (_) => {
  console.log("This client's id is: ", _);
  id = _;
});
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
socket.on("done uploading", ({ id: _id }) => {
  console.log("Done uploading", _id);
  [...document.querySelectorAll("[data-id]")]
    .find((i) => i.getAttribute("data-id") === _id)
    .removeAttribute("uploading");
});
socket.on("got file", async (info) => {
  console.log("info.fromId is: ", info.fromId, info.fromId === id);
  if (info.fromId === id) {
    // This is to get file events from self, this means we can sense when the upload is done. We want to stop flashing the square.
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
    )} class="underline">${
      info.name
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

function param(name) {
  var params = new URLSearchParams(location.search);
  return params.get(name);
}

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
function dataURItoBlob(dataURI) {
  var mime = dataURI.split(",")[0].split(":")[1].split(";")[0];
  var binary = atob(dataURI.split(",")[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return URL.createObjectURL(new Blob([new Uint8Array(array)], { type: mime }));
}
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
async function sendFile(opts) {
  socket.emit("uploading", { id, to: opts.id });
  socket.emit("file", {
    file: await c.encrypt({ file: opts.file, to: opts.id }),
    name: opts.file.name,
    type: opts.file.type,
    to: opts.id,
  });
}

function setup_dev_mode() {
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
}
