const Netstat = require('node-netstat');
const Timestamp = require('time-stamp');
const Path = require('path');
const fs = require('fs');
const EOL = require('os').EOL;

function main(args) {
  const dir = args[0];
  if(!fs.existsSync(dir)) {
    return;
  }

  if(args[0] == '-h' || !args[0] || !args[1] || !args[2]) {
    console.log('Usage: node logger <output file directory> <local port> <max connections> [interval]');
  } else {
    let interval = args[3];
    if(!interval) interval = 20000;
    const localPort = args[1];
    const maxTomcatConnections = args[2];
    let latest = new Array(120000/interval);

    setInterval(() => {
      let connectionCount = 0;
      
      Netstat({
        done: () => {
          const backlogCount = connectionCount > maxTomcatConnections ? connectionCount - maxTomcatConnections : 0;
          const currentLog = Path.join(dir,`${Timestamp('YYYY-MM-DD')}.log`);
          const line = `${Timestamp('YYYY-MM-DDTHH:mm:ss-10:00')}, ${connectionCount}, ${backlogCount}${EOL}`;
          latest.shift();          
          latest.push(line);
          
          fs.appendFileSync(currentLog, line);
          fs.writeFileSync(Path.join(dir, 'current.log'), latest.join(''));      
          
          console.log(`${currentLog} => ${line}`);
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
