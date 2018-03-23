pragma solidity ^0.4.19;


contract Project {

    address public projectOwner;
    uint256 public pledgedAmount;
    bytes32 public projectName;

    struct ProviderStruct {
        uint32[5][] readings;
        uint256 totalBoughtTk;
        uint256 totalRechargeAmountTk;
        uint256 donationsReceivedTk;
        bytes32 name;
        bytes32 description;
        bytes32 imageUrl;
        bytes32 apiURI;
    }

    mapping(address => ProviderStruct) provider;
    mapping(address => uint) public patronage;

    enum State { Running, Expired, Suspended }
    State public state;

    modifier inState(State _state) {require(state == _state); _;}
    modifier isOwner() {require(projectOwner == msg.sender); _;}
    modifier isProvider(address _providerAddr) {require(provider[_providerAddr].name != 0x00); _;}

    event debug(address _addr, uint256 _uint, bytes32 _bytes32);

    //fallback
    function() public {

    }

    //constructor
    // gas 1113854 txCost; 804286 exCost;
    // "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 90000, "Help Bangladesh Farming Village"
    function Project(
        address _projectOwner,
        uint256 _pledgedAmount,
        bytes32 _projectName)
        public
    {
        projectOwner = _projectOwner;
        pledgedAmount = _pledgedAmount;
        projectName = _projectName;
        state = State.Running;
    }

    // "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "Solshare", "Solshare Bangladesh", "http://test.com/logo.jpg", "http://test.com/api/"
    // gas 109207 txCost;81471 exCost;
    function addProvider(
        address _providerAddr,
        bytes32 _name,
        bytes32 _description,
        bytes32 _imageUrl,
        bytes32 _apiURI)
        public
        isOwner
        returns(bool success)
    {
        require(_name != 0x00);
        require(_description != 0x00);
        require(_imageUrl != 0x00);
        require(_apiURI != 0x00);

        provider[_providerAddr].name = _name;
        provider[_providerAddr].description = _description;
        provider[_providerAddr].imageUrl = _imageUrl;
        provider[_providerAddr].apiURI = _apiURI;

        // debug(msg.sender, 0, 0);
        return true;
    }

    //new reading stub. depending on frequency, could be a case for state channels;
    // "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", [[1,1,1,1,1], [2,2,2,2,2]]
    // _reading[i][0] = solGridID
    // _reading[i][1] = gridID
    // _reading[i][2] = monthBoughtWh
    // _reading[i][3] = monthBoughtTk
    // _reading[i][4] = rechargeAmountTk
    // gas 221739 txCost; 196755 exCost;
    function addReading(
        address _providerAddr,
        uint32[5][] _reading)
        public
        isProvider(_providerAddr)
        returns (bool success)
    {

        for (uint8 i = 0; i < _reading.length; i ++) {
            provider[_providerAddr].readings.push(_reading[i]);
            provider[_providerAddr].totalBoughtTk += _reading[i][3];
            provider[_providerAddr].totalRechargeAmountTk += _reading[i][4];
        }

        return true;
    }

    //available to anyone the project
    function fund(address _patron)
        public
        inState(State.Running)
        payable
        returns (bool success)
    {
        require(_patron != 0x00);

        patronage[_patron] += msg.value;

        return true;
    }

    // "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 0
    function getProviderReading(address _providerAddr, uint _index)
        external
        view
        returns(uint32[5] reading)
    {
        require(_index <= provider[_providerAddr].readings.length-1);

        return provider[_providerAddr].readings[_index];
    }

    // "0xca35b7d915458ef540ade6068dfe2f44e8fa733c"
    function getProviderReadingCount(address _providerAddr)
        external
        view
        returns(uint count)
    {
        return provider[_providerAddr].readings.length;
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
