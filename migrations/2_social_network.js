const SocialNetwork = artifacts.require("SocialNetwork");

module.exports = function(deployer, accounts) {
  deployer.deploy(SocialNetwork);
};
