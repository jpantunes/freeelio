var Freeelio = artifacts.require("./Freeelio.sol");

module.exports = function(deployer) {
  deployer.then(function() {
    return Freeelio.deployed();
  }).then(function(instance) {
    hub = instance;
    return hub.createProject(9000, "Boost small Bangladeshi Businesses in rural areas", { from: web3.eth.accounts[0], gas: 3000000 });
  }).then(txObject => {
    const eventArgs = txObject.logs[0].args;
    projectAddr = eventArgs._projectAddr;
    return hub.addProvider(projectAddr, web3.eth.accounts[0], "Solshare", "Solshare Bangladesh", "http://test.com/", "http://test.com/api/", { from: web3.eth.accounts[0], gas: 3000000 });
  }).then(txObject => {
    const eventArgs = txObject.logs[0].args;
    projectAddr = eventArgs._projectAddr;
    providerAddr = eventArgs._providerAddr;
    return hub.addProjectReading(projectAddr, providerAddr, [[1,1,1,1,1],[2,2,2,2,2]], { from: web3.eth.accounts[0], gas: 3000000 });
  })
};
