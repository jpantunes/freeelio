import React, { Component } from 'react'
import FreeelioContract from '../build/contracts/Freeelio.json'

import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      projectList: [],
      projectCount: '',
      projectAddr: '',
      providerAddr: '',
      projectName: '',
      activatedAmount: '',
      contribution: '',
      hubAddr: '',
      web3: null
    }

    this.handleInputChange = this.handleInputChange.bind(this)
    this.fundProject = this.fundProject.bind(this)
    this.createContract = this.createContract.bind(this)
  }

  componentWillMount() {

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    const contract = require('truffle-contract')
    const freeelioHub = contract(FreeelioContract)
    freeelioHub.setProvider(this.state.web3.currentProvider)

    freeelioHub.deployed().then((instance) => {

      let HubInstance = instance;
      let projectLog = HubInstance.ProjectLog({}, {fromBlock: 0, toBlock: 'latest'})
      console.log(HubInstance.address)
      projectLog.get((error, logs) => {
        logs.forEach(log =>
          this.state.projectList.push({
            providerAddr: log.args._projectOwner,
            projectName: this.state.web3.toAscii(log.args._projectName),
            activatedAmount: log.args._activatedAmount.toNumber(),
            contractAddress: log.args._projectAddr
          })
        )
        console.log(logs)
        this.setState({
          projectCount: logs.length
        })
      })
    })
  }
//this should be restricted to on-boarded providers authenticated with their eth-addr
  createContract(activatedAmount, projectName) {

    const contract = require('truffle-contract')
    const freeelioHub = contract(FreeelioContract)
    freeelioHub.setProvider(this.state.web3.currentProvider)

    freeelioHub.deployed().then((instance) => {
      let hub = instance
      //this needs changing must be authenticated user
      return hub.createProject(
              activatedAmount,
              projectName,
              {
                from: this.state.web3.eth.accounts[0],
                gas: 3000000
              }
            ).then(function(err,res) {
                if(err) {
                  console.log(err)
                }
                console.log(res)
            })

    })
    this.instantiateContract()
  }

  fundProject(projectAddr, contribution) {
    console.log(projectAddr, contribution)

    const contract = require('truffle-contract')
    const freeelioHub = contract(FreeelioContract)
    freeelioHub.setProvider(this.state.web3.currentProvider)

    freeelioHub.deployed().then((instance) => {
      let hub = instance
      //this needs changing must be authenticated user
      return hub.contribute(
        projectAddr,
        {
          from: this.state.web3.eth.accounts[0],
          value: this.state.web3.toWei(contribution, "ether"),
          gas: 3000000
        }
      ).then(function(err,res) {
          if(err) {
            console.log(err)
          }
          console.log(res)
      })
    })
  }

  handleInputChange(event) {

    const target = event.target
    const key = target.name
    const value = target.value

    try {
      this.setState({
        [key]: value
      })
    } catch(err) {
      console.log(err)
    }

    console.log(key, value)
  }


  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">{this.state.projectCount} projects created!</a>
        </nav>

        <main className="container">
          <h1>Freeelio</h1>
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h2>Create Project</h2>
              <p><b>Project Name:</b> <input type="text" name="projectName" value={this.state.projectName} onChange={this.handleInputChange} style={{width: 500}} /></p>
              <p><b>Initial Target Amount:</b> <input type="text" name="activatedAmount" value={this.state.activatedAmount} onChange={this.handleInputChange} style={{width: 100}} /></p>
              <div className="Button">
                <button className="Button" title="Create Project"
                        onClick={() => { this.createContract(this.state.activatedAmount, this.state.projectName) }}>
                  <i> Create! </i>
                </button>
              </div>
            </div>
          </div>
          <hr />
          <h2>Browse Project catalogue</h2>
          {
            this.state.projectList.map((project, index) => {
              return (
                <div className="projectListing" key={index}>
                  <div className="projectList">
                    <h3><p>Project Name: {project.projectName}</p></h3>
                    <p><b>Provider Address:</b> {project.providerAddr}</p>
                    <p><b>Initial Target Amount:</b> {project.activatedAmount} Euros</p>
                    <p><b>Contract Address:</b> {project.contractAddress}</p>
                  </div>
                  <div className="Button">
                    <b>Make a contribution in Ether:</b> <input type="text" name="contribution" value={this.state.contribution} onChange={this.handleInputChange} style={{width: 100}} /> {' '}
                    <button className="Button {index}" title="Fund Project"
                            onClick={() => this.fundProject(project.contractAddress, this.state.contribution) }>
                            <i> Give!</i>
                    </button>
                  </div>
                </div>
              )
            })
          }
        </main>
      </div>
  )}

}

export default App
