import React from 'react';
import { Button, Dropdown, Menu, Segment, Table } from 'semantic-ui-react';

import Netstat from 'node-netstat';

class Tcpmon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: [],
      stderr: '',
      serverPort: 10011,
      serverPortConnectionCount: 0,
      isRunning: false,
    }
  }

  run() {
    let stats = [];
    this.setState({ isRunning: true });

    Netstat({
      filter: null,
      watch: false,
      done: () => {
        this.setState({ stats });        
        this.setState({ isRunning: false });
      }
    }, (data) => {
      stats.push(data);
    });
  }

  stop() {
    this.setState({ isRunning: false });
  }

  changeServerPort(serverPort) {
    console.log(serverPort);
    this.setState({ serverPort });
    const { stats } = this.state
    let serverPortConnectionCount = stats.filter(row => {
      return row.local.port == serverPort;
    }).length;

    this.setState({ serverPortConnectionCount });
  }

  getPortOptions() {
    const { stats } = this.state;
    const set = new Set(stats.map(row => {
      return row.local.port;
    }));
    console.log([...set]);
  }

  render() {
    const { stats, stderr, isRunning, serverPort, serverPortConnectionCount } = this.state;
    const portOptions = this.getPortOptions();

    return <div>
      <Button content="run" loading={isRunning} onClick={() => this.run()} />
      <strong> {serverPortConnectionCount} </strong> Established Connections on port 
      <Menu compact>
        <Dropdown scrolling options={portOptions} onChange={e => this.changeServerPort(e.target.value)}/>
      </Menu>
      <Table striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>PID</Table.HeaderCell>            
            <Table.HeaderCell>Protocol</Table.HeaderCell>
            <Table.HeaderCell>Local</Table.HeaderCell>
            <Table.HeaderCell>Local Port</Table.HeaderCell>
            <Table.HeaderCell>Remote</Table.HeaderCell>
            <Table.HeaderCell>Remote Port</Table.HeaderCell>            
            <Table.HeaderCell>State</Table.HeaderCell>
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