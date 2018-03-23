var Freeelio = artifacts.require("./Freeelio.sol");

module.exports = function(deployer) {
  deployer.then(function() {
    return Freeelio.deployed();
  }).then(function(instance) {
    hub = instance;
    return hub.createProject(9000, "Boost small Bangladeshi Businesses in rural areas", { from: web3.eth.accounts[0], gas: 3000000 });
  })
};
