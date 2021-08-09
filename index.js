const express = require("express");
var connections = [];
const app = express();
const path = require("path")
const { v4: id } = require("uuid");
const fs = require("fs");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

// set up rate limiter: maximum of five requests per minute
var RateLimit = require('express-rate-limit');
var limiter = new RateLimit({
  windowMs: 1*60*1000, // 1 minute
  max: 100
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

if (fs.existsSync(`${__dirname}/uploads`)) {
  const files = fs.readdirSync(`${__dirname}/uploads`);
  console.log(files);

  files.forEach((file) => {
    fs.unlinkSync(`${__dirname}/uploads/${file}`);
  });
} else {
  fs.mkdirSync(`${__dirname}/uploads`);
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  var joined = false;
  var ip = null;
  var _id = id();
  var name = id();
  var files = [];
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
    connections = connections.filter((i) => i.id !== _id);
    socket.to(ip).emit("client left", { name, id: _id });

    for (let item of files) {
      try {
        fs.unlinkSync(`${__dirname}/uploads/${item}`);
      } catch (e) {}
    }
  });
  socket.on("public key", ({ key }) => {
    keys[_id] = key;
  });
  socket.on("get public key", ({ id }, callback) => {
    console.log(
      Object.keys(keys),
      connections.map((i) => i.id),
      `Me: ${_id}`,
      `Requested: ${id}`
    );
    if (!keys[id]) callback({ error: true, message: "Key not found" });
    callback({ error: false, key: keys[id] });
  });
  socket.on("uploading", ({ id }) => {
    io.to(ip).emit("uploading", { id });
  });

  socket.on("ip", (info) => {
    joined = true;
    ip = info.addr;
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
    // Implement destination, security isn't really a concern here because they're on the same network.
    io.to(ip).emit("got file", {
      to: blob.to,
      url: `/dl/${filename}`,
      from: name,
      name: blob.name,
      fromId: _id,
    });
  });
});
app.get("/dl/:id", (req, res) => {
  var error = false;
  try {
    res.json(
      JSON.parse(fs.readFileSync(path.join(__dirname, "uploads", req.params.id)))
    );
  } catch (e) {
    res.json({ error: true, message: "No such file exists" });
    error = true;
  }
  // Removing the file doesn't let people download twice
  /*
	if (!error){
		setTimeout(() => {
			try {
				fs.unlink(`${__dirname}/uploads/${req.params.id}`, () => {});
			} catch(e){}
		}, 1000)
	}
	*/
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
