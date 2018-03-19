import React from 'react';
import '../css/pure-min.css'

export default class Donate extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      projectAddr: '',
      donationAmount: ''
    }

  }

  render() {
    return (
      <form className="pure-form pure-form-aligned">
          <fieldset>
              <div className="pure-control-group">
                  <label htmlFor="projectAddr">Project Contract Address</label>
                  <input className="pure-input-2-3" id="projectAddr" type="text" placeholder="0x0cafe"
                      value={this.state.projectAddr} onChange={this.handleInputChange} />
              </div>

              <div className="pure-control-group">
                  <label htmlFor="donationAmount">Donation Amount</label>
                  <input id="donationAmount" type="text" placeholder="1 ETH"
                      value={this.state.donationAmount} onChange={this.handleInputChange} />
              </div>

              <div className="pure-controls">
                  <button type="submit" className="pure-button pure-button-primary {index}"
                      onClick={() => this.fundProject(project.contractAddress, this.state.contribution) }>
                      Donate
                  </button>
              </div>

          </fieldset>
      </form>

    );
  }
}

// <div className="Button">
//   <b>Make a contribution in Ether:</b> <input type="text" name="contribution" value={this.state.contribution} onChange={this.handleInputChange} style={{width: 100}} /> {' '}
//   <button className="pure-button pure-button-primary {index}" title="Fund Project"
//           onClick={() => this.fundProject(project.contractAddress, this.state.contribution) }>
//           <i> Give!</i>
//   </button>
// </div>
