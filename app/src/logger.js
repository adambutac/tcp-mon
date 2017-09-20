const Netstat = require('node-netstat');
const fs = require('fs');

class Logger {
  constructor(mtc, rr) {
    const maxTomcatConnections = mtc;
    const refreshRate = rr;
    let today = new Date().getDay();
    let logFileWriteStream = fs.createWriteStream(`${new Date().toISOString()}.log`);
  }

  async run() {
    console.log('hello');
    await sleep(1000);
    // let connectionCount = 0;

    // Netstat({
    //   done: async () => {
    //     const backlog = connectionCount > this.maxTomcatConnections ? connectionCount - this.maxTomcatConnections : 0;
    //     const date = new Date();
        
    //     if(today != date.getDay()) {
    //       //create new log file for today
    //       today = date.getDay();
    //       logFileWriteStream.end();
    //       logFileWriteStream = fs.createWriteStream(`${date.toISOString()}.log`);          
    //     } 
    //     //write timestamp, connectionCount, backlog, to disk
    //     logFileWriteStream.write(`${date.toISOString()}, ${connectionCount}, ${backlogCount}`)
    //     await this.sleep(this.refreshRate);
    //     this.run();            
    //   }
    // }, (data) => {
    //   if (data.local.port == this.state.localPort && (data.state == "ESTABLISHED" || data.state == "CLOSE_WAIT")){
    //     connectionCount++;
    //   }
    // });
  }

  sleep(ms) {
    return new Promise((res, rej) => setTimeout(res, ms));
  }
}

const logger = new Logger(5, 10000);
logger.run();