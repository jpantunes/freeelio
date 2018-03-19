import React from 'react';
import '../css/pure-min.css'

export default class Register extends React.Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <form className="pure-form pure-form-aligned">
          <fieldset>
              <div className="pure-control-group">
                  <label htmlFor="projAddr">Project Address</label>
                  <input className="pure-input-1-2" id="projAddr" type="text" placeholder="0x0decafe" />
              </div>

              <div className="pure-control-group">
                  <label htmlFor="wallet">Provider Provider Address</label>
                  <input className="pure-input-1-2" id="wallet" type="text" placeholder="0x0cafe" />
              </div>

              <div className="pure-control-group">
                  <label htmlFor="name">Service Provider Name</label>
                  <input className="pure-input-1-2" id="name" type="text" placeholder="Solshare" />
              </div>

              <div className="pure-control-group">
                  <label htmlFor="url">Corporate URL</label>
                  <input className="pure-input-1-2" id="url" type="text" placeholder="Enter your website here..." />
              </div>

              <div className="pure-control-group">
                  <label htmlFor="description">Service Description</label>
                  <input className="pure-input-2-3" id="description" type="text" placeholder="Enter something here..." />
              </div>

              <div className="pure-controls">
                  <button type="submit" className="pure-button pure-button-primary">Submit</button>
              </div>
          </fieldset>
      </form>
    );
  }
}
