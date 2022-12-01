// io 함수가 알아서 socket.io를 실행하고 있는 서버를 탐색한다.
const socket = io();

const $welcome = document.getElementById("welcome");
const $room = document.getElementById("room");
const $form = $welcome.querySelector("form");

// 처음에는 방을 보여주지 않고 숨겼다가 방에 들어가면 방을 보여주도록 한다.
$room.hidden = true;

let roomName;

// 인자를 받아 메시지를 추가해주는 함수
function addMessage(message) {
  const $ul = $room.querySelector("ul");
  const $li = document.createElement("li");
  $li.innerText = message;
  $ul.appendChild($li);
}

// 백엔드에서 처리 완료했을 때 작동시킬 함수, 서버측에서 인자 전달이 가능하다.
function showRoom() {
  // 방에 들어가게 되면 방이름 입력창을 안보이게 하고 방 안에 채팅 부분을 보이게 하기
  $welcome.hidden = true;
  $room.hidden = false;
  const h3 = $room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const $input = $form.querySelector("input");
  // socket.io의 경우 send가 아닌 emit으로 메시지를 전달하는데 메시지만 보내는 것이 아니라 첫 번째 인자로 특정 이벤트("enter_room")를 지정해서 보내고 두 번째 인자로 전달할 메시지(내용)을 넘겨준다. 이 때 object타입을 포함한 다양한 타입의 메시지를 그냥 전달할 수 있다. 그리고 세 번째 인자로 server에서 프론트엔드에서 실행시킬 callback함수를 지정해서 전달할 수 있다.
  // 이 때 중간에 하나의 값이 아닌 여러개의 값을 연달아 전달할 수 있다. 단, 함수를 포함시킬 때는 무조건 마지막에 넣어야 한다.
  socket.emit("enter_room", $input.value, showRoom);
  roomName = $input.value;
  $input.value = "";
}

$form.addEventListener("submit", handleRoomSubmit);

// server에서 메시지를 보낼 때 내보낸 welcome event가 감지되면 메시지를 추가하는 함수 실행하기.
socket.on("welcome", () => {
  addMessage("Someone Joined");
});
