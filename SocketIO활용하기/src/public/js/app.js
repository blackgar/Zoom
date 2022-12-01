// io 함수가 알아서 socket.io를 실행하고 있는 서버를 탐색한다.
const socket = io();

const $welcome = document.getElementById("welcome");
const $form = $welcome.querySelector("form");

function handleRoomSubmit(event) {
  event.preventDefault();
  const $input = $form.querySelector("input");
  // socket.io의 경우 send가 아닌 emit으로 메시지를 전달하는데 메시지만 보내는 것이 아니라 첫 번째 인자로 특정 이벤트("enter_room")를 지정해서 보내고 두 번째 인자로 전달할 메시지 내용을 넘겨준다. 이 때 object타입도 그냥 전달할 수 있다. 그리고 세 번째 인자로 server에서 실행할 callback함수를 지정해서 전달할 수 있다.
  socket.emit("enter_room", { payload: $input.value }, () => {
    console.log("서버에서 해당 메시지를 받아 작업 수행을 완료했습니다.");
  });
  $input.value = "";
}

$form.addEventListener("submit", handleRoomSubmit);
