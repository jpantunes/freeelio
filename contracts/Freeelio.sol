pragma solidity ^0.4.19;

import './Project.sol';


contract Freeelio {
    //keeps a list of created projects and providers and readings in the logs
    address public owner;

    mapping(address => address[]) public projectProviders;

    modifier isOwner() {require(msg.sender == owner); _;}

    event ContributionLog(
        address indexed _patron,
        address indexed _projectAddr,
        uint256 _contribution);

    event NewProjectLog(
        address indexed _projectOwner,
        address indexed _projectAddr,
        uint256 _pledgedAmount,
        bytes32 _projectName);

    event NewProviderLog(
        address indexed _projectAddr,
        address indexed _providerAddr,
        bytes32 _providerName,
        bytes32 _description,
        bytes32 _imageUrl,
        bytes32 _apiURI);

    event NewReadingLog(
        address indexed _projectAddr,
        address indexed _providerAddr,
        uint32[5][] _reading);

    function () public {

    }

    function Freeelio() public {
        owner = msg.sender;
    }

    //onlyOwner (Freeelio) can create new projects
    // 90001, "Help Bangladesh Fishing Village"
    // gas 863765 txCost; 840061 exCost;
    function createProject(
        uint256 _pledgedAmount,
        bytes32 _projectName)
        public
        isOwner
        returns (address projectAddr)
    {
        require(_pledgedAmount > 0x00); //must have a pledged amount greater than zero
        require(_projectName.length > 0x00); //must have a name

        projectAddr = new Project(
            address(this),
            _pledgedAmount,
            _projectName
        );

        //filter these events to get list of projects in F/E
        NewProjectLog(
            address(this),
            projectAddr,
            _pledgedAmount,
            _projectName
        );
        return projectAddr;
    }

    // Provider self-registration checks existing project
    // <projectAddr>|| "0x755014da263fc47d238078bb47d217f743e5b6a5", "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", "Solshare", "Solshare Bangladesh", "http://test.com/logo.jpg", "http://test.com/api/"
    // gas 115790 txCost; 86646 exCost;
    function addProvider(
        address _projectAddr,
        address _providerAddr,
        bytes32 _name,
        bytes32 _description,
        bytes32 _imageUrl,
        bytes32 _apiURI)
        public
        returns(bool)
    {
        require(_providerAddr != 0x00);
        require(_name != 0x00);
        require(_description != 0x00);
        require(_imageUrl != 0x00);
        require(_apiURI != 0x00);


        Project proj = Project(_projectAddr);
        if (!proj.addProvider.gas(3000000)(
                _providerAddr,
                _name,
                _description,
                _imageUrl,
                _apiURI))
        {
            revert();
        }

        NewProviderLog(
            _projectAddr,
            _providerAddr,
            _name,
            _description,
            _imageUrl,
            _apiURI
        );

        return true;
    }

    // add reading to project
    // <projectAddr> || "0x755014da263fc47d238078bb47d217f743e5b6a5", "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", [[1,1,1,1,1], [2,2,2,2,2]]
    // gas 230141 txCost; 203749 exCost;
    function addProjectReading(
        address _projectAddr,
        address _providerAddr,
        uint32[5][] _reading)
        public
        //project.addReading checks if _providerAddr is a known provider...
        returns(bool success)
    {
        require(_projectAddr != address(0x00));
        require(_providerAddr != address(0x00));
        require(_reading.length > 0x00);

        Project proj = Project(_projectAddr);
        if (!proj.addReading.gas(3000000)(_providerAddr, _reading)) {
            revert();
        }

        NewReadingLog(
                _projectAddr,
                _providerAddr,
                _reading);

        return true;
    }

    //anyone can contribute
    // gas 55471 txCost; 32791 exCost;
    function contribute(address _projectAddr)
        public
        payable
        returns (bool success)
    {
        Project project = Project(_projectAddr);
        if (!project.fund.value(msg.value).gas(300000)(msg.sender)) {
            revert();
        } //~0.27 cents

        ContributionLog(msg.sender, _projectAddr, msg.value);
        return true;
    }

    // <projectAddr> || "0x755014da263fc47d238078bb47d217f743e5b6a5", "0xca35b7d915458ef540ade6068dfe2f44e8fa733c"
    function getProviderReadingCount(address _projectAddr, address _providerAddr)
        public
        view
        returns(uint256 count)
    {
        Project project = Project(_projectAddr);

        return project.getProviderReadingCount(_providerAddr);
    }

    // "0x755014da263fc47d238078bb47d217f743e5b6a5", "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 1 // index starts at zero
    function getProviderReading(
        address _projectAddr,
        address _providerAddr,
        uint256 _index)
        public
        view
        returns(uint32[5] reading)
    {
        Project project = Project(_projectAddr);

        return project.getProviderReading(_providerAddr, _index);
    }

    function getProviderName(address _projectAddr, address _providerAddr)
        public
        view
        returns(bytes32 name)
    {
      Project project = Project(_projectAddr);

      return project.getProviderName(_providerAddr);
    }

    function kill() public isOwner {
        selfdestruct(owner);
    }

}
