const Netstat = require('node-netstat');
const fs = require('fs');

function main(args) {
  if(!fs.statSync('./logs').isDirectory()) {
    fs.mkdirSync('./logs');
  }

  if(args[0] == '-h' || !args[0] || !args[1]) {
    console.log('Usage: node logger <local port> <max connections> [interval]');
  } else {
    let interval = args[2];
    if(!interval) interval = 10000;
    const localPort = args[0];
    const maxTomcatConnections = args[1];

    setInterval(() => {
      let connectionCount = 0;
      
      Netstat({
        done: () => {
          const backlogCount = connectionCount > maxTomcatConnections ? connectionCount - maxTomcatConnections : 0;
          const date = new Date();
          const currentLog = `./logs/${date.toISOString().split('T')[0]}.log`;
          fs.appendFileSync(currentLog, `${date.toISOString()}, ${connectionCount}, ${backlogCount}`);
          console.log(`${currentLog} => ${date.toISOString()}, ${connectionCount}, ${backlogCount}`);
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