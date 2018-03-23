import React, { Component } from 'react'
import FreeelioContract from '../build/contracts/Freeelio.json'

import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'
// API
import {getDonationBoxes} from "./utils/solshareApi";
//https://github.com/glittershark/reactable
import {Table} from 'reactable'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      projectList: [],
      projectCount: '',
      projectAddr: '',
      projectOwner: '',
      projectName: '',
      pledgedAmount: '',
      contribution: '',
      hubAddr: '',
      web3: null,
      selectedView: 'Default',
      providerAddr: '',
      name: '',
      description: '',
      imageUrl: '',
      apiURI: ''
    }

    this.handleInputChange = this.handleInputChange.bind(this)
    this.fundProject = this.fundProject.bind(this)
    this.createContract = this.createContract.bind(this)
    this.onMenuClick = this.onMenuClick.bind(this)
    this.changeView = this.changeView.bind(this)
    this.addProvider = this.addProvider.bind(this)
  }

  componentWillMount() {

    // API
    // getDonationBoxes(function (response) {
    //   console.log(response);
    // });

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
      let projectLog = HubInstance.NewProjectLog({}, {fromBlock: 0, toBlock: 'latest'})
      console.log(HubInstance.address)
      projectLog.get((error, logs) => {
        logs.forEach(log =>
          this.state.projectList.push({
            projectOwner: log.args._projectOwner,
            projectName: this.state.web3.toAscii(log.args._projectName),
            pledgedAmount: log.args._pledgedAmount.toNumber(),
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
  //only Freeelio owner addr is allowed at contract level
  createContract(pledgedAmount, projectName) {

    const contract = require('truffle-contract')
    const freeelioHub = contract(FreeelioContract)
    freeelioHub.setProvider(this.state.web3.currentProvider)

    freeelioHub.deployed().then((instance) => {
      let hub = instance
      //this needs changing must be authenticated user
      return hub.createProject(
              pledgedAmount,
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

  addProvider(
      projectAddr,
      providerAddr,
      name,
      description,
      imageUrl,
      apiURI)
  {
    const contract = require('truffle-contract')
    const freeelioHub = contract(FreeelioContract)
    freeelioHub.setProvider(this.state.web3.currentProvider)

    freeelioHub.deployed().then((instance) => {
      let hub = instance
      //this needs changing must be authenticated user
      return hub.addProvider(
        projectAddr,
        providerAddr,
        name,
        description,
        imageUrl,
        apiURI,
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

  //addProjectReading
  addProjectReading(
      projectAddr,
      providerAddr,
      reading)
  {
    const contract = require('truffle-contract')
    const freeelioHub = contract(FreeelioContract)
    freeelioHub.setProvider(this.state.web3.currentProvider)

    freeelioHub.deployed().then((instance) => {
      let hub = instance
      //this needs changing must be authenticated user
      return hub.addProjectReading(
        projectAddr,
        providerAddr,
        reading,
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
  //load solshareApi

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

  onMenuClick(event, menuItem) {

    switch(menuItem) {
      case 'Default':
        this.setState({ selectedView: 'Default'})

        break;
      case 'Register':
        this.setState({ selectedView: 'Register'})

        break;
      case 'NewProject':
        this.setState({ selectedView: 'NewProject'})

        break;
    }
    console.log(menuItem)
    console.log(this.state.selectedView)
  }

  changeView() {

    if (this.state.selectedView === 'Register') {
      return <div className="pure-u-1-1">
        <h2>Register as a Service Provider</h2>
        <form className="pure-form pure-form-aligned">
          <fieldset>
              <div className="pure-control-group">
                <label htmlFor="projectAddr">Project Address</label>
                <input className="pure-input-1-2" id="projectAddr" type="text" placeholder="0x0decafe"
                  name="projectAddr" value={this.state.projectAddr} onChange={this.handleInputChange} />
              </div>

              <div className="pure-control-group">
                <label htmlFor="providerAddr">Provider Provider Address</label>
                <input className="pure-input-1-2" id="providerAddr" type="text" placeholder="0x0cafe"
                  name="providerAddr" value={this.state.providerAddr} onChange={this.handleInputChange} />
              </div>

              <div className="pure-control-group">
                <label htmlFor="name">Service Provider Name</label>
                <input className="pure-input-1-2" id="name" type="text" placeholder="Solshare"
                  name="name" value={this.state.name} onChange={this.handleInputChange} />
              </div>

              <div className="pure-control-group">
                <label htmlFor="description">Service Description</label>
                <input className="pure-input-2-3" id="description" type="text" placeholder="Enter something here..."
                  name="description" value={this.state.description} onChange={this.handleInputChange} />
              </div>

              <div className="pure-control-group">
                <label htmlFor="imageUrl">Corporate URL</label>
                <input className="pure-input-1-2" id="imageUrl" type="text" placeholder="Enter your website here..."
                  name="imageUrl" value={this.state.imageUrl} onChange={this.handleInputChange} />
              </div>

              <div className="pure-control-group">
                <label htmlFor="apiURI">API URI</label>
                <input className="pure-input-1-2" id="apiURI" type="text" placeholder="Enter your website here..."
                  name="apiURI" value={this.state.apiURI} onChange={this.handleInputChange} />
              </div>

              <div className="pure-controls">
                <button type="submit" className="pure-button pure-button-primary" title="Add Provider"
                  onClick={() => this.addProvider( this.state.projectAddr,
                                  this.state.providerAddr,
                                  this.state.name,
                                  this.state.description,
                                  this.state.imageUrl,
                                  this.state.apiURI)} >
                  Submit
                </button>
              </div>
            </fieldset>
        </form>
      </div>
    }

    if (this.state.selectedView === 'NewProject') {
        return <div className="pure-u-1-1">
                <h2>Create Project</h2>
                <form className="pure-form pure-form-aligned">
                  <fieldset>
                    <div className="pure-control-group">
                        <label htmlFor="projectName">Project Name</label>
                        <input className="pure-input-2-3" id="projectName" type="text" placeholder="0x0cafe"
                            name="projectName" value={this.state.projectName} onChange={this.handleInputChange} />
                    </div>

                    <div className="pure-control-group">
                        <label htmlFor="pledgedAmount">Estimated Funding Target</label>
                        <input id="pledgedAmount" type="text" placeholder="0x0decafe"
                            name="pledgedAmount" value={this.state.pledgedAmount} onChange={this.handleInputChange} />
                    </div>

                    <div className="pure-controls">
                        <button type="submit" className="pure-button pure-button-primary" title="Create Contract"
                            onClick={() => this.createContract(this.state.pledgedAmount, this.state.projectName) } >
                            Submit
                        </button>

                    </div>
                  </fieldset>
              </form>
            </div>
    }

    if (this.state.selectedView === 'Default') {
      return <div className="pure-u-1-1">
              <p> <a href="#" className="pure-menu-heading pure-menu-link">
                "There are currently {this.state.projectCount} eligible small businesses in the Service area of our Providers"</a></p>
              {
                this.state.projectList.map((project, index) => {
                  return (
                    <div className="projectListing" key={index}>
                      <div className="projectList">
                        <h3><p>Project Name: {project.projectName}</p></h3>
                        <p><b>Project Contract Address:</b> {project.contractAddress}</p>
                        <p><b>Pledged Amount:</b> {project.pledgedAmount} Euros</p>
                      </div>
                      <div className="Button">
                        <b>Make a contribution in Ether:</b> <input type="text" name="contribution" value={this.state.contribution}
                                onChange={this.handleInputChange} style={{width: 100}} /> {'     '}
                        <button className="pure-button pure-button-primary {index}" title="Fund Project"
                                onClick={() => this.fundProject(project.contractAddress, this.state.contribution) }>
                                <i> Give!</i>
                        </button>

                        <div className="Button">
                          <button className="pure-button pure-button-primary {index}" title="Load Metering Data"
                                  onClick={() => this.fundProject(project.contractAddress, this.state.contribution) }>
                                  Load tbd
                          </button>
                        </div>

                      </div>
                    </div>
                  )
                })
              }

              <div className="providerDetails">
              <hr />
              <h2>Service Provider Data</h2>
                <h3><p>Provider Name: {this.state.projectName}</p></h3>
                <p><b>Provider Website:</b> {this.state.contractAddress}</p>
                <p><b>Total Energy Bought:</b> {this.state.totalBoughtTk} Taka</p>
                <p><b>Total Energy Recharged:</b> {this.state.totalRechargeAmountTk} Taka</p>
              </div>
              <div className="Metering">
                  <Table className="pure-table" data={
                    [
                    { "Solbox Id": 1, "Grid Id": 10, "Thirthy Day Comsumption": 10000, "Thirthy Day Expense": '100 Eur', "Recharge Amount Allocated": '99 Eur' },
                    { "Solbox Id": 2, "Grid Id": 10, "Thirthy Day Comsumption": 10000, "Thirthy Day Expense": '100 Eur', "Recharge Amount Allocated": '99 Eur' },
                    ]
                } />
              </div>

              <div className="Button">
                <button className="pure-button pure-button-primary {index}" title="Submit Metering Data"
                        onClick={() => this.addProjectReading(this.state.contractAddress, this.state.providerAddr, [[1,1,1,1,1],[2,2,2,2,2]]) }>
                        Submit
                </button>
              </div>

            </ div>

    }

  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <div className="pure-menu pure-menu-horizontal">
                <ul className="pure-menu-list">
                    <li className="pure-menu-item">
                        <a href="#" name="Donate" onClick={() => this.onMenuClick(event,'Default')} className="pure-menu-link">Default (Patron)</a>
                    </li>
                    <li className="pure-menu-item">
                        <a href="#" name="Register" onClick={() => this.onMenuClick(event,'Register')} className="pure-menu-link">Register (Provider)</a>
                    </li>
                    <li className="pure-menu-item">
                        <a href="#" name="NewProject" onClick={() => this.onMenuClick(event,'NewProject')} className="pure-menu-link">New Project (Freeelio)</a>
                    </li>
                </ul>
            </div>

        </nav>

        <main className="container">
          <h1>Freeelio</h1>

            <div className="pure-u-1-1">
                {this.changeView()}
            </div>

        </main>
      </div>
  )}

}

export default App
