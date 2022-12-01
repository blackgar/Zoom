import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () =>
  console.log(`현재 http://localhost:3000 이 주소와 연결되어 있습니다.`);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  // sockets: Map(1) { 'nnv2FK4mdnNSErGYAAAB' => [Circular *1] } 내부적으로 자동으로 연결된 브라우저를 추적한다.
  // console.log(socket);
  // socket.io에서는 프론트엔드에서 전달한 이벤트를 감지해서 전달해주는 인자를 받아올 수 있다. 이 때 무조건 프론트엔드에서 지정한 이벤트 이름과 같은 이벤트로 받아야 한다.
  // 마찬가지로 두 번째로 전달된 메시지를 매개변수로 받아와서 활용할 수 있고 세 번째로 전달된 callback 함수를 바로 사용할 수 있다.
  socket.on("enter_room", (msg, done) => {
    console.log(msg);
    setTimeout(() => {
      // 서버 작업이 끝난 뒤 문구 표시를 위한 함수
      // 브라우저 콘솔창에 나타나도록 한다.
      done();
    }, 1000);
  });
});

// WebSocket을 활용한 서버 구축
// const wss = new WebSocket.Server({ server });

// const sockets = [];
// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "Anonymous";
//   console.log("브라우저에 연결되었습니다. ✅");
//   socket.on("close", () => console.log("브라우저와의 연결이 끊어졌습니다. ❌"));
//   socket.on("message", (message) => {
//     const parsedMessage = JSON.parse(message);
//     switch (parsedMessage.type) {
//       case "message":
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname} : ${parsedMessage.payload}`)
//         );
//       case "nickname":
//         socket["nickname"] = parsedMessage.payload;
//     }
//   });
// });

httpServer.listen(3000, handleListen);
