import React from 'react';
import { Button, Dimmer, Input, Loader, Menu, Table } from 'semantic-ui-react';

import Netstat from 'node-netstat';

class Tcpmon extends React.Component {
  constructor(props) {
    super(props);

    this.tableHeaders = ['PID', 'Protocol', 'Local Address', 'Local Port', 'Remote Address', 'Remote Port', 'TCP State'];
    this.state = {
      stats: [],
      stderr: '',
      connectionCount: 0,
      largestConnectionCount: 0,
      backlog: 0,
      largestBacklog: 0,
      maxTomcatConnections: 1,
      isRunning: false,
    }
  }

  reset() {
    this.setState({
      stats: [],
      stderr: '',
      connectionCount: 0,
      largestConnectionCount: 0,
      backlog: 0,
      largestBacklog: 0,
      maxTomcatConnections: 1,
      isRunning: false,
    });
  }

  run() {
    let stats = [];
    this.setState({ isRunning: true });

    Netstat({
      filter: {
        local: {
          port: 10011,
        },
        state: "ESTABLISHED"
      },
      watch: false,
      done: () => {
        const connectionCount = stats.length;
        const backlog = connectionCount > this.state.maxTomcatConnections ? connectionCount - this.state.maxTomcatConnections : 0;
        const largestBacklog = backlog > this.state.largestBacklog ? backlog : this.state.largestBacklog;
        this.setState({ stats });
        this.setState({ connectionCount });
        this.setState({ backlog });
        this.setState({ largestBacklog });
        if(this.state.isRunning) {
          this.run();
        } 
      }
    }, (data) => {
      stats.push(data);
    });
  }

  stop() {
    this.setState({ isRunning: false });
  }

  render() {
    const { backlog, connectionCount, largestBacklog, isRunning, maxTomcatConnections, stats, stderr } = this.state;
  
    return <div>
      <Menu secondary compact>
        <Menu.Item name="run" disabled={isRunning} onClick={() => this.run()} />
        <Menu.Item name="stop" disabled={!isRunning} onClick={() => this.stop()} />
        <Menu.Item name="reset" disabled={isRunning} onClick={() => this.reset()} />
        <Menu.Item >Estab.Connections: {connectionCount} </Menu.Item>
        <Menu.Item >Max Connections: <Input disabled={isRunning} style={{width: "50px"}} value={maxTomcatConnections} onChange={ e => this.setState({ maxTomcatConnections: e.target.value }) }/> </Menu.Item>
        <Menu.Item >Backlog Count: { backlog } </Menu.Item>
        <Menu.Item >Largest Backlog Count: { largestBacklog } </Menu.Item>
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