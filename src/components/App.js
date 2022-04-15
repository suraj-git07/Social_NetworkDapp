import React, { Component } from "react";
import Web3 from "web3";
// import Identicon from "identicon.js";

import "./App.css";
import SocialNetwork from "../abis/SocialNetwork.json"; //use abi and address to talk with our smartContract

import Navbar from "./Navbar";
import Main from "./Main";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum); //Web3 is a constructor func and making a instance using provider
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;

    //load account

    const accounts = await web3.eth.getAccounts();
    // console.log(accounts);
    this.setState({ account: accounts[0] }); //first acc with which we are connected with Metamsk

    //Netwrok ID
    const networkId = await web3.eth.net.getId();
    const networkData = SocialNetwork.networks[networkId];
    if (networkData) {
      const socialNetwork = web3.eth.Contract(
        SocialNetwork.abi,
        networkData.address
      );
      this.setState({ socialNetwork }); //when key and value have same name can use just one
      const postCount = await socialNetwork.methods.postCount().call(); // .call()  is req to call
      this.setState({ postCount });
      console.log(postCount);

      //Load posts
      for (var i = 1; i <= postCount; i++) {
        const post = await socialNetwork.methods.posts(i).call();
        this.setState({
          posts: [...this.state.posts, post],
        });
      }
      //Sort the Posts(Highest Tipped First)
      this.setState({
        posts: this.state.posts.sort((a, b) => b.tipAmount - a.tipAmount),
      });

      this.setState({ loading: false });
    } else {
      window.alert("SocialNetwork contract not deployed to detected network");
    }
  }

  createPost(content) {
    this.setState({ loading: true });
    this.state.socialNetwork.methods
      .createPost(content)
      .send({ from: this.state.account })
      .once("receipt", (receipt) => {
        //callback func
        this.setState({ loading: false });
      });
  }

  tipPost(id, tipAmount) {
    this.setState({ loading: true });
    this.state.socialNetwork.methods
      .tipPost(id)
      .send({ from: this.state.account, value: tipAmount })
      .once("receipt", (receipt) => {
        this.setState({ loading: false });
      });
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      socialNetwork: null,
      postCount: 0,
      posts: [],
      loading: true,
    };
    this.createPost = this.createPost.bind(this);
    this.tipPost = this.tipPost.bind(this);
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        {this.state.loading ? (
          <div id="loader" className="text-center mt-5">
            <p>Loading....</p>
          </div>
        ) : (
          <Main // also sending the func we require in our Main
            createPost={this.createPost}
            tipPost={this.tipPost}
            posts={this.state.posts}
          />
        )}
      </div>
    );
  }
}

export default App;
