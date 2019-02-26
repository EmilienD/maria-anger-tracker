const fs = require("fs");
const express = require("express");
const winston = require("winston");
const app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
const port = 8080;
const fileTransport = new winston.transports.File({ filename: "server.log" });
winston.add(fileTransport);

app.use(express.static("static"));
app.get("/confessions", (req, res, next) =>
  fs.readFile("./confessions.json", { encoding: "utf8" }, (err, string) => {
    if (!err) {
      res.json(JSON.parse(string));
    } else {
      winston.error(err);
      next(err);
    }
  })
);
app.post("/confession", express.json(), (req, res, next) =>
  fs.readFile("./confessions.json", { encoding: "utf8" }, (err, string) => {
    if (!err) {
      const currentData = JSON.parse(string).data;
      const newConfession = Object.assign(req.body, {
        time: new Date().getTime(),
        ip: req.ip
      });
      winston.info(newConfession);
      const newData = currentData.concat(newConfession);
      fs.writeFile(
        "./confessions.json",
        JSON.stringify({ data: newData }),
        err => {
          if (err) {
            winston.error(err);
            next(err);
          } else {
            res.send();
            io.emit("new-confession", { data: newData });
          }
        }
      );
    } else {
      winston.error(err);
      next(err);
    }
  })
);

http.listen(port, () => {
  winston.info(`Maria's anger tracker listening on port ${port}!`);
});
