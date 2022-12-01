const $ul = document.querySelector("ul");
const $nickname = document.querySelector("#nickname");
const $message = document.querySelector("#message");
// front-end와 back-end를 연결시켜주는 new WebSocket
// 그냥 주소를 입력해도 되지만, 현재 어느 위치를 바라보고 있는지 변수명으로 지정해주면 나중에 휴대폰으로 접속해도 정상적인 url을 제공해줄 수 있다.
// server 부분의 socket과 같은 변수명이라 헷갈릴 수 있는데 이 떄의 socket은 서버와의 연결을 의미하고 server에서의 socket은 연결된 브라우저를 의미한다.
// front-end에서 backend와 연결하기 위해서는 ws주소를 통해 연결을 해야 한다.
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

// 서버와 연결이 됐을 때 open event를 감지해 함수 실행
socket.addEventListener("open", () => {
  console.log("서버에 연결되었습니다. ✅");
});

// 서버에서 전달된 메시지를 message event를 감지해 읽어와서 보여주기
socket.addEventListener("message", (message) => {
  // console.log("새로운 메시지 :", message.data);
  const $li = document.createElement("li");
  $li.innerText = message.data;
  $ul.append($li);
});

// 서버가 오프라인이 될 때의 close event를 감지해 함수 실행
socket.addEventListener("close", () => {
  console.log("서버와의 연결이 끊어졌습니다. ❌");
});

// setTimeout(() => {
//   // browser에서 server로 메시지 보내기.
//   socket.send("브라우저에서 보내는 메시지입니다.");
// }, 10000);

function handleSubmit(event) {
  event.preventDefault();
  const $input = $message.querySelector("input");
  console.log($input.value);
  // input에 입력된 값을 서버로 전달.
  socket.send(makeMessage("message", $input.value));
  $input.value = "";
}
// 이렇게 메시지를 두 군데서 보내게 되면 백엔드에서는 그냥 모두 똑같은 메시지로 인식해버리는 문제가 생긴다.
// 그렇기 때문에 메시지를 서버로 보낼 때 그냥 text만 보내는 것이 아니라 json형태로 type을 지정해서 해당 type에 맞는 처리를 서버에서 할 수 있도록 보내줘야 한다.
function handleNickSubmit(event) {
  event.preventDefault();
  const $input = $nickname.querySelector("input");
  console.log($input.value);
  // input에 입력된 값을 서버로 전달.
  // 서버에서는 string만 받을 수 있기 때문에 이러한 json 형태는 stringify해서 보낸다음 server에서 JSON.parse로 풀어서 사용한다.
  socket.send(makeMessage("nickname", $input.value));
  $input.value = "";
}

$message.addEventListener("submit", handleSubmit);
$nickname.addEventListener("submit", handleNickSubmit);
