pragma solidity >=0.4.0 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract UserFactory is Ownable {
using SafeMath for uint256;

  /* EVENTS*/
  event FundsRequested(address _from, uint amount);
  event EventCreated(uint id, string _name, address owner);
  event EventEnded(uint id, uint _split);

  struct User {
    string userName;
    address[] friends;
  }

  struct Event {
    uint id;
    string eventName;
    address owner;
    uint eventBalance;
    uint numOfPeople;
    bool eventOver;
  }

  /* USER STATE*/
  address[] public userAddresses; // dynamic array of all user addresses
  mapping (address => User) public userStruct; // map an address to their User struct
  mapping (address => bool) public isUser; // map an address to a boolean
  mapping (address => address) public userToFriend; // map of users to friends

  /* EVENT STATE*/

  mapping (uint => Event) public eventStruct; // mapping of id to an event
  mapping(address => mapping(uint => uint)) public fundsSubmitted; // mapping of user to an event to balance owed
  mapping(uint => address[]) public eventToUsers; // mapping an eventID to its participants

  uint public counter = 0;

  modifier onlyUser() { 
    require(isUser[msg.sender] == true, "sender must be a registered user");
    _;
  }

  constructor() public {}

  function createUser(string memory _name) public {
    // add user address to array
    userAddresses.push(msg.sender);

    // set userName
    userStruct[msg.sender].userName = _name;

    // set isUser mapping to true
    isUser[msg.sender] = true;
  }

  // allow users to add friends
  function addFriend(address _friend) public onlyUser {
    // add friend to userStruct
    userStruct[msg.sender].friends.push(_friend);
  }

  // get user's friends
  function getMyFriends() public onlyUser view returns (address[] memory) {
    return userStruct[msg.sender].friends;
  }

  function createEvent(string memory _name) public onlyUser {
    uint eventId = counter++;

    eventStruct[eventId] = Event({
      id : eventId,
      eventName: _name,
      owner: msg.sender,
      eventBalance: 0,
      numOfPeople: 1,
      eventOver: false
    });

    // add event creator to userToEvent mapping
    eventToUsers[eventId].push(msg.sender);
    emit EventCreated(eventId, _name, msg.sender);
  }

  function getEventInfo(uint _id) public view 
    returns(uint, string memory, address, uint, uint, bool)
  {
    Event memory e = eventStruct[_id];
  	return(
  		e.id,
      e.eventName,
      e.owner,
      e.eventBalance,
      e.numOfPeople,
      e.eventOver
  	);
  }

  function joinEvent(uint _id) public onlyUser {
    require(eventStruct[_id].eventOver == false);
    eventToUsers[_id].push(msg.sender);
    eventStruct[_id].numOfPeople++;
  }

  // get events's people
  function getEventParticipants(uint _id) public view returns (address[] memory) {
    require(isUser[msg.sender] == true);
    return eventToUsers[_id];
  }

  function addFundsToEvent(uint _id, uint _amount) public {
    require(eventStruct[_id].eventOver == false);
    // check that msg.sender is part of event
    require(_isEventParticipant(_id, msg.sender));

    eventStruct[_id].eventBalance = eventStruct[_id].eventBalance.add(_amount);

    fundsSubmitted[msg.sender][_id] = _amount;
  }

  function endEvent(uint _id) public {
    require(eventStruct[_id].owner == msg.sender);

    // set eventOver boolean to true
    eventStruct[_id].eventOver = true;

    uint splitAmount = _calculateSplit(_id);
    emit EventEnded(_id, splitAmount);
  }

  function withdraw(uint256 id, uint256 amount) public onlyUser returns (bool){
    require(eventStruct[id].eventOver == true);
    require(_isEventParticipant(id, msg.sender));
    msg.sender.transfer(amount);
  }

  function deposit(uint256 amount) payable public onlyUser {}
  
  function _calculateSplit(uint256 _id) private returns (uint){
    uint256 totalFunds = eventStruct[_id].eventBalance;
    uint256 totalPeople = eventStruct[_id].numOfPeople;
    uint256 splitAmount = totalFunds.div(totalPeople);
    return splitAmount;
  }

  function _isEventParticipant(uint _id, address _participant) private view returns (bool) {
    address[] memory participants = getEventParticipants(_id);
    for (uint i = 0; i < participants.length; i++) {
      if (participants[i] == _participant) {
        return true;
      }
    }
  }

}