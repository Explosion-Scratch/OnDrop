const express = require("express");
var connections = [];
const app = express();
const path = require("path");
const { v4: id } = require("uuid");
const fs = require("fs");
const http = require("http");
var sanitize = require("sanitize-filename");
const server = http.createServer(app);
const { Server } = require("socket.io");
const errors = [];

// set up rate limiter: maximum of 100 requests per minute
var RateLimit = require("express-rate-limit");
var limiter = new RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
});

// apply rate limiter to all requests
app.use(limiter);

var keys = {};

const FILE_SIZE_LIMIT = 200; /*mb*/

const io = new Server(server, {
  pingTimeout: 30000,
  maxHttpBufferSize: 1e6 * FILE_SIZE_LIMIT,
});

const mime = require("mime-types");
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

if (fs.existsSync(`${__dirname}/uploads`)) {
  const files = fs.readdirSync(`${__dirname}/uploads`);

  files.forEach((file) => {
    fs.unlinkSync(`${__dirname}/uploads/${file}`);
  });
} else {
  fs.mkdirSync(`${__dirname}/uploads`);
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
app.post("/", (req, res) => {
  res.cookie(
    "error",
    JSON.stringify({
      title: "Sorry, an error occurred",
      text: "Part of the app wasn't setup yet, try sharing again!",
    })
  );
});

app.get("/errors/:ip", (req, res) => {
  var formatted = {};
  var errs = errors.filter((i) => i.ip == req.params.ip);
  for (let { type, message, time } of errs) {
    formatted[type] = formatted[type] || [];
    formatted[type].push({ time, arguments: message });
  }
  res.json(formatted);
});

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  var joined = false;
  var ip = null;
  var _id = id();
  var name = id();
  var files = [];
  socket.on("disconnect", () => {
    connections = connections.filter((i) => i.id !== _id);
    socket.to(ip).emit("client left", { name, id: _id });

    for (let item of files) {
      try {
        fs.unlinkSync(`${__dirname}/uploads/${item}`);
      } catch (e) {}
    }
  });
  socket.on("error", (err) => {
    errors.push({ ...err, time: new Date().toString() });
  });
  socket.on("public key", ({ key }) => {
    keys[_id] = key;
  });
  socket.on("get public key", ({ id }, callback) => {
    if (!keys[id]) callback({ error: true, message: "Key not found" });
    callback({ error: false, key: keys[id] });
  });
  socket.on("uploading", ({ id, to }) => {
    io.to(ip).emit("uploading", { id, toId: to });
  });

  socket.on("ip", (info) => {
    joined = true;
    ip = info.addr ? hash(info.addr) : info.hash;
    name = info.name;
    const this_socket = { ip, name, id: _id, userAgent: info.userAgent };
    connections.push(this_socket);

    socket.join(ip);
    // Join the ID room.
    socket.join(_id);
    socket.emit("joined room", ip);
    io.to(_id).emit("id", _id);
    for (let i of connections
      .filter((item) => item.ip === ip)
      .filter((item) => item.id !== _id)) {
      io.to(_id).emit("new client", {
        name: i.name,
        id: i.id,
        userAgent: info.userAgent,
      });
    }
    socket
      .to(ip)
      .emit("new client", { name, id: _id, userAgent: info.userAgent });
  });

  socket.on("file", (blob) => {
    if (!joined) return;

    const filename = `${id()}.txt`;

    files.push(filename);

    fs.writeFileSync(`${__dirname}/uploads/${filename}`, blob.file);
    //Emit done uploading event to other clients
    socket.to(ip).emit("done uploading", { id: _id });
    const FIVE_MINUTES = 1000 * 60 * 5;
    setTimeout(
      () => fs.unlink(`${__dirname}/uploads/${filename}`, () => {}),
      FIVE_MINUTES
    );
    
    io.to(ip).emit("got file", {
      to: blob.to,
      url: `/dl/${filename}`,
      from: name,
      name: blob.name,
      fromId: _id,
    });
  });
});

//Used for getting the file, doesn't send the file, but rather JSON of the encrypted version
app.get("/dl/:id", (req, res) => {
  var error = false;
  try {
    res.json(
      JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "uploads", sanitize(req.params.id))
        )
      )
    );
  } catch (e) {
    res.json({ error: true, message: "No such file exists" });
    error = true;
  }
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
