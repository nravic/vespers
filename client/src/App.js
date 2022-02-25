/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-tabs */
/* eslint-disable require-jsdoc */

import React, {useCallback, useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import IPFS from 'ipfs';
import IpfsStorageContract from './contracts/IpfsStorage.json';
import logo from './ethereumLogo.png';

import './App.css';
const getWeb3 = require('./getWeb3');
const ZERO_ADDRESS =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

let node;
let web3;
let ipfsContract;

async function initIpfs() {
  node = await IPFS.create();
  const version = await node.version();
  console.log('IPFS Node Version:', version.version);
}

async function initWeb3() {
  web3 = await getWeb3();
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = IpfsStorageContract.networks[networkId];
  ipfsContract = new web3.eth.Contract(
      IpfsStorageContract.abi,
      deployedNetwork && deployedNetwork.address,
  );
}

async function readCurrentUserFile() {
  const result = await ipfsContract.userFiles(
      defaultProvider.getSigner().getAddress(),
  );
  console.log({result});

  return result;
}

function App() {
  const [ipfsHash, setIpfsHash] = useState('');
  useEffect(() => {
	  initIpfs();
	  initWeb3();
  }, []);

  useEffect(() => {
    async function readFile() {
      const file = await readCurrentUserFile();

      if (file !== ZERO_ADDRESS) setIpfsHash(file);
    }
    readFile();
  }, []);

  async function setFile(hash) {
    const ipfsWithSigner = ipfsContract.connect(web3.getSigner());
    const tx = await ipfsWithSigner.setFile(hash);
    console.log({tx});

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
      [uploadFile],
  );
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    multiple: false,
    onDrop,
  });

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

export default App;
