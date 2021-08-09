if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    .then((reg) => console.log("Service worker registered"))
    .catch((err) => console.log("Service worker not registered", err));
}

var app = Vue.createApp({
  data() {
    return {
      clients: [],
      messages: [
        "Devices nearby or on the same network as you will show up here.",
        "Click on a device to open the file chooser",
        "Set ?ip=anything in the url to connect with someone far away",
        "The file size limit is 200mb.",
      ],
      messageIndex: 0,
    };
  },
  methods: {
    upload_to_client(event) {
      var t = event.target;
      app.justClicked = t.getAttribute("data-id");
      var fileInput = document.querySelector("#fileInput");
      fileInput.click();
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

async function fileInputChange(el) {
  [...document.querySelectorAll("[data-id]")]
    .find((i) => i.getAttribute("data-id") === app.justClicked)
    .setAttribute("uploading", "");
  var file = el.files[0];
  console.log("File input changed: ", file);
  socket.emit("uploading", { id });
  socket.emit("file", {
    file: await c.encrypt({ file, to: app.justClicked }),
    name: file.name,
    type: file.type,
    to: app.justClicked,
  });
}

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
      var id = item.getAttribute("data-id");
      item.setAttribute("uploading", "");
      socket.emit("uploading", { id });
      socket.emit("file", {
        file: await c.encrypt({ file, to: id }),
        name: file.name,
        type: file.type,
        to: id,
      });
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

    socket.emit("uploading", { id });
    socket.emit("file", {
      file: await c.encrypt({ file, to: dropZone.getAttribute("data-id") }),
      name: file.name,
      type: file.type,
      to: dropZone.getAttribute("data-id"),
    });
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
    ip = data;
    if (!localStorage.getItem("name")) {
      localStorage.setItem(
        "name",
        await prompt({ title: "Name", text: "Enter your name below." })
      );
    }
    //Wait for key to be generated.
    await cryptoLoadPromise;
    await c.key();

    socket.emit("ip", {
      name: localStorage.getItem("name"),
      addr: param("ip") || ip,
      userAgent: navigator.userAgent,
    });
    ready();
  });

function ready() {
  // var blob = new Blob(["test"], {type: "text/plain"});
  // TODO: Add person for destination
  // socket.emit("file", {file: blob, type: blob.type})
}
socket.on("joined room", (_) => console.log("Joined room: ", _));
socket.on("new client", (_) => {
  console.log("New client: ", _);
  app.clients = [...app.clients, _];
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
socket.on("uploading", ({ id: _id }) => {
  console.log(_id);
  [...document.querySelectorAll("[data-id]")]
    .find((i) => i.getAttribute("data-id") === _id)
    .setAttribute("uploading", "");
});
socket.on("done uploading", ({ id: _id }) => {
  console.log(_id);
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
