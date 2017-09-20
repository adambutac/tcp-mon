import React from 'react';
import { Button, Dimmer, Input, Label, Loader, Menu, Popup, Table } from 'semantic-ui-react';

import Netstat from 'node-netstat';

class Tcpmon extends React.Component {
  constructor(props) {
    super(props);

    this.tableHeaders = ['PID', 'Protocol', 'Local Address', 'Local Port', 'Remote Address', 'Remote Port', 'TCP State'];
    this.state = {
      stats: [],
      stderr: '',
      connectionCount: 0,
      backlog: 0,
      maxTomcatConnections: 1,
      refreshRate: 10000,
      isRunning: false,
      localPort: 10011,
    }
  }

  run() {
    let stats = [];

    Netstat({
      watch: false,
      done: async () => {
        const { maxTomcatConnections, refreshRate } = this.state;        
        const connectionCount = stats.length;
        const backlog = connectionCount > this.state.maxTomcatConnections ? connectionCount - this.state.maxTomcatConnections : 0;
        this.setState({ stats });
        this.setState({ connectionCount });
        this.setState({ backlog });
        await this.sleep(refreshRate);
        if(this.state.isRunning) {
          this.run();            
        } 
      }
    }, (data) => {
      if((data.state == "ESTABLISHED" || data.state == "CLOSE_WAIT") && data.local.port == this.state.localPort)
        stats.push(data);
    });
  }

  start() {
    this.setState({ isRunning: true });
    this.run();    
  }

  stop() {
    this.setState({ isRunning: false });
  }

  sleep(ms) {
    return new Promise(res => setTimeout(res, ms))
  }

  render() {
    const { backlog, connectionCount, isRunning, localPort, maxTomcatConnections, refreshRate, stats, stderr } = this.state;
  
    return <div>
      <Menu secondary>
        <Menu.Item name="run" disabled={isRunning} onClick={() => this.start()} />
        <Menu.Item name="stop" disabled={!isRunning} onClick={() => this.stop()} />
        <Popup
          trigger={<Menu.Item >Active connections:&nbsp;<b>{connectionCount}</b></Menu.Item>}
          content="Total number of connections. Includes connections in the ESTABLISHED and CLOSE-WAIT state."/>
        <Popup
          trigger={<Menu.Item >Waiting for a connection:&nbsp;<b>{backlog}</b> </Menu.Item>}
          content="Number of connections in the backlog (acceptCount in tomcat) queue. Simply the difference between Max Connections and Active Connections."/>
      </Menu>
      <Menu secondary>
        <Menu.Item ><Input label="Local Port: " disabled={isRunning} value={localPort} onChange={ e => this.setState({ localPort: e.target.value }) }/> </Menu.Item>                    
        <Menu.Item ><Input label="Max Connections: " disabled={isRunning} value={maxTomcatConnections} onChange={ e => this.setState({ maxTomcatConnections: e.target.value }) }/> </Menu.Item>          
        <Menu.Item ><Input label="Refresh Rate (ms): " disabled={isRunning} value={refreshRate} onChange={ e => this.setState({ refreshRate: e.target.value }) }/> </Menu.Item>          
      </Menu>

      <Table striped>
        <Table.Header>
          <Table.Row>
            { this.tableHeaders.map((hdr, index) => <Table.HeaderCell key={index} content={hdr} />)}
          </Table.Row>
        </Table.Header>
        <Table.Body>
        { stats.map((row, index) => {
          return <Table.Row key={index}>
            <Table.Cell>{row.pid}</Table.Cell>
            <Table.Cell>{row.protocol}</Table.Cell>            
            <Table.Cell>{row.local.address}</Table.Cell>            
            <Table.Cell>{row.local.port}</Table.Cell>            
            <Table.Cell>{row.remote.address}</Table.Cell>            
            <Table.Cell>{row.remote.port}</Table.Cell>            
            <Table.Cell>{row.state}</Table.Cell>
          </Table.Row>            
        })}
        </Table.Body>
      </Table>
    </div>
  }
}

export default Tcpmon;