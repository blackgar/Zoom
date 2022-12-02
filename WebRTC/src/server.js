import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  // 방에 참가하는 이벤트를 받아 해당 방에 참가할 수 있도록 하고 welcome 이벤트를 프론트에 전달해서 문구가 나올 수 있게 한다.
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    // 앞서 언급했던 myPeerConnection 에러 때문에 done함수는 반환하지 않는다.
    // done();
    socket.to(roomName).emit("welcome");
  });
  // 해당 방에 offer가 날아오면 offer을 다른 브라우저에게 보낼 수 있도록 한다.
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  // answer 이벤트가 감지되면 peer A에게 answer을 보낸다.
  socket.on("answer", (answer, roomName) =>
    socket.to(roomName).emit("answer", answer)
  );
  // 브라우저끼리 candidate을 주고 받을 수 있게 하기
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

const handleListen = () =>
  console.log(`현재 http://localhost:3000 이 주소와 연결되어 있습니다.`);

httpServer.listen(3000, handleListen);
