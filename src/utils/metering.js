import React from 'react';
import {getDonationBoxes} from "./solshareApi";
//https://github.com/glittershark/reactable
import {Table} from 'reactable'

class Metering extends React.Component {
  constructor(props){
    super(props);
  }

  _executeAfterModalOpen(){

    console.log("fake it");
  }

  render() {

    return (
      <Table className="pure-table" data={[
        { "Solbox Id": 1, "Grid Id": 10, "Thirthy Day Comsumption": 10000, "Thirthy Day Expense": '100 Eur', "Recharge Amount Allocated": '99 Eur' },
        { "Solbox Id": 2, "Grid Id": 10, "Thirthy Day Comsumption": 10000, "Thirthy Day Expense": '100 Eur', "Recharge Amount Allocated": '99 Eur' },
      ]} />

    );
  }
}

Metering.displayName = 'Metering';

export default Metering;
