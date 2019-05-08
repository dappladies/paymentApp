pragma solidity >=0.4.0 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract UserFactory is Ownable {
using SafeMath for uint256;

  /* EVENTS*/
  event FundsRequested(address _from, uint amount);
  event EventCreated(uint id, string _name, address owner);

  struct User {
    string userName;
    address[] friends;
  }

  struct Event {
    uint id;
    string eventName;
    address owner;
    address payable[] people;
    uint eventBalance;
    bool eventOver;
  }

  /* USER STATE*/
  // dynamic array of all user addresses
  address[] public userAddresses;

  // map an address to their User struct
  mapping (address => User) public userStruct;

  mapping (address => bool) public isUser;

  // map of users to friends
  mapping (address => address) public userToFriend;

  // mapping of user to an event to balance owed
  mapping(address => mapping(uint => uint)) public fundsSubmitted;

  // TO DO: map friends to users

  /* EVENT STATE*/

  // mapping of id to an event
  mapping (uint => Event) public eventStruct;
  uint public counter = 0;

  modifier onlyUser() {
    require(isUser[msg.sender] == true, "Sender must be a user");
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
    // require(isUser[msg.sender] == true);

    // add friend to userStruct
    userStruct[msg.sender].friends.push(_friend);
  }

  // get user's friends
  function getMyFriends() public view onlyUser returns (address[] memory) {
    // require(isUser[msg.sender] == true);
    return userStruct[msg.sender].friends;
  }

  function createEvent(string memory _name) public onlyUser {
    // require(isUser[msg.sender] == true);

    uint id = counter++;

    // set sender an event owner
    eventStruct[id].owner = msg.sender;
  
    // set eventId
    eventStruct[id].id = id;

    // set eventName
    eventStruct[id].eventName = _name;

    // add event creator to people array
    eventStruct[id].people.push(msg.sender);
    emit EventCreated(id, _name, msg.sender);
  }

  function joinEvent(uint _id) public {
    require(eventStruct[_id].eventOver == false);
    require(isUser[msg.sender] == true);
    eventStruct[_id].people.push(msg.sender);
  }

  // get events's people
  function getEventParticipants(uint _id) public view onlyUser returns (address payable[] memory) {
    // require(isUser[msg.sender] == true);
    return eventStruct[_id].people;
  }

  function addFundsToEvent(uint _id) public onlyUser payable {
    require(eventStruct[_id].eventOver == false);
    eventStruct[_id].eventBalance = eventStruct[_id].eventBalance.add(msg.value);

    fundsSubmitted[msg.sender][_id] = msg.value;
  }

  function endEvent(uint _id) public onlyUser {
    require(eventStruct[_id].owner == msg.sender);

    // set eventOver boolean to true
    eventStruct[_id].eventOver = true;

    _distributeFunds(_id); 
  }

  function _distributeFunds(uint _id) private {
    uint totalFunds = eventStruct[_id].eventBalance;
    address payable[] memory eventPeople = eventStruct[_id].people;
    uint totalPeople = eventStruct[_id].people.length;
    uint splitAmount = totalFunds.div(totalPeople);

    for (uint i = 0; i < totalPeople; i++) {
      uint fundsPerPerson = fundsSubmitted[eventPeople[i]][_id];
      if (fundsPerPerson > splitAmount) {
        uint overage = fundsPerPerson - splitAmount;
        eventPeople[i].transfer(overage);
      }
    }
  }

}