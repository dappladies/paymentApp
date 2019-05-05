pragma solidity >=0.4.0 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract UserFactory is Ownable {

  /* EVENTS*/
  event FundsRequested(address _from, uint amount);

  // dynamic array of all user addresses
  address[] public userAddresses;

  // map an address to their User struct
  mapping (address => User) public userStruct;
  User[] public users;

  mapping (address => bool) public isUser;

  struct User {
    string userName;
    address[] friends;
  }

  struct Event {
    string name;
    address[] people;
  }

  Event[] public events;
  mapping (uint => address) public eventToOwner;

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

  // allow users to send funds
  function sendFunds(address payable _friend) public payable returns (bool) {
    require(isUser[msg.sender] == true);
    require(msg.value > 0, 'amount must be bigger than 0');
    _friend.transfer(msg.value);
    return true;
  }

  function createEvent(string memory _name) public {
    require(isUser[msg.sender] == true);
    Event memory e;
    e.name = _name;
    uint id = events.push(e) - 1;
    eventToOwner[id] = msg.sender;
  }

  // function joinEvent(uint _id) public {
  //   require(isUser[msg.sender] == true);
  //   events[_id].push(msg.sender);
  // }

  // // allow users to request funds
  // function requestFunds(uint _amount, address _friend) public {
  //   require(isUser[msg.sender] == true);
  //   userStruct[_friend].amountOwed = userStruct[_friend].amountOwed.add(_amount);

  //   emit FundsRequested(msg.sender, _amount);
  // }

  // function addFundsToEvent() public {}

  // function endEvent() public {}

  // function calculateAmntOwed() public {}

}