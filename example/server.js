const Node = require('../index');

if (!process.argv[2]) {
  console.log('Usage: server.js x.x.x.x');
  console.log('Where x.x.x.x is the public address of the tracker');
  process.exit(2);
}


// function createLocal(c)
// {
//   let client = new Node();
//   client.bind(); // bind to any port
//   client.connect(c.port, c.host, socket => {
//     console.log('client: socket connected');
//     socket.on('data', data => console.log(`client: received '${data.toString()}'`));
//     socket.on('end', () => {
//       console.log('client: socket disconnected');
//       client.close(); // this is how you terminate node
//     });
//     socket.write('hello');
//   });
// }

const trackerPort = 55500;
let server = new Node(socket => {
  console.log('server: UTP client is connected');
  const address = socket.address();
  socket.on('data', data => {
    const text = data.toString();
    console.log(
      `server: received '${text}' from ${address.address}:${address.port}`
    );

    if (text === 'PING') {
      setTimeout(() => {
        console.log('server: sending PONG...');
        socket.write('PONG');
      }, 3000);
    }
  });
  socket.on('end', () => {
    console.log('server: client disconnected');
    process.exit(1);
  });
});



const onListening = () => {
  console.log('server: UDP socket is ready');

  const udpSocket = server.getUdpSocket();

  console.log(`udpSocket`,udpSocket);
  const onMessage = (msg, rinfo) => {
    const text = msg.toString();
    if (rinfo.address === process.argv[2] && rinfo.port === trackerPort) {

      //after the initial message is received from the broker stop listening.
      udpSocket.removeListener('message', onMessage);
      console.log(`server: tracker responded with ${text}`);

      let client;
      try {
        client = JSON.parse(text);
      } catch (error) {
        console.error(`server: invalid tracker reply: ${error.message}`);
        process.exit(1);
      }

      if (client.address === `127.0.0.1`)
      {
        console.log(`no punch`)
        console.log('server: waiting for the client to connect...');
        // createLocal(client)

      }
      else {
        console.log(
          `server: punching a hole to ${client.address}:${client.port}...`
        );
        server.punch(10, client.port, client.address, success => {
          console.log(
            `server: punching result: ${success ? 'success' : 'failure'}`
          );
          if (!success) process.exit(1);
          console.log('server: waiting for the client to connect...');
        });
      }

    }
  };

  udpSocket.on('message', onMessage);
  udpSocket.send(
    JSON.stringify({ name: 'SERVER' }),
    trackerPort,
    process.argv[2],
    () => console.log('server: registered with the tracker')
  );
};

// server.bind(55501);
server.bind(5501, '0.0.0.0'); // bind to port 20000

server.listen(onListening);
