import React from 'react';
import { Button, Dimmer, Input, Label, Loader, Menu, Table } from 'semantic-ui-react';

import Netstat from 'node-netstat';

/**
 *            TO-DO
 * show dropped connections somehow
 */
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
      filter: {
        local: {
          port: this.state.localPort,
        }
      },
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
      if(data.state == "ESTABLISHED" || data.state == "CLOSE_WAIT" && data.local.port == 10011)
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
      <Menu secondary compact>
        <Menu.Item name="run" disabled={isRunning} onClick={() => this.start()} />
        <Menu.Item name="stop" disabled={!isRunning} onClick={() => this.stop()} />
        <Menu.Item ><Input label="Local Port: " disabled={isRunning} value={localPort} onChange={ e => this.setState({ localPort: e.target.value }) }/> </Menu.Item>                    
        <Menu.Item ><Input label="Max Connections: " disabled={isRunning} value={maxTomcatConnections} onChange={ e => this.setState({ maxTomcatConnections: e.target.value }) }/> </Menu.Item>          
        <Menu.Item ><Input label="Refresh Rate (ms): " disabled={isRunning} value={refreshRate} onChange={ e => this.setState({ refreshRate: e.target.value }) }/> </Menu.Item>          
      </Menu>
      <Menu secondary compact>
        <Menu.Item >Active: {connectionCount}</Menu.Item>
        <Menu.Item >Waiting: {backlog} </Menu.Item>
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