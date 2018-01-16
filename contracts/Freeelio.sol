pragma solidity ^0.4.17;

import './Project.sol';


contract Freeelio {

    address public owner;

    struct CharityStruct {
        bytes32 name;
        bytes32 description;
        bytes32 imageUrl;
        uint256 balance;
    }

    mapping(address => CharityStruct) public charity;

    modifier onlyOwner() {require(msg.sender == owner); _;}
    modifier onlyCharity() {require(charity[msg.sender].name != 0x00); _;}

    event ProjectLog(
        address indexed _projectOwner,
        address _projectAddr,
        uint256 _activatedAmount,
        uint256 _deadline,
        bytes32 _causeName);

    event ContributionLog(
        address indexed _patron,
        address indexed _projectAddr,
        uint256 _contribution);

    event NewCharityLog(
        address indexed _charityAddr,
        bytes32 _charityName,
        bytes32 _description,
        bytes32 _imageUrl);

    function () public {

    }

    function Freeelio() public {
        owner = msg.sender;
    }

    // add a new charity record
    function addCharity(
        address _wallet,
        bytes32 _name,
        bytes32 _description,
        bytes32 _imageUrl)
        public
        onlyOwner
        returns(bool)
    {
        charity[_wallet].name = _name;
        charity[_wallet].description = _description;
        charity[_wallet].imageUrl = _imageUrl;

        NewCharityLog(
            _wallet,
            _name,
            _description,
            _imageUrl
        );

        return true;
    }

    //1514723489 ~= 2017-12-31@12:30 // 10000000, 1514723489, "test"
    //_projectOwner will be able to withdraw donated funds 
    function createProject(
        address _projectOwner,
        uint256 _activatedAmount,
        uint256 _deadline,
        bytes32 _causeName)
        public
        onlyCharity
        returns (address projectAddr)
    {
        require(_activatedAmount > 0x00); //must have a funding target greater than zero
        require(_deadline >= now); //in days //require(_deadline >= now + 900) ~15 minutes from now
        require(_causeName.length > 0x00); //must have a name

        projectAddr = new Project(
            _projectOwner,
            _activatedAmount,
            _deadline,
            _causeName
        );

        //filter these events to get list of projects in F/E
        ProjectLog(
            _projectOwner,
            projectAddr,
            _activatedAmount,
            _deadline,
            _causeName
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
