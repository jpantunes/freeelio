pragma solidity ^0.4.18;


contract Project {

    struct ProjectStruct {
        address projectOwner;
        uint256 activatedAmount;
        bytes32 projectName;
    }

    ProjectStruct public config;

    struct MeterStruct {
        uint8 solShareID; //11000001 - 11999999
        uint8 gridID; //1 - 9999
        uint8 comsumptionWh; //0 - 999999
        uint8 rechargeAmountTk; //0 - 999999
        bool active;
    }

    mapping(uint8 => MeterStruct) public meters;
    mapping(address => uint) public patronage;

    enum State { Running, Expired, Suspended }
    State public state;

    modifier isPatron() {require(patronage[msg.sender] > 0); _;}
    modifier isOwner() {require(msg.sender == config.projectOwner); _;}
    modifier inState(State _state) {require(state == _state); _;}

    event FundingLog(address indexed _patron, uint256 _amount);
    event RefundLog(address indexed _patron, uint256 _amount);
    event PayoutLog(address indexed _projectOwner, uint256 _amount);

    //fallback
    function() public {

    }

    //constructor
    function Project(
        address _projectOwner,
        uint256 _activatedAmount,
        bytes32 _projectName)
        public
    {
        config.projectOwner = _projectOwner;
        config.activatedAmount = _activatedAmount;
        config.projectName = _projectName;
        state = State.Running;
    }

    //new reading stub. depending on frequency, could be a case
    //for state channels;
    function addReading(
        uint8 _solShareID,
        uint8 _gridID,
        uint8 _comsumptionWh,
        uint8 _rechargeAmountTk)
        public
        returns (bool success)
    {
        // solShareID is between 11000001 - 11999999
        // gridID is between 1 - 9999
        // comsumptionWh is between 0 - 999999
        // rechargeAmountTk is between 0 - 999999

        meters[_solShareID].gridID = _gridID;
        meters[_solShareID].comsumptionWh = _comsumptionWh;
        meters[_solShareID].rechargeAmountTk = _rechargeAmountTk;

        //this needs to be the tk to euro conversion
        config.activatedAmount += _rechargeAmountTk;

        return true;
    }

    //available to anyone
    function fund(address _patron)
        public
        inState(State.Running)
        payable
        returns (bool success)
    {
        require(_patron != 0x00);

        patronage[_patron] += msg.value;

        FundingLog(_patron, msg.value);
        return true;
    }

    //available to projectOwner at any point as long as project is running
    function payout()
        public
        isOwner
        inState(State.Running)
        returns (bool success)
    {
        uint256 amount = this.balance;

        config.projectOwner.transfer(amount);

        PayoutLog(msg.sender, amount);
        return true;
    }

    //available to patrons after contributedAmount, if not Suspended
    function refund(address _patron)
        public
        isPatron
        //inState(State.Expired)
        returns (bool success)
    {
        require(_patron != 0x00);

        uint256 amount = patronage[_patron];
        patronage[_patron] = 0x00;

        _patron.transfer(amount);

        RefundLog(_patron, amount);
        return true;
    }

    function suspendProject()
        external
        isOwner
        inState(State.Running)
    {
        state = State.Suspended;
    }

    function resumeProject()
        external
        isOwner
        inState(State.Suspended)
    {
      state = State.Running;
    }

    function getActivatedAmount()
        external
        view
        returns (uint256)
    {
        return config.activatedAmount;
    }

}
