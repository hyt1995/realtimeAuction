auction 서버에서는 mysqlDB를 사용했습니다.
jwt토큰의 사용으로 amzBackend서버에서 토큰을 받아옵니다.
socket.io 사용으로 상품 경매 사이트에 입장시 실시간 경매가 이루어지는 사이트입니다.
서버 시간을 뿌려주어 시간을 교차될 일이 없습니다.
입찰 버튼을 누르면 모든 참여자들의 시간이 20초로 초기화되며 가격도 1000씩 올라갑니다.
20초 시간이 지나면 현재 가격과 상품 이름 그리고 토큰에 저장된 이름이 저장이 됩니다.
