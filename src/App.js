import React, { Component } from 'react'
import FreeelioContract from '../build/contracts/Freeelio.json'

import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'
// API
import {getDonationBoxes} from "./utils/solshareApi";

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
      contribution: [],
      hubAddr: '',
      web3: null,
      selectedView: 'Default',
      providerCount: '',
      providerAddr: '',
      name: '',
      description: '',
      imageUrl: '',
      apiURI: '',
      projectProviderList: [],
      readingList: [],
      meterList: []
    }

    this.handleInputChange = this.handleInputChange.bind(this)
    this.fundProject = this.fundProject.bind(this)
    this.createContract = this.createContract.bind(this)
    this.onMenuClick = this.onMenuClick.bind(this)
    this.changeView = this.changeView.bind(this)
    this.addProvider = this.addProvider.bind(this)
    this.addProjectReading = this.addProjectReading.bind(this)
    // TODO this.loadReadings = this.loadReadings.bind(this)
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
      let projectLog = HubInstance.NewProjectLog({}, {fromBlock: 0, toBlock: 'latest'})
      console.log(HubInstance.address)
      projectLog.get((error, projects) => {
        projects.forEach(proj =>
          this.state.projectList.push({
            projectOwner: proj.args._projectOwner,
            projectName: this.state.web3.toAscii(proj.args._projectName),
            pledgedAmount: proj.args._pledgedAmount.toNumber(),
            contractAddress: proj.args._projectAddr
          })
        )
        console.log(projects)
        this.setState({
          projectCount: projects.length
        })
      })

      let providerLog = HubInstance.NewProviderLog({}, {fromBlock: 0, toBlock: 'latest'})
      providerLog.get((error, providers) => {
        providers.forEach(provider =>
          this.state.projectProviderList.push({
            projectAddr: provider.args._projectAddr,
            providerAddr: provider.args._providerAddr,
            name: this.state.web3.toAscii(provider.args._providerName),
            description: this.state.web3.toAscii(provider.args._description),
            imageUrl: this.state.web3.toAscii(provider.args._imageUrl),
            apiURI: this.state.web3.toAscii(provider.args._apiURI),
          })
        )
        console.log(providers)
        this.setState({
          providerCount: providers.length
        })
      })

      // the idea is to get NewReadingLog and iterate
      let readingLog = HubInstance.NewReadingLog({}, {fromBlock: 0, toBlock: 'latest'})
      readingLog.get((error, meters) => {
        meters.forEach(meter => {
          for (var i = 0; i < meter.args._reading.length; i++) {
            this.state.readingList.push({
              solboxId: meter.args._reading[i][0].toNumber(),
              gridId: meter.args._reading[i][1].toNumber(),
              consumption: meter.args._reading[i][2].toNumber(),
              expense: meter.args._reading[i][3].toNumber(),
              recharge: meter.args._reading[i][4].toNumber()
            })
          }
        })
        // console.log(meters)
      })
    })
  }

  //only Freeelio owner addr is allowed at contract level
  createContract(pledgedAmount, projectName) {
    console.log(pledgedAmount, projectName)

    const contract = require('truffle-contract')
    const freeelioHub = contract(FreeelioContract)
    freeelioHub.setProvider(this.state.web3.currentProvider)

    freeelioHub.deployed().then((instance) => {
      let hub = instance
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
    // window.location.reload()
  }

  fundProject(projectAddr, contribution) {
    console.log(projectAddr, contribution)

    const contract = require('truffle-contract')
    const freeelioHub = contract(FreeelioContract)
    freeelioHub.setProvider(this.state.web3.currentProvider)

    freeelioHub.deployed().then((instance) => {
      let hub = instance
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
    console.log("here")

    const contract = require('truffle-contract')
    const freeelioHub = contract(FreeelioContract)
    freeelioHub.setProvider(this.state.web3.currentProvider)

    freeelioHub.deployed().then((instance) => {
      let hub = instance
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
    // window.location.reload()
  }

  addProjectReading(projectAddr, providerAddr) {
    getDonationBoxes((response) => {
      const contract = require('truffle-contract')
      const freeelioHub = contract(FreeelioContract)
      freeelioHub.setProvider(this.state.web3.currentProvider)
      freeelioHub.deployed().then((instance) => {
        let hub = instance
        return hub.addProjectReading(
          projectAddr,
          providerAddr,
          response,
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
      console.log(response)
    })
    // window.location.reload()
  }

  //TODO loadReadings(projectAddr) {}

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
    console.log(target)
    console.log(key)
    console.log(value)

  }

  onMenuClick(event, menuItem) {

    switch(menuItem) {
      default:
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
      return (
      <div className="pure-u-1-1">
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
            </fieldset>
        </form>
        <div className="pure-controls">
          <button className="pure-button pure-button-primary" title="Add Provider"
            onClick={() => this.addProvider( this.state.projectAddr,
                            this.state.providerAddr,
                            this.state.name,
                            this.state.description,
                            this.state.imageUrl,
                            this.state.apiURI)} >
            Submit
          </button>
        </div>

        <hr />
        <h2>Our Service Providers</h2>
        {
          this.state.projectProviderList.map((provider, index) => {
            return (
              <div className="providerListing" key={index}>
                <div className="providerDetails pure-u-1-1" key={index}>
                  <p><b>Project Address:</b> {provider.projectAddr}</p>
                  <p><b>Provider Name:</b> {provider.name}</p>
                  <p><b>Provider Address:</b> {provider.providerAddr}</p>
                  <p><b>Provider Website:</b> {provider.imageUrl}</p>
                  <p><b>Provider API URI:</b> {provider.apiURI}</p>
                  <p><b>Service Description:</b> {provider.description}</p>
                </div>

                <div className="Button" onChange={this.handleInputChange}>
                  <button className="pure-button pure-button-primary {index}" title="Load Data"
                          onClick={() => this.addProjectReading(provider.projectAddr, provider.providerAddr) }>
                          <i>Load API Data</i>
                  </button>
                </div>
              </div>
            )
          })
        }

      </div>
      )
    }

    if (this.state.selectedView === 'NewProject') {
      return (
        <div className="pure-u-1-1">
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
            </fieldset>
          </form>
          <div className="pure-controls">
            <button className="pure-button pure-button-primary" title="Create Contract"
                onClick={() => this.createContract(this.state.pledgedAmount, this.state.projectName) } >
                Submit
            </button>
          </div>
        </div>
      )
    }

    if (this.state.selectedView === 'Default') {
      return (
        <div className="yadayada">
          <div className="pure-u-1-1">
            {
              this.state.projectList.map((project, index) => {
                return (
                  <div className="projectListing" key={index}>
                    <div className="projectList">
                      <h3><p>Project Name: {project.projectName}</p></h3>
                      <p><b>Project Contract Address:</b> {project.contractAddress}</p>
                      <p><b>Pledged Amount:</b> {project.pledgedAmount} Euros</p>
                      <p><b>Providers Onboarded:</b> {this.state.providerCount}</p>
                    </div>
                    <label htmlFor="contribution"><b>Make a contribution in Ether:</b></label>
                    <input className="pure-input-1-2" id="contribution" type="text"
                      name="contribution" value={this.state.contribution[{index}]} onChange={this.handleInputChange} />
                      <div className="Button">
                        <button className="pure-button pure-button-primary" title="Fund Project"
                                onClick={() => this.fundProject(project.contractAddress, this.state.contribution) }>
                                <i>Give!</i>
                        </button>
                      </div>
                  </div>
                )
              })
            }
          </div>
          <hr />
          <div className="Metering" onChange={this.handleInputChange}>
            <p> <a href="#" className="pure-menu-heading pure-menu-link">
              There are currently {this.state.readingList.length} eligible small businesses in the Service area of our Providers</a></p>
            <table className="pure-table pure-table-bordered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Solbox Id</th>
                  <th>Grid Id</th>
                  <th>Thirty Day Consumption</th>
                  <th>Thirty Day Expense</th>
                  <th>Recharge Amount Allocated</th>
                </tr>
              </thead>
              <tbody>
              {
                this.state.readingList.map((meter, index) => {
                  return (
                    <tr key={index}>
                      <td>{index +1}</td>
                      <td>{meter.solboxId}</td>
                      <td>{meter.gridId}</td>
                      <td>{meter.consumption}</td>
                      <td>{meter.expense}</td>
                      <td>{meter.recharge}</td>
                    </tr>
                  )
                })
              }
              </tbody>
            </table>
          </div>
        </div>
      )
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
