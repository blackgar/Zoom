// io 함수가 알아서 socket.io를 실행하고 있는 서버를 탐색한다.
const socket = io();

const $welcome = document.getElementById("welcome");
const $room = document.getElementById("room");
const $form = $welcome.querySelector("#name");
const $nick = $welcome.querySelector("#nick");

// 처음에는 방을 보여주지 않고 숨겼다가 방에 들어가면 방을 보여주도록 한다.
$room.hidden = true;

let roomName, nickName;

// 인자를 받아 메시지를 추가해주는 함수
function addMessage(message) {
  const $ul = $room.querySelector("ul");
  const $li = document.createElement("li");
  $li.innerText = message;
  $ul.appendChild($li);
}

// 메시지를 입력했을 때 관련된 이벤트를 서버측에서 감지할 수 있게 하고 메시지 내용을 전달해서 다시 그 메시지 내용으로 화면에 나타날 수 있게끔 하는 함수
function handleMessageSubmit(event) {
  event.preventDefault();
  const $input = $room.querySelector("#msg input");
  // 메시지 내용과 방이름을 같이 인자로 전달해서 어느 방으로 메시지를 보내야할지를 정할 수 있도록 한다.
  socket.emit("new_message", $input.value, roomName, () => {
    console.log($input.value);
    // addMessage(`You: ${$input.value}`);
    addMessage(`${nickName}(You): ${$input.value}`);
    // 이부분을 밖에 쓰게 되면 내용이 나타나지 않는다. socket통신보다 먼저 그 아래 코드를 실행하므로. 동기/비동기!
    $input.value = "";
  });
  // 이렇게 하면 내가 친 채팅이 안보인다.
  // $input.value = "";
}
function handleNicknameSubmit(event) {
  event.preventDefault();
  const $input = $welcome.querySelector("#nick input");
  nickName = $input.value;
  socket.emit("nickname", $input.value);
}

// 백엔드에서 처리 완료했을 때 작동시킬 함수, 서버측에서 인자 전달이 가능하다.
function showRoom(newCount) {
  // 방에 들어가게 되면 방이름 입력창을 안보이게 하고 방 안에 채팅 부분을 보이게 하기

  $welcome.hidden = true;
  $room.hidden = false;
  const h3 = $room.querySelector("h3");
  h3.innerText = `Room ${roomName}. 현재 유저수 : ${newCount}`;
  const $msg = $room.querySelector("#msg");

  $msg.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();

  const $input = $form.querySelector("input");
  // socket.io의 경우 send가 아닌 emit으로 메시지를 전달하는데 메시지만 보내는 것이 아니라 첫 번째 인자로 특정 이벤트("enter_room")를 지정해서 보내고 두 번째 인자로 전달할 메시지(내용)을 넘겨준다. 이 때 object타입을 포함한 다양한 타입의 메시지를 그냥 전달할 수 있다. 그리고 세 번째 인자로 server에서 프론트엔드에서 실행시킬 callback함수를 지정해서 전달할 수 있다.
  // 이 때 중간에 하나의 값이 아닌 여러개의 값을 연달아 전달할 수 있다. 단, 함수를 포함시킬 때는 무조건 마지막에 넣어야 한다.
  roomName = $input.value;
  if (!(nickName && roomName)) {
    alert("닉네임을 설정한 후 방이름을 입력해주세요.");
    return;
  }
  socket.emit("enter_room", $input.value, showRoom);
  $input.value = "";
}

$form.addEventListener("submit", handleRoomSubmit);
$nick.addEventListener("submit", handleNicknameSubmit);

// server에서 메시지를 보낼 때 내보낸 welcome event가 감지되면 메시지를 추가하는 함수 실행하기.
socket.on("welcome", (nickname, newCount) => {
  const h3 = $room.querySelector("h3");
  h3.innerText = `Room ${roomName}. 현재 유저수 : ${newCount}`;
  addMessage(`${nickname}님이 들어오셨습니다.`);
});

socket.on("bye", (nickname, newCount) => {
  const h3 = $room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${nickname}님이 나가셨습니다.`);
});

socket.on("new_message", addMessage);
// 방 정보가 변경되면 현재 남아있는 방에 대한 배열을 값으로 받아온 다음 배열안의 이름을 li태그로 추가해준다. 만약 방이 모두 비어있을 경우 아무것도 추가하지 않고 빈 태그 값 반환.
socket.on("room_change", (rooms) => {
  const roomList = $welcome.querySelector("ul");
  // roomList안에 있던 값을 비워주고 새롭게 받아온 배열을 보여주기 위해
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const $li = document.createElement("li");
    $li.innerText = room;
    roomList.append($li);
  });
});
