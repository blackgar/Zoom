const socket = io();

// 비디오와 오디오 생성해서 커뮤니케이션이 가능하도록 하는 로직

const $myFace = document.getElementById("myFace");
const $muteBtn = document.getElementById("mute");
const $cameraBtn = document.getElementById("camera");
const $cameraSelect = document.getElementById("cameras");
const $call = document.getElementById("call");

$call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras() {
  try {
    // 현재 연결되어 있는 모든 device에 대한 정보를 준다.
    const devices = await navigator.mediaDevices.enumerateDevices();
    // 거기서 videoinput 즉, 카메라만 담는다.
    const cameras = devices.filter((device) => device.kind === "videoinput");
    // 기본 카메라가 선택되어 있게 하기 위해 제일 첫번째 카메라를 기본 카메라로 설정한다.
    const currentCamera = myStream.getVideoTracks()[0];
    // select에 option넣기. deviceId를 이용해서 해당 옵션을 선택하면 그 id를 활용해서 카메라를 변경할 수 있게 해주기 위함.
    cameras.forEach((camera) => {
      const $option = document.createElement("option");
      $option.value = camera.deviceId;
      $option.innerText = camera.label;
      if (currentCamera.label === camera.label) $option.selected = true;
      $cameraSelect.appendChild($option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  // 사용자의 미디어 정보를 가져오기 위해서는 조건이 필요하다. video, audio를 가져올지 말지, 가져올거면 어떤 미디어를 가져올건지.
  const initialConstrains = {
    audio: true,
    // 카메라는 셀카모드가 우선(모바일용)
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    // deviceId가 전달되면 해당 비디오를 연결해준다.
    video: { deviceId },
    // 아래 코드는 이 카메라만 사용하겠다는 부분
    // video: { deviceId: {exact:deviceId} },
  };
  try {
    // getUserMedia는 해당 유저의 카메라 비디오 등 디바이스 정보를 가져올 수 있다.
    myStream = await navigator.mediaDevices.getUserMedia(
      // 초기값 유무에 따른 조건 적용
      deviceId ? cameraConstraints : initialConstrains
    );
    $myFace.srcObject = myStream;
    if (!deviceId) await getCameras();
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  // tracks 속성을 이용해서 오디오 리스트를 받아온 뒤 해당하는 오디오를 음소거/음소거 해제를 할 수 있도록 구현
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    $muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    $muteBtn.innerText = "Mute";
    muted = false;
  }
}
function handleCameraClick() {
  // tracks 속성을 이용해서 비디오 리스트를 받아온 뒤 해당하는 카메라를 껐다 켰다할 수 있도록 구현
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    $cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    $cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia($cameraSelect.value);
}

$muteBtn.addEventListener("click", handleMuteClick);
$cameraBtn.addEventListener("click", handleCameraClick);
$cameraSelect.addEventListener("input", handleCameraChange);

// Welcome Form (방에 들어가는 부분 로직)

const $welcome = document.getElementById("welcome");
const $welcomeForm = $welcome.querySelector("form");

async function initCall() {
  $welcome.hidden = true;
  $call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const $input = $welcome.querySelector("input");
  // 우리가 방에 참가하고 나서 startMedia를 호출하기 때문에 이 때문에 아래에 myPeerConnection이 없다는 에러가 발생한다. 그러므로 방에 참가하기 전에 media정보를 받아오고 나서 방에 참가하는 로직으로 변경하면 문제 해결이 가능하다.
  // socket.emit("join_room", $input.value, initCall);
  await initCall();
  socket.emit("join_room", $input.value);
  roomName = $input.value;
  $input.value = "";
}

$welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket 동작 로직

// 이 코드는 peer A 브라우저(Chrome)에서 작동하고
socket.on("welcome", async () => {
  // realtime session을 만들어서 다른 브라우저가 참가할 수 있도록 초대장을 만드는 것이라고 생각하면 된다. 이 코드는 크롬에서 실행된다.
  // 이 offer로 연결을 만든다.
  const offer = await myPeerConnection.createOffer();
  // console.log(offer);
  // peer A에게 description을 알려주기
  myPeerConnection.setLocalDescription(offer);
  // 어떤 방이 이 offer을 emit할건지, 또 누구한테 이 offer를 보낼지에 대해서 Socket.io(서버)에 알려줘야한다. 그래야 연결 가능
  // 즉 peer A는 offer을 생성하고 peer B는 offer을 받는다.
  console.log("offer 보냅니다~");
  socket.emit("offer", offer, roomName);
});

// 이 코드는 peer B(safari)에서 작동한다. 이 차이점을 이해하고 내부에서 사용되는 setLocalDescription이나 기타 메서드의 작동 방식을 이해해야 한다.
socket.on("offer", async (offer) => {
  console.log("offer 받았습니다~");
  // peer B(safari)에서 실행되는 로직
  // offer을 받아서 Description을 저장한다.
  // 이렇게 하면 myPeerConnection이 없다는 에러가 발생한다.
  // socket.io의 통신속도가 워낙 빨라 myPeerConnection이 생기기 전에 이 코드가 실행된다. 이 문제는 위에 initCall을 해주는 위치를 조절해서 해결 가능.
  myPeerConnection.setRemoteDescription(offer);
  // 이렇게 offer을 받아온 다음 answer을 만들어서 반환해줘야 한다.
  const answer = await myPeerConnection.createAnswer();
  // console.log(answer);
  myPeerConnection.setLocalDescription(answer);
  console.log("answer 보냅니다~");
  socket.emit("answer", answer, roomName);
});

// 이부분은 다시 peer A(Chrome)에서 진행하는 로직
socket.on("answer", (answer) => {
  console.log("answer 받았습니다~");
  myPeerConnection.setRemoteDescription(answer);
});

// RTC 연결 설정 코드
function makeConnection() {
  // peerConnection을 브라우저 사이에 만들기
  myPeerConnection = new RTCPeerConnection();
  // console.log(myStream.getTracks());
  // 양쪽 브라우저의 track을 통해 카메라와 마이크의 데이터 stream을 받아서 연결안에 집어넣기. 아직 연결된게 아니라 각자 브라우저에 환경을 구성한 것.
  // 현재 개발 환경에서는 크롬 브라우저가 peer A, safari가 peer B가 된다.
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

// RTCIceCandidate => Internet Connectivity Establishment(인터넷 연결 생성(ICE), IceCandidate = WebRTC에 필요한 프로토콜을 의미, 멀리 떨어진 장치와 소통할 수 있게 하는 즉, 브라우저끼리 통신할 수 있게)
