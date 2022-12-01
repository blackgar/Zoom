import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

// 페이지 화면을 보여줄 엔진으로 pug 지정
app.set("view engine", "pug");
// views로 보여줄 페이지 경로를 설정한다.
app.set("views", __dirname + "/views");
//- 아래는 정적으로 폴더주소로 해당 페이지가 보여질 수 있도록 설정
app.use("/public", express.static(__dirname + "/public"));

// "/"주소로 홈화면을 보여주도록 렌더링
app.get("/", (req, res) => res.render("home"));
// 유저가 "/" 경로 말고 다른 경로로 진입할 때 홈으로 리다이렉트 시켜주는 방법
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () =>
  console.log(`현재 http://localhost:3000 이 주소와 연결되어 있습니다.`);
// app.listen(3000, handleListen);

// 서버 생성, http 서버로 접근이 가능해져 여기에 webSocket을 만들 수 있다.
const server = http.createServer(app);

// 이렇게 wss에 server을 넣어주게 되면 http 위에 websocket을 생성해 한 서버에서 둘 다 사용가능. 즉, 포트 3000으로 websocket과 http 모두 처리 가능
const wss = new WebSocket.Server({ server });

// 연결 이벤트가 발생했을 때 callback 함수를 실행. 이때 socket이라는 브라우저와 연결해주는 중간자 역할을 하는 인자를 같이 넘겨준다. 즉, socket은 현재 연결된 브라우저를 의미
wss.on("connection", (socket) => {
  // socket안에 내장되어 있는 메서드 send를 통해 메시지를 보낼 수 있다.
  // 이렇게 메시지를 보냈다면 front-end에서도 메시지를 받는 부분을 구현해줘야 한다.
  // 메시지는 frontend에서 event가 된다.
  console.log("브라우저에 연결되었습니다. ✅");
  // 브라우저 탭을 닫으면 꺼진다. socket 메서드 중 on으로 이벤트 감지 가능
  socket.on("close", () => console.log("브라우저와의 연결이 끊어졌습니다. ❌"));
  // 브라우저에서 전해진 메시지를 감지해서 읽어오기
  socket.on("message", (message) => {
    // 그냥 출력하는 경우 <Buffer eb b8 ... > 이런식으로 깨지는 상황이 생기는데 utf8로 변환해서 출력해주면 이상 없이 값을 확인할 수 있다.
    console.log(message.toString("utf8"));
    // 서버에서 메시지를 받으면 이를 브라우저에 다시 보내서 작동이 잘 되는지 체크
    socket.send(message.toString("utf8"));
  });
  // socket.send("안녕하세요~ 브라우저로 방문해주신 여러분!!!");
});

server.listen(3000, handleListen);
