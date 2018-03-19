import React from 'react';
import '../css/pure-min.css'

export default class newProject extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      projectName: '',
      activatedAmount: ''
    }

  }

  render() {
    return (
      <form className="pure-form pure-form-aligned">
          <fieldset>
              <div className="pure-control-group">
                  <label htmlFor="projectName">Project Name</label>
                  <input className="pure-input-2-3" id="projectName" type="text" placeholder="0x0cafe"
                      value={this.state.projectName} onChange={this.handleInputChange} />
              </div>

              <div className="pure-control-group">
                  <label htmlFor="activatedAmount">Estimated Funding Target</label>
                  <input id="activatedAmount" type="text" placeholder="0x0decafe"
                      value={this.state.activatedAmount} onChange={this.handleInputChange} />
              </div>

              <div className="pure-controls">
                  <button type="submit" className="pure-button pure-button-primary"
                      onClick={() => { this.createContract(this.state.activatedAmount, this.state.projectName) }} >
                      Submit
                  </button>
              </div>
          </fieldset>
      </form>

    );
  }
}


// <p><b>Project Name:</b> <input type="text" name="projectName" value={this.state.projectName} onChange={this.handleInputChange} style={{width: 500}} /></p>
// <p><b>Initial Target Amount:</b> <input type="text" name="activatedAmount" value={this.state.activatedAmount} onChange={this.handleInputChange} style={{width: 100}} /></p>
// <div className="Button">
//   <button className="pure-button pure-button-primary" title="Create Project"
//           onClick={() => { this.createContract(this.state.activatedAmount, this.state.projectName) }}>
//     <i> Create! </i>
//   </button>
// </div>
