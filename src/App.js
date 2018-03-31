import React, {Component} from 'react'
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
        console.log('STATE WILL MOUNT');

        getWeb3
            .then(results => {
                results.web3.eth.getTransactionReceiptMined = function getTransactionReceiptMined(txHash, interval) {
                    const self = this;
                    const transactionReceiptAsync = function (resolve, reject) {
                        self.getTransactionReceipt(txHash, (error, receipt) => {
                            if (error) {
                                reject(error);
                            } else if (receipt == null) {
                                setTimeout(
                                    () => transactionReceiptAsync(resolve, reject),
                                    interval ? interval : 500);
                            } else {
                                resolve(receipt);
                            }
                        });
                    };
                    if (Array.isArray(txHash)) {
                        return Promise.all(txHash.map(
                            oneTxHash => self.getTransactionReceiptMined(oneTxHash, interval)));
                    } else if (typeof txHash === "string") {
                        return new Promise(transactionReceiptAsync);
                    } else {
                        throw new Error("Invalid Type: " + txHash);
                    }
                };
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
            let self = this;
            let HubInstance = instance;
            setInterval(function () {
                let projectLog = HubInstance.NewProjectLog({}, {fromBlock: 0, toBlock: 'latest'})
                console.log(HubInstance.address)
                projectLog.get((error, projects) => {
                    let projectList = [];
                    projects.forEach(proj => {
                        projectList.push({
                            projectOwner: proj.args._projectOwner,
                            projectName: self.state.web3.toAscii(proj.args._projectName),
                            pledgedAmount: proj.args._pledgedAmount.toNumber(),
                            contractAddress: proj.args._projectAddr
                        })
                    })
                    self.setState({projectList: projectList});
                    self.setState({
                        projectCount: projects.length
                    })
                })

                let providerLog = HubInstance.NewProviderLog({}, {fromBlock: 0, toBlock: 'latest'})
                providerLog.get((error, providers) => {
                    let projectProvidersList = [];
                    providers.forEach(provider => {
                            projectProvidersList.push({
                                projectAddr: provider.args._projectAddr,
                                providerAddr: provider.args._providerAddr,
                                name: self.state.web3.toAscii(provider.args._providerName).replace(/\u0000/g, ''),
                                description: self.state.web3.toAscii(provider.args._description).replace(/\u0000/g, ''),
                                imageUrl: self.state.web3.toAscii(provider.args._imageUrl).replace(/\u0000/g, ''),
                                apiURI: self.state.web3.toAscii(provider.args._apiURI).replace(/\u0000/g, ''),
                            })
                        }
                    );
                    self.setState({projectProviderList: projectProvidersList});
                    console.log(providers)
                    self.setState({
                        providerCount: providers.length
                    })
                })

                // the idea is to get NewReadingLog and iterate
                let readingLog = HubInstance.NewReadingLog({}, {fromBlock: 0, toBlock: 'latest'})
                readingLog.get((error, meters) => {
                    meters.forEach(meter => {
                        let readingList = [];
                        for (var i = 0; i < meter.args._reading.length; i++) {
                            readingList.push({
                                solboxId: meter.args._reading[i][0].toNumber(),
                                gridId: meter.args._reading[i][1].toNumber(),
                                consumption: meter.args._reading[i][2].toNumber(),
                                expense: meter.args._reading[i][3].toNumber(),
                                recharge: meter.args._reading[i][4].toNumber()
                            })
                        }
                        self.setState({readingList: readingList});
                    })
                    // console.log(meters)
                })
            }, 1000);
        })
    }

    //only Freeelio owner addr is allowed at contract level
    createContract(pledgedAmount, projectName, state) {
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
            ).then(function (res, err) {
                if (err) {
                    console.log(err)
                }
                console.log(res)
                let transactionHash = res.receipt.transactionHash;
                state.web3.eth.getTransactionReceiptMined(transactionHash).then(function (receipt) {
                    alert('Done');
                });
            })

        })
        // window.location.reload()
    }

    fundProject(projectAddr, contribution, state) {
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
            ).then(function (res, err) {
                if (err) {
                    console.log(err)
                }
                let transactionHash = res.receipt.transactionHash;
                state.web3.eth.getTransactionReceiptMined(transactionHash).then(function (receipt) {
                    alert('Done');
                });
            })
        })
    }

    addProvider(projectAddr,
                providerAddr,
                name,
                description,
                imageUrl,
                apiURI,
                state) {
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
            ).then(function (res, err) {
                if (err) {
                    console.log(err)
                }
                let transactionHash = res.receipt.transactionHash;
                state.web3.eth.getTransactionReceiptMined(transactionHash).then(function (receipt) {
                    alert('Done');
                });
            })
        })
        // window.location.reload()
    }

    addProjectReading(projectAddr, providerAddr, state) {
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
                ).then(function (res, err) {
                    if (err) {
                        console.log(err)
                    }
                    let transactionHash = res.receipt.transactionHash;
                    state.web3.eth.getTransactionReceiptMined(transactionHash).then(function (receipt) {
                        alert('Done');
                    });
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
        } catch (err) {
            console.log(err)
        }

        console.log(key, value)
        console.log(target)
        console.log(key)
        console.log(value)

    }

    onMenuClick(event, menuItem) {

        switch (menuItem) {
            default:
                this.setState({selectedView: 'Default'})

                break;
            case 'Register':
                this.setState({selectedView: 'Register'})

                break;
            case 'NewProject':
                this.setState({selectedView: 'NewProject'})

                break;
        }
        console.log(menuItem)
        console.log(this.state.selectedView)
    }

    changeView() {

        if (this.state.selectedView === 'Register') {
            return (
                <div className="pure-u-1-1">
                    <p className="pure-menu-heading" style={{paddingLeft: 0}}>
                        <h2>
                            Register as a Service Provider
                        </h2>
                    </p>
                    <div className="card">
                        <form className="pure-form pure-form-aligned">

                            <div className="pure-g">
                                <div className="pure-u-1-5">
                                    <span>Project Address</span>
                                </div>
                                <div className="pure-u-4-5">
                                    <input
                                        type="text"
                                        id="projectAddr"
                                        placeholder="0x0decafe"
                                        name="projectAddr"
                                        value={this.state.projectAddr}
                                        onChange={this.handleInputChange}/>
                                </div>
                            </div>

                            <div className="pure-g">
                                <div className="pure-u-1-5">
                                    <span>Provider Provider Address</span>
                                </div>
                                <div className="pure-u-4-5">
                                    <input type="text"
                                           id="providerAddr"
                                           placeholder="0x0cafe"
                                           name="providerAddr"
                                           value={this.state.providerAddr}
                                           onChange={this.handleInputChange}/>
                                </div>
                            </div>

                            <div className="pure-g">
                                <div className="pure-u-1-5">
                                    <span>Service Provider Name</span>
                                </div>
                                <div className="pure-u-4-5">
                                    <input
                                        type="text"
                                        id="name"
                                        placeholder="Solshare"
                                        name="name"
                                        value={this.state.name}
                                        onChange={this.handleInputChange}/>
                                </div>
                            </div>

                            <div className="pure-g">
                                <div className="pure-u-1-5">
                                    <span>Service Description</span>
                                </div>
                                <div className="pure-u-4-5">
                                    <input
                                        type="text"
                                        id="description"
                                        placeholder="Enter something here..."
                                        name="description"
                                        value={this.state.description}
                                        onChange={this.handleInputChange}/>
                                </div>
                            </div>

                            <div className="pure-g">
                                <div className="pure-u-1-5">
                                    <span>Corporate URL</span>
                                </div>
                                <div className="pure-u-4-5">
                                    <input
                                        type="text"
                                        id="imageUrl"
                                        placeholder="Enter your website here..."
                                        name="imageUrl"
                                        value={this.state.imageUrl}
                                        onChange={this.handleInputChange}/>
                                </div>
                            </div>

                            <div className="pure-g">
                                <div className="pure-u-1-5">
                                    <span>API URI</span>
                                </div>
                                <div className="pure-u-4-5">
                                    <input type="text"
                                           id="apiURI"
                                           placeholder="Enter your website here..."
                                           name="apiURI"
                                           value={this.state.apiURI}
                                           onChange={this.handleInputChange}/>
                                </div>
                            </div>
                        </form>
                        <div className="pure-controls">
                            <br/>
                            <button
                                className="pure-button pure-button-primary"
                                title="Add Provider"
                                onClick={() => this.addProvider(this.state.projectAddr,
                                    this.state.providerAddr,
                                    this.state.name,
                                    this.state.description,
                                    this.state.imageUrl,
                                    this.state.apiURI,
                                    this.state)}
                            >Submit
                            </button>
                        </div>
                    </div>
                    <p className="pure-menu-heading" style={{paddingLeft: 0}}>
                        <h2>
                            Our Service Providers
                        </h2>
                    </p>
                    <div className="providerListing">
                        {
                            this.state.projectProviderList.map((provider, index) => {
                                return (
                                    <div className="providerListing card" key={index}>
                                        <table className="pure-table pure-table-bordered projectInfo">
                                            <tr>
                                                <td>Project Address</td>
                                                <td>{provider.projectAddr}</td>
                                            </tr>
                                            <tr>
                                                <td>Provider Name</td>
                                                <td>{provider.name}</td>
                                            </tr>
                                            <tr>
                                                <td>Provider Address</td>
                                                <td>{provider.providerAddr}</td>
                                            </tr>
                                            <tr>
                                                <td>Provider Website</td>
                                                <td>{provider.imageUrl}</td>
                                            </tr>
                                            <tr>
                                                <td>Provider API URI</td>
                                                <td>{provider.apiURI}</td>
                                            </tr>
                                            <tr>
                                                <td>Service Description</td>
                                                <td>{provider.description}</td>
                                            </tr>
                                        </table>
                                        <br/>
                                        <button
                                            className="pure-button pure-button-primary"
                                            title="Load Data"
                                            onClick={() => this.addProjectReading(provider.projectAddr, provider.providerAddr, this.state)}>
                                            Load API Data
                                        </button>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            )
        }

        if (this.state.selectedView === 'NewProject') {
            return (
                <div className="pure-u-1-1">
                    <p className="pure-menu-heading" style={{paddingLeft: 0}}>
                        <h2>
                            Create Project
                        </h2>
                    </p>
                    <div className="card">
                        <form className="pure-form pure-form-aligned">

                            <div className="pure-g">
                                <div className="pure-u-1-5">
                                    <span>Project Name</span>
                                </div>
                                <div className="pure-u-4-5">
                                    <input
                                        type="text"
                                        id="projectName"
                                        placeholder="0x0cafe"
                                        name="projectName"
                                        value={this.state.projectName}
                                        onChange={this.handleInputChange}/>
                                </div>
                            </div>

                            <div className="pure-g">
                                <div className="pure-u-1-5">
                                    <span>Estimated Funding Target</span>
                                </div>
                                <div className="pure-u-4-5">
                                    <input type="text"
                                           id="pledgedAmount"
                                           placeholder="0x0decafe"
                                           name="pledgedAmount"
                                           value={this.state.pledgedAmount}
                                           onChange={this.handleInputChange}/>
                                </div>
                            </div>
                        </form>
                        <div className="pure-controls">
                            <br/>
                            <button
                                className="pure-button pure-button-primary"
                                title="Create Contract"
                                onClick={() => this.createContract(this.state.pledgedAmount, this.state.projectName, this.state)}>Submit
                            </button>
                        </div>
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
                                    <div className="projectListing card" key={index}>
                                        <table className="pure-table pure-table-bordered projectInfo">
                                            <tr>
                                                <td>Project name</td>
                                                <td>{project.projectName}</td>
                                            </tr>
                                            <tr>
                                                <td>Project Contract Address</td>
                                                <td>{project.contractAddress}</td>
                                            </tr>
                                            <tr>
                                                <td>Pledged Amount</td>
                                                <td>{project.pledgedAmount}</td>
                                            </tr>
                                            <tr>
                                                <td>Providers Onboarded</td>
                                                <td>{this.state.providerCount}</td>
                                            </tr>
                                            <tr>
                                                <td>Make a contribution in Ether</td>
                                                <td>
                                                    <input className="pure-input-1-2 input" id="contribution"
                                                           type="text"
                                                           name="contribution" value={this.state.contribution[{index}]}
                                                           onChange={this.handleInputChange}/>
                                                </td>
                                            </tr>
                                        </table>
                                        <br/>
                                        <div className="Button">
                                            <button className="pure-button pure-button-primary" title="Fund Project"
                                                    onClick={() => this.fundProject(project.contractAddress, this.state.contribution, this.state)}>
                                                <i>Give</i>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="Metering card" onChange={this.handleInputChange}>
                        <p className="pure-menu-heading" style={{paddingLeft: 0}}>
                            There are currently {this.state.readingList.length} eligible small businesses in the Service
                            area of our Providers</p>
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
                                            <td>{index + 1}</td>
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
                                <a href="#" name="Donate" onClick={() => this.onMenuClick(event, 'Default')}
                                   className="pure-menu-link">Default (Patron)</a>
                            </li>
                            <li className="pure-menu-item">
                                <a href="#" name="Register" onClick={() => this.onMenuClick(event, 'Register')}
                                   className="pure-menu-link">Register (Provider)</a>
                            </li>
                            <li className="pure-menu-item">
                                <a href="#" name="NewProject" onClick={() => this.onMenuClick(event, 'NewProject')}
                                   className="pure-menu-link">New Project (Freeelio)</a>
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
        )
    }

}

export default App;