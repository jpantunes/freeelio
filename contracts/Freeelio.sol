pragma solidity ^0.4.18;

import './Project.sol';


contract Freeelio {

    address public owner;

    struct ProviderStruct {
        bytes32 name;
        bytes32 description;
        bytes32 imageUrl;
    }

    mapping(address => ProviderStruct) public provider;

    modifier onlyOwner() {require(msg.sender == owner); _;}

    event ProjectLog(
        address indexed _projectOwner,
        address indexed _projectAddr,
        uint256 _activatedAmount,
        bytes32 _projectName);

    event ContributionLog(
        address indexed _patron,
        address indexed _projectAddr,
        uint256 _contribution);

    event NewProviderLog(
        address indexed _ProviderAddr,
        bytes32 _ProviderName,
        bytes32 _description,
        bytes32 _imageUrl);

    function () public {

    }

    function Freeelio() public {
        owner = msg.sender;
    }

    // add a new Provider record
    function addProvider(
        address _wallet,
        bytes32 _name,
        bytes32 _description,
        bytes32 _imageUrl)
        public
        onlyOwner
        returns(bool)
    {
        provider[_wallet].name = _name;
        provider[_wallet].description = _description;
        provider[_wallet].imageUrl = _imageUrl;

        NewProviderLog(
            _wallet,
            _name,
            _description,
            _imageUrl
        );

        return true;
    }

    //onlyProvider's address should be able to withdraw donated funds
    function createProject(
        uint256 _activatedAmount,
        bytes32 _projectName)
        public
        returns (address projectAddr)
    {
        require(_activatedAmount > 0x00); //must have a target activated amount greater than zero
        require(_projectName.length > 0x00); //must have a name

        projectAddr = new Project(
            msg.sender,
            _activatedAmount,
            _projectName
        );

        //filter these events to get list of projects in F/E
        //msg.sender is projectOwner should be provider
        ProjectLog(
            msg.sender,
            projectAddr,
            _activatedAmount,
            _projectName
        );
        return projectAddr;
    }

    //anyone can contribute
    function contribute(address _projectAddr)
        public
        payable
        returns (bool success)
    {
        Project project = Project(_projectAddr);
        if (!project.fund.value(msg.value).gas(100000)(msg.sender)) {
            revert();
        } //~0.27 cents

        ContributionLog(msg.sender, _projectAddr, msg.value);
        return true;
    }

    function kill() public onlyOwner {
        selfdestruct(owner);
    }

}
