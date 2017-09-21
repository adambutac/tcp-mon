const Netstat = require('node-netstat');
const Timestamp = require('time-stamp');
const fs = require('fs');
const EOL = require('os').EOL;

function main(args) {
  const dir = 'C:/Development/STAR/webapps/ROOT/src/main/webapp/logs/';
  if(!fs.existsSync(dir)) {
    return;
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
          const currentLog = `${dir}${Timestamp('MM-DD-YYYY')}.log`;
          fs.appendFileSync(currentLog, `${Timestamp('MM-DD-YYYY:HH:mm:ss')}, ${connectionCount}, ${backlogCount}${EOL}`);
          console.log(`${currentLog} => ${Timestamp('MM-DD-YYYY:HH:mm:ss')}, ${connectionCount}, ${backlogCount}`);
        }
      }, (data) => {
        if (data.local.port == localPort && (data.state == "ESTABLISHED" || data.state == "CLOSE_WAIT")){
          connectionCount++;
        }
      });
    }, interval);
  }
}

main(process.argv.slice(2));
