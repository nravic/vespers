/* eslint-disable require-jsdoc */

import React, { Component, useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import IPFS from "ipfs";
import Web3  from "web3";
import logo from "./ethereumLogo.png";
import { addresses, abis } from "@project/contracts";
import "./App.css";
import internal from "stream";
import IpfsStorageContract from './contracts/IpfsStorage.json';

export interface appState {
  storageValue: number,
  web3: any,
  accounts: any, 
  contract: any,
}

class App extends Component {
  node: any;
  state: appState;

  constructor(props: any) {
    super(props);
    this.state = { storageValue: 0, web3: null, accounts: null, contract: null }; 
    const web3 = new Web3();
    const accounts = await web3.eth.getAccounts(); 

    const networkId = await web3.eth.net.getId();
    const deployedNetwork = (IpfsStorageContract as any).networks[networkId];
    const instance = new web3.eth.Contract(
      IpfsStorageContract.abi,
      deployedNetwork && deployedNetwork.address,
    );
  }

  const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

const defaultProvider = new ethers.providers.Web3Provider(window.ethereum);
const ipfsContract = new ethers.Contract(
  addresses.ipfs,
  abis.ipfs,
  defaultProvider
);

async function initIpfs() {
  node = await IPFS.create();
  const version = await node.version();
  console.log("IPFS Node Version:", version.version);
}

async function readCurrentUserFile() {
  const result = await ipfsContract.userFiles(
    defaultProvider.getSigner().getAddress()
  );
  console.log({ result });

  return result;
}
  const [ipfsHash, setIpfsHash] = useState("");
  useEffect(() => {
    initIpfs();
    (window as any).ethereum.enable();
  }, []);

  useEffect(() => {
    async function readFile() {
      const file = await readCurrentUserFile();

      if (file !== ZERO_ADDRESS) setIpfsHash(file);
    }
    readFile();
  }, []);

  async function setFile(hash: any) {
    const ipfsWithSigner = ipfsContract.connect(defaultProvider.getSigner());
    const tx = await ipfsWithSigner.setFile(hash);
    console.log({ tx });

    setIpfsHash(hash);
  }

  const uploadFile = useCallback(async (file) => {
    const files = [
      {
        path: file.name + file.path,
        content: file,
      },
    ];

    for await (const result of node.add(files)) {
      await setFile(result.cid.string);
    }
  }, []);

  const onDrop = useCallback(
    (acceptedFiles) => {
      uploadFile(acceptedFiles[0]);
    },
    [uploadFile]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    onDrop,
  });
  
  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <header className="App-header">
          <div {...getRootProps()} style={{cursor: 'pointer'}}>
            <img src={logo} className="App-logo" alt="react-logo" />
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
}
export default App;


