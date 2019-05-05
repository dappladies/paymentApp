pragma solidity >=0.4.0 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract UserFactory is Ownable {
using SafeMath for uint256;

  /* EVENTS*/
  event FundsRequested(address _from, uint amount);
  event EventCreated(string _name, address owner);

  struct User {
    string userName;
    address[] friends;
  }

  struct Event {
    string eventName;
    address[] people;
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

  // TO DO: map friends to users

  /* EVENT STATE*/
  mapping (address => Event) public eventStruct;

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
  function addFriend(address _friend) public {
    require(isUser[msg.sender] == true);

    // add friend to userStruct
    userStruct[msg.sender].friends.push(_friend);
  }

  // get user's friends
  function getMyFriends() public view returns (address[] memory) {
    require(isUser[msg.sender] == true);
    return userStruct[msg.sender].friends;
  }

  function createEvent(string memory _name) public {
    require(isUser[msg.sender] == true);
    // set eventName
    eventStruct[msg.sender].eventName = _name;
    eventStruct[_eventOwner].people.push(msg.sender);
    emit EventCreated(_name, msg.sender);
  }

  function joinEvent(address _eventOwner) public {
    require(isUser[msg.sender] == true);
    eventStruct[_eventOwner].people.push(msg.sender);
  }

  // get events's people
  function getEventParticipants() public view returns (address[] memory) {
    require(isUser[msg.sender] == true);
    return eventStruct[msg.sender].people;
  }

  function addFundsToEvent(address _eventOwner) public payable {
    require(eventStruct[_eventOwner].eventOver == false);
    eventStruct[_eventOwner].eventBalance = eventStruct[_eventOwner].eventBalance.add(msg.value);
  }

  function endEvent(address _eventOwner) public {
    eventStruct[_eventOwner].eventOver = true;
    _distributeFunds(); 
  }

  // function _distributeFunds(address _eventOwner) private {
  //   uint funds = eventStruct[_eventOwner].eventBalance;
  //   require(isUser[msg.sender] == true);
  //   require(msg.value > 0, 'amount must be bigger than 0');
  //   _friend.transfer(msg.value);
  //   return true;
  // }

    // function calculateAmntOwed() public {}

  //   // allow users to send funds
  // function sendFunds(address payable _friend) public payable returns (bool) {
  //   require(isUser[msg.sender] == true);
  //   require(msg.value > 0, 'amount must be bigger than 0');
  //   _friend.transfer(msg.value);
  //   return true;
  // }

  // // allow users to request funds
  // function requestFunds(uint _amount, address _friend) public {
  //   require(isUser[msg.sender] == true);
  //   userStruct[_friend].amountOwed = userStruct[_friend].amountOwed.add(_amount);

  //   emit FundsRequested(msg.sender, _amount);
  // }

}