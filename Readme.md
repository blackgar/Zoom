# Zoom 클론코딩

## 학습 목표

- WebSocket과 WebRTC 그리고 SocketIO를 직접 활용해보면서 각 기술의 개념과 사용 목적 그리고 차이점에 대해서 이해하고자 클론 코딩을 진행합니다.
- 직접 채팅방, 화상채팅 그리고 개인 메시지 기능을 구현해보면서 어떻게 위 세가지 기술들이 작동하는지에 대해서 이해하고자 합니다.

## WebSocket vs Socket.io

### WebSocket

- HTML5 웹 표준 기술로 양방향 소통을 위한 프로토콜
- 매우 빠른 동작과 통신할 때 훨씬 적은 데이터를 사용
- 빠른 대신 이벤트를 감지하고 이벤트를 보내는 기능만 가능
- 이벤트를 주고 받을 때의 인자로 문자열만 가능(객체를 보내고 싶다면 JSON.stringify()와 JSON.parse()메서드를 활용해서 변환해서 보내고 변환해서 사용해야 한다.)

### Socket.io

- 웹 표준 기술인 WebSocket을 활용한 라이브러리
- 소켓 연결 실패 시 Reconnect를 시도하는 기능을 포함해 다양한 기능들을 제공
- 방 개념을 통해 방을 생성하고 이에 참여하는 일부 클라이언트 즉 일부 Socket에게만 데이터를 전송하는 브로드캐스팅이 가능하다.
- 인자로 객체, 문자열, 숫자 등 다양한 타입의 데이터를 변환 없이 인자로 전달이 가능하고 callback 함수도 전달이 가능하다.(이 때의 callback 함수는 server에서 front에서 동작할 함수 스위치를 눌러주는 역할을 한다. 즉 프론트에서 동작할 함수를 특정 이벤트 처리 이후 실행시켜 준다.)

### 언제 WebSocket과 Socket.io를 사용해야 하는가?

- 개인적인 생각으로 다양한 데이터를 주고 받아야 하고 여러 클라이언트들에 대한 관리가 정교하게 이루어져야 하는 경우에는 socket.io를 쓰는게 좋다고 생각합니다. 왜냐하면, WebSocket의 경우 단순히 메시지만 주고 받을 수 있기 때문에 다양한 타입의 데이터를 주고 받기도 어렵고 다양한 기능을 제공하기에 제한사항이 많다고 생각합니다. 그렇기 때문에 다양한 기능들을 제공해야 하는 경우에는 socket.io를 통해 UX를 많이 개선할 수 있을거라 생각합니다.
- 반면에, WebSocket은 데이터의 전송이 빨라야 하고 방대한 양의 데이터를 주고받을 때 활용될 수 있다고 생각합니다. 예를 들면 트레이딩 시스템의 경우 빠르게 거래에 대한 처리가 이루어져야 하기 때문에 이러한 처리에는 속도가 중요하기 때문에 상대적으로 가볍고 빠른 WebSocket을 사용할 것으로 생각됩니다.

## WebRTC(Web Real-Time Communication)

- 웹과 앱에서 추가적인 설치나 소프트웨어 없이 카메라와 마이크 등의 미디어 정보를 활용해 실시간 커뮤니케이션이 가능하도록 해주는 기술
- Peer to Peer 방식으로 피어끼리 데이터 전송
- Peer to Peer 방식으로 통신하기 위해서 STUN/TURN 서버 필요
- Peer to Peer 데이터를 주고 받는 과정
  - Peer A에서 방을 생성할 때 getUserMedia()를 통해 미디어 정보를 받아오고, RTCPeerConnection()을 통해 Peer끼리의 연결이 가능한 환경을 만들고, addStream()을 통해 현재 사용하는 미디어 정보로 카메라와 오디오 세팅을 한다.
  - 이 과정을 거쳐 offer을 Peer B에게 보내는데 이 때 setLocalDescription()으로 offer을 peer A에게 description을 알려줍니다. Peer B는 offer을 받고 setRemoteDescription으로 offer내용을 담아두고 마찬가지로 미디어 정보를 받아온다음 createAnswer()을 통해 answer값을 생성합니다. 이를 setLocalDescription으로 담아두고 peer A에게 answer을 전송합니다.
  - 이를 받은 peer A가 setRemoteDescription에 answer 내용을 담아두고 ice(Internet Connectivity Establishment)candidate() 과정을 통해 peer B에게 서로 통신할 수 있는 프로토콜과 라우팅 후보군을 선택하자는 요청을 보내고 이에 peer B가 이에 동의를 하게 되면 동의한다는 요청을 peer A로 보내 최종적으로 현재 사용하는 미디어와 카메라가 서로에게 보여지는 상태가 됩니다.
