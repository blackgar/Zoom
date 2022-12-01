const $ul = document.querySelector("ul");
const $form = document.querySelector("form");

// front-end와 back-end를 연결시켜주는 new WebSocket
// 그냥 주소를 입력해도 되지만, 현재 어느 위치를 바라보고 있는지 변수명으로 지정해주면 나중에 휴대폰으로 접속해도 정상적인 url을 제공해줄 수 있다.
// server 부분의 socket과 같은 변수명이라 헷갈릴 수 있는데 이 떄의 socket은 서버와의 연결을 의미하고 server에서의 socket은 연결된 브라우저를 의미한다.
// front-end에서 backend와 연결하기 위해서는 ws주소를 통해 연결을 해야 한다.
const socket = new WebSocket(`ws://${window.location.host}`);

// 서버와 연결이 됐을 때 open event를 감지해 함수 실행
socket.addEventListener("open", () => {
  console.log("서버에 연결되었습니다. ✅");
});

// 서버에서 전달된 메시지를 message event를 감지해 읽어와서 보여주기
socket.addEventListener("message", (message) => {
  console.log("새로운 메시지 :", message.data);
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
  const $input = $form.querySelector("input");
  console.log($input.value);
  // input에 입력된 값을 서버로 전달.
  socket.send($input.value);
  $input.value = "";
}

$form.addEventListener("submit", handleSubmit);
