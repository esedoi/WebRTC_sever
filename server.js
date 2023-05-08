const WebSocket = require('websocket');
const http = require('http');

const server = http.createServer((request, response) => {
  // 當收到 HTTP 請求時，我們在這裡不做任何事情。
});

server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});

const wsServer = new WebSocket.server({
  httpServer: server,
});

const connections = new Set();
let connectionCount = 0; // 初始化連接計數器

wsServer.on('request', (request) => {
 
  const connection = request.accept(null, request.origin);
  connections.add(connection);

  connectionCount++; // 增加連接數量
  const isCaller = connectionCount % 2 === 1; // 設置為caller或callee
  connection.sendUTF(JSON.stringify({ type: 'init', isCaller: isCaller }));

  connection.on('message', (message) => {
    console.log('Received Message:', message.utf8Data);
    connections.forEach((client) => {
      if (client !== connection) {
        client.sendUTF(message.utf8Data);
      }
    })
  });

  connection.on('close', (reasonCode, description) => {
    console.log('Client disconnected:', reasonCode, description);
    connections.delete(connection);
    connectionCount--; // 減少連接數量
  });
});