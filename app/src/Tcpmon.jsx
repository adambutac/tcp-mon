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

  filter(stats, col, str) {
    const regex = new RegExp(str);
    return stats.filter(row => {
      if(!row[col])  
        return false;
      else 
        return regex.test(row[col]);
    });
  }

  render() {
    const { col, isRunning, regex, stats, stderr, serverPort } = this.state;

    return <div>
      <Menu secondary>
        <Menu.Item name="run" active={isRunning} onClick={() => this.run()} />
        <Menu.Item name="column">
          <Input onChange={e => this.setState({ col: e.target.value })} />
        </Menu.Item>
        <Menu.Item>
          <Input name="regex" onChange={e => this.setState({ regex: e.target.value })} />
        </Menu.Item>
      </Menu>

      <Dimmer inverted active={isRunning}>
        <Loader content="Loading..." />
      </Dimmer>
      <Table striped>
        <Table.Header>
          <Table.Row>
            { this.tableHeaders.map((hdr, index) => <Table.HeaderCell key={index} content={hdr} />)}
          </Table.Row>
        </Table.Header>
        <Table.Body>
        { this.filter(stats, col, regex).map((row, index) => {
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