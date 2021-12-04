import React from "react";
import Home from "./components/home";
import "./App.css";
import Web3 from "web3";
import {
  Web3ReactProvider,
  useWeb3React,
  UnsupportedChainIdError,
} from "@web3-react/core";

function App() {
  return <Home />;
}

export default function NApp() {
  return (
    <Web3ReactProvider
      getLibrary={(provider) => {
        return new Web3(provider);
      }}
    >
      <App />
    </Web3ReactProvider>
  );
}