- WebRTC 구현 방식 3가지

  - Mesh(Signaling) 서버

    - 1:1 관계를 유지하는데 적합한 서버 방식.
    - 처음 WebRTC가 peer간 정보를 중계할 때만 서버에 부하가 발생하고 연결 이후에는 별도의 서버 사용이 없기에 서버 자원이 적게 들고, 직접 연결을 통한 데이터 송수신으로 실시간 통신에 유리하다는 장점이 있습니다.
    - 하지만, N:N이나 N:M으로 참여 클라이언트가 많아질수록 과부하가 급격하게 증가한다. 왜냐하면 모든 클라이언트의 데이터를 다운로드(N+M-1회)해야 되고 내 정보를 모든 클라이언트에게 업로드(N+M-1회)해줘야 하기 때문입니다. 5명이 참가했다고 예를 들면 1 클라이언트당 8개의 연결을 유지하고 있어야 한다는 단점이 있습니다.

  - SFU(Selective Forwarding Unit) 서버

    - 클라이언트 간 미디어 트래픽을 중앙 서버에서 중계하는 방식
    - peer간 연결이 아닌 서버와 클라이언트 간의 peer을 연결하여 모든 클라이언트에게 데이터를 보낼 필요 없이 서버에만 영상 데이터를 보내면 됩니다. 업로드(1회). 즉, 클라이언트가 받는 부하가 줄어들고 Mesh 서버보다는 느리지만 비슷한 수준의 실시간성을 효율적으로 제공해줄 수 있다는 장점이 있습니다.
    - 하지만, 다운로드의 경우에는 연결되어 있는 peer 개수만큼 유지를 해야된다는 차이점이 있습니다. 이로 인해서 Mesh 서버보다는 서버 비용이 증가하고 참여 클라이언트가 많아지면 클라이언트가 많은 부하를 부담해야 하는 단점이 있습니다.

  - MCU(Multi-point Control Unit) 서버
    - 중앙 서버에서 클라이언트의 송출 미디어를 받아 클라이언트에게 전달하는 방식
    - 업로드 1회, 다운로드 1회만 진행하면 되기에 클라이언트의 부하가 현저하게 감소하고 많은 클라이언트를 감당할 수 있다는 장점이 있습니다.
    - 하지만, WebRTC의 핵심인 실시간성을 저해할 수 있고 서버에서 미디어 정보를 받아 결합해서 전달하는 과정에서 많은 비용이 발생한다는 단점이 있습니다.

## 회고

WebSocket, Socket.io 그리고 WebRTC 모두 현재 진행하는 프로젝트 상황이나 성격에 따라 사용해야할 기술이 달라진다는 것을 깨달았습니다. 이용하는 유저가 많거나 주고받아야 할 데이터가 방대하다면 그만큼 가볍고 빠른 기술을 이용해야 하고 실시간성과 같은 UX가 중요할 때는 빠르게 데이터를 주고받을 수 있는 WebSocket이나 WebRTC(Mesh 서버) 기술을 사용해야 합니다. 결국 설계하는 과정에서 현재 프로젝트 방향성과 목표를 정확하게 설정하고 그에 필요한 기술을 선택해서 개발하면서 필요한 부분들을 빠르게 개발하는 것이 중요하다는 것을 깨달았습니다.
