import http from "http";
// import WebSocket from "ws";
// import SocketIO from "socket.io";
// admin UI를 쓰기 위해 새롭게 import
import { Server } from "socket.io";
import express from "express";
// admin UI를 구현해주기 위해 필요한 모듈
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () =>
  console.log(`현재 http://localhost:3000 이 주소와 연결되어 있습니다.`);

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  // admin 데모 활용을 위한 코드
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});
instrument(wsServer, { auth: false });

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  // 현재 서버에 연결된 모든 정보를 보여준다. 특히 안에 생성된 rooms와 socket.id를 보여준다.
  // console.log(wsServer.sockets.adapter);
  // 무슨 이벤트가 발생하건 실행시키는 코드
  socket.onAny((event) => {
    console.log(`Socket Event:${event}`);
  });
  // sockets: Map(1) { 'nnv2FK4mdnNSErGYAAAB' => [Circular *1] } 내부적으로 자동으로 연결된 브라우저를 추적한다.
  // 서버가 닫히더라도 socket.io는 계속해서 재연결을 시도한다.
  // 다양한 정보들에 대해서는 socket.io docs 확인. 여러 메서드 포함
  // console.log(socket);
  // socket.io에서는 프론트엔드에서 전달한 이벤트를 감지해서 전달해주는 인자를 받아올 수 있다. 이 때 무조건 프론트엔드에서 지정한 이벤트 이름과 같은 이벤트로 받아야 한다.
  // 마찬가지로 두 번째로 전달된 메시지를 매개변수로 받아와서 활용할 수 있고 세 번째로 전달된 callback 함수를 바로 사용할 수 있다.
  socket.on("enter_room", (roomName, showRoom) => {
    // 현재 socket의 id값을 보여준다.
    // console.log(socket.id);
    // console.log(roomName);
    // 현재 어떤 소켓들이 있는지 보여준다.
    // 참고로 user은 private room이 언제나 생성되기 때문에 기본적으로 유저 id로 이루어진 방이 있다.
    // console.log(socket.rooms);
    // 방을 생성해주는 방법
    socket.join(roomName);
    // 방에 들어가게 됐을 때 방에 대한 내용을 보여주는것으로 바꿔주는 함수
    showRoom(countRoom(roomName));
    // roomName안에 있는 모든 유저들에게 메시지 보내기
    // 새로운 유저가 방에 들어오면 해당 방의 유저 숫자를 계산해서 인자로 넘겨준다.
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    // 방이 생성될때마다 모든 방의 유저들에게 변경된 방 정보를 알려준다.(broadcast)
    wsServer.sockets.emit("room_change", publicRooms());
    // console.log(socket.rooms);
    // setTimeout(() => {
    //   // 서버 작업이 끝난 뒤 완료 문구 표시를 위한 함수
    //   // 브라우저 콘솔창에 나타나도록 한다.
    //   // 인자도 전달이 가능하다.
    //   done("처리했습니다.");
    // }, 1000);
  });

  // disconnecting이라는 이벤트는 완전히 연결이 끊어지기 전 이벤트를 나타내는데 이를 감지해서 사용자가 방을 떠날 때 해당 방의 유저들에게 마지막 인사를 하는 메시지를 보낼 수 있다.
  socket.on("disconnecting", () => {
    // rooms에 있는 id값이나 이름을 이용해서 각 방에 메시지 보내기
    socket.rooms.forEach((room) =>
      // 새로운 유저가 방에서 나가면 해당 방의 유저 숫자를 계산해서 인자로 넘겨준다. 이 때 disconnecting 이벤트는 완전히 떠난게 아니므로 떠나는 중인 유저까지 포함되어 있기에 -1해준다.
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });
  //
  socket.on("disconnect", () => {
    // socket 연결이 끊어질때도 마찬가지로 방 변경정보를 알려준다.
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
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
