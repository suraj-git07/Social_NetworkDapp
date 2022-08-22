require("babel-register");
require("babel-polyfill");
var HDWalletProvider = require("truffle-hdwallet-provider");
const dotenv = require("dotenv");
dotenv.config();
const MNEMONIC = process.env.variable;
// console.log(process.env.variable);

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          MNEMONIC,
          "https://ropsten.infura.io/v3/6ba9ae463c434179b9977aa954fa8024"
        );
      },
      network_id: 3,
      gas: 4000000, //make sure this gas allocation isn't over 4M, which is the max
    },
  },
  contracts_directory: "./src/contracts/",
  contracts_build_directory: "./src/abis/",
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
