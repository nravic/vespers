/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
/* eslint-disable require-jsdoc */

import React, {Component} from 'react';
import {useDropzone} from 'react-dropzone';
import IPFS from 'ipfs';
import Web3 from 'web3';
import {addresses, abis} from '@project/contracts';
import './App.css';
import internal from 'stream';
import IpfsStorageContract from './contracts/IpfsStorage.json';

const getWeb3 = require('./getWeb3');

export interface appState {
	selectedFile: any,
	web3: any,
	accounts: any,
	contract: any,
}

class App extends Component {
	  state = {selectedFile: null, web3: null, accounts: null, contract: null};

	  async componentDidMount() {
	  try {
	    const web3: Web3 = await getWeb3();
	    const accounts = await web3.eth.getAccounts();
	    const networkId = await web3.eth.net.getId();
	    const deployedNetwork = (IpfsStorageContract as any).networks[networkId];

	    const instance = new web3.eth.Contract(
	        (IpfsStorageContract.abi as any), // typings here are ?? TBD
	        deployedNetwork && deployedNetwork.address,
	    );

	    this.setState({web3, accounts, contract: instance});
	  } catch (error) {
		  console.log('Failed to load web3, accounts, or contract.');
	  }
	  }

	  private async initIpfs() {
	  this.node = await IPFS.create();
	  const version = await this.node.version();
	  console.log('IPFS Node Version:', version.version);
	  }

	  private async setFile(hash: any) {
	  const ipfsWithSigner = ipfsContract.connect(defaultProvider.getSigner());
	  const tx = await ipfsWithSigner.setFile(hash);
	  console.log({tx});

	  setIpfsHash(hash);
	  }

	  render() {
	  if (!this.state.web3) {
	    return <div>Loading Web3, accounts, and contract...</div>;
	  }
	  return (
	    <div className="App">
	      <header className="App-header">
	        <div {...getRootProps()} style={{cursor: 'pointer'}}>
	          <img src={} className="App-logo" alt="react-logo" />
	          <input {...getInputProps()} />
	          {isDragActive ? (
							<p>Drop the files here ...</p>
						) : (
							<p>
								Drag and drop some files here to upload to IPFS (or click the
								logo)
							</p>
						)}
	        </div>
	        <div>
	          {ipfsHash !== '' ? (
							<a
							  href={`https://ipfs.io/ipfs/${ipfsHash}`}
							  target="_blank"
							  rel="noopener noreferrer"
							>
								See current user file
							</a>
						) : (
							'No user file set yet'
						)}
	        </div>
	      </header>
	    </div>
	  );
	  }
}
export default App;


