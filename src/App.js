import React, { Component } from 'react'
import FreeelioContract from '../build/contracts/Freeelio.json'

import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'
// API
// import {getDonationBoxes} from "./utils/solshareApi";

// Metering
import Metering from "./utils/metering"
// Registration
import Register from "./utils/register"
// Launch Project
import NewProject from "./utils/newProject"
// Donate to Project
// import Donate from "./utils/donate"

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
      web3: null,
      selectedView: ''
    }

    this.handleInputChange = this.handleInputChange.bind(this)
    this.fundProject = this.fundProject.bind(this)
    this.createContract = this.createContract.bind(this)
    this.onMenuClick = this.onMenuClick.bind(this)
    this.changeView = this.changeView.bind(this)
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
  //only Freeelio owner addr is allowed at contract level
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

  onMenuClick(event, menuItem) {

    switch(menuItem) {
      case 'Donate':
        this.setState({ selectedView: 'Donate'})

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

    // if (this.state.selectedView === "Donate") {
    //     return  <div className="pure-u-1-1">
    //               <h2>Donate to Project</h2>
    //               <Donate />
    //             </div>
    // }

    if (this.state.selectedView === "Register") {
        return <div className="pure-u-1-1">
                <h2>Register as a Service Provider</h2>
                <Register />
              </div>
    }

    if (this.state.selectedView === "NewProject") {
        return <div className="pure-u-1-1">
                <h2>Create Project</h2>
                <NewProject />
              </div>
    }

  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <div className="pure-menu pure-menu-horizontal">
                <ul className="pure-menu-list">
                    <li className="pure-menu-item">
                        <a href="#" name="Donate" onClick={() => this.onMenuClick(event,'Donate')} className="pure-menu-link">Donate (Patron)</a>
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

          <hr />
          <h2>Browse Project Catalogue</h2>
          <p><a href="#" className="pure-menu-heading pure-menu-link">{this.state.projectCount} projects ongoing</a></p>
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
                    <button className="pure-button pure-button-primary {index}" title="Fund Project"
                            onClick={() => this.fundProject(project.contractAddress, this.state.contribution) }>
                            <i> Give!</i>
                    </button>
                  </div>
                </div>
              )
            })
          }
          <h2>Current Service Provider Data</h2>
          <div className="Metering">
            <Metering />
          </div>

        </main>
      </div>
  )}

}

export default App
