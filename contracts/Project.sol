pragma solidity ^0.4.17;


contract Project {

    struct ProjectStruct {
        address projectOwner;
        uint256 activatedAmount;
        uint256 deadline;
        bytes32 causeName;
    }

    ProjectStruct public config;

    struct MeterStruct {
        uint256 balance;
        uint256 kWh;
        bool active;
    }

    //meter wallets that are registered in this project
    mapping(address => MeterStruct) public account;
    //anyone who contributes to this project
    mapping(address => uint) public patronage;

    enum State { Running, Expired, Suspended }
    State public state;

    modifier isPatron() {require(patronage[msg.sender] > 0); _;}
    modifier isOwner() {require(msg.sender == config.projectOwner); _;}
    modifier isAccount() {require(account[msg.sender].active == true); _;}
    modifier inState(State _state) {require(state == _state); _;}

    event FundingLog(address indexed _patron, uint256 _amount);
    event RefundLog(address indexed _patron, uint256 _amount);
    event PayoutLog(address _projectOwner, uint256 _amount);

    //fallback
    function() public {

    }

    //constructor
    function Project(
        address _projectOwner,
        uint256 _activatedAmount,
        uint256 _deadline,
        bytes32 _causeName)
        public
    {
        config.projectOwner = _projectOwner;
        config.activatedAmount = _activatedAmount;
        config.deadline = _deadline;
        config.causeName = _causeName;
        state = State.Running;
    }

    //add account
    function addAccount(address _meterAddr)
        public
        isOwner
        returns (bool success)
    {
        account[_meterAddr].active = true;
        //uint is initiallised as zero...
        return true;
    }

    //suspend account
    function suspendAccount(address _meterAddr)
        public
        isOwner
        returns (bool success)
    {
        account[_meterAddr].active = true;

        return true;
    }

    //new reading stub. depending on frequency, could be a case
    //for state channels; reading is probably more complex that 1 uint;
    function addReading(uint256 _kWh)
        public
        isAccount
        returns (bool success)
    {
        require(account[msg.sender].active = true);

        account[msg.sender].kWh = _kWh;
        //some calculation to add token funds to account[msg.sender].balance?

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

    //available to patrons after deadline, if not Suspended
    function refund(address _patron)
        public
        isPatron
        inState(State.Expired)
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
}
