import React from 'react';
import _ from 'underscore';
import { Button, Menu, Search, Segment, Table } from 'semantic-ui-react';

import Netstat from 'node-netstat';

class Tcpmon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: [],
      portOptions: [],
      stderr: '',
      serverPort: '',
      serverPortConnectionCount: 0,
      isRunning: false,
    }
  }

  run() {
    let stats = [];
    let portOptions = [];
    this.setState({ isRunning: true });

    Netstat({
      filter: null,
      watch: false,
      done: () => {
        this.setState({ stats });        
        this.setState({ isRunning: false });
        this.setState({ portOptions })
      }
    }, (data) => {
      /* map by local port */
      const { port } = data.local;
      if(!stats[port]){
        portOptions.push({
          key:port,
          value: port,
          text: port });
        stats[port] = data;
        stats[port].count = 0;
      }
      stats[port].count++;
    });
  }

  stop() {
    this.setState({ isRunning: false });
  }

  filter(col, regex) {
    stats.filter(row => {
      if(!row[col])  
        return false;
      else 
        return /regex/i.test(row[col]);
    })
  }

  render() {
    const { isLoading, stats, stderr, isRunning, serverPort, serverPortConnectionCount, portOptions } = this.state;

    return <div>
      <Button content="run" loading={isRunning} onClick={() => this.run()} />
      <strong> {serverPortConnectionCount} </strong> Established Connections on port 

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