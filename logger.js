const Netstat = require('node-netstat');
const fs = require('fs');

function main(args) {
  if(args[0] == '-h' || !args[0] || !args[1]) {
    console.log('Usage: node logger <port> <max connections> [interval]');
  } else {
    const interval = args[2];
    if(!interval) interval = 10000;
    setInterval(() => {
      let connectionCount = 0;
      
      Netstat({
        done: () => {
          const backlog = connectionCount > maxTomcatConnections ? connectionCount - maxTomcatConnections : 0;
          const date = new Date();
          const currentLog = `./logs/${date.toISOString().split('T')[0]}.log`;
          fs.appendFileSync(currentLog, `${date.toISOString()}, ${connectionCount}, ${backlogCount}`);
        }
      }, (data) => {
        if (data.local.port == localPort && (data.state == "ESTABLISHED" || data.state == "CLOSE_WAIT")){
          connectionCount++;
        }
      });
    }, interval)
  }
}

main(process.argv.slice(2));