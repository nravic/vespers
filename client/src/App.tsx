/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
/* eslint-disable require-jsdoc */

import React, {Component} from 'react';
import * as IPFS from 'ipfs-core';
import Web3 from 'web3';
import './App.css';
import IpfsStorageContract from './contracts/IpfsStorage.json';

import getWeb3 from './getWeb3';
export interface appState {
  selectedFile: any;
  web3: any;
  accounts: any;
  contract: any;
}

class App extends Component {
  node: any;
  state = {
    selectedFile: null,
    web3: null,
    accounts: null,
    contract: null,
    ipfsHash: null,
  };

  async componentDidMount() {
    try {
      const web3: Web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = (IpfsStorageContract as any).networks[networkId];

      const instance = new web3.eth.Contract(
        IpfsStorageContract.abi as any, // typings here are ?? TBD
        deployedNetwork && deployedNetwork.address,
      );

	  await this.initIpfs();

      this.setState(
		  {web3, accounts, contract: instance, ipfsState: null});
    } catch (error) {
      console.log('Failed to load web3, accounts, contract, or ipfs node.');
    }
  }

  private async initIpfs() {
    this.node = await IPFS.create();
    const version = await this.node.version();
    console.log('IPFS Node Version:', version.version);
  }

  private onFileChange(event: any) {
    this.setState({selectedFile: event.target.files[0]});
  }

  private async onFileUpload() {
	  const formData = new FormData();
	  formData.append('myfile', this.state.selectedFile!);

	  const ipfsHash = await this.node.add(
		  {
          path: (this.state.selectedFile as any).name,
		  content: this.state.selectedFile,
        });

    this.setState({ipfsHash});

    await (this.state.contract as any).methods.setFile();
  }

  private fileData() {
    if (this.state.selectedFile) {
	  return (
        <div>
		  <h2>File Details:</h2>

          <p>IPFS Hash: {this.state.ipfsHash}</p>

        </div>
	  );
    } else {
	  return (
        <div>
		  <br />
		  <h4>Upload a file</h4>
        </div>
	  );
    }
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div>
        <h1>
			Vespers
        </h1>
        <h3>
		  Blast file all over twitter.
        </h3>
        <div>
          <input type="file" onChange={this.onFileChange} />
          <button onClick={this.onFileUpload}>
			  Upload!
          </button>
        </div>
	  {this.fileData()}
      </div>
    );
  }
}

export default App;
