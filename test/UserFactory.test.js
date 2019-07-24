// const encodeCall = require('zos-lib/lib/helpers/encodeCall').default
// const { BN, expectEvent, shouldFail } = require('openzeppelin-test-helpers');
// const helpers = require('./helpers/helpers.js');
// const utils = require('./helpers/utils.js');

const UserFactory = artifacts.require('UserFactory')

const chai = require('chai')
chai
  .should()

contract('UserFactory', function (accounts) {
  const creator = accounts[0]
  const user1 = accounts[1]
	const friend1 = accounts[2]
  const friend2 = accounts[3]
  const friend3 = accounts[4]

  beforeEach(async function () {
    paymentApp = await UserFactory.new();
    paymentAppInstance = await UserFactory.at(paymentApp.address);
  })

  describe('createUser', function () {
    it('should create user', async function () {
      const userName = "kseniya292"
      await paymentAppInstance.createUser(userName, {from: user1});
      const user = await paymentAppInstance.userStruct.call(user1);
      assert.equal(userName, user)
    })
    it('should add user to userAddresses array', async function () {
      const userName = "kseniya292"
      await paymentAppInstance.createUser(userName);
      const user = await paymentAppInstance.userAddresses.call([0]);
      assert.equal(user, creator)
    })
    it('should set isUser mapping to true', async function () {
      const userName = "kseniya292"
      await paymentAppInstance.createUser(userName);
      const user = await paymentAppInstance.isUser.call(creator);
      assert.isTrue(user)
    })
  })
  describe('addFriend', function () {
    it('should add friend to friends array', async function () {
      const userName = "kseniya292"
      await paymentAppInstance.createUser(userName, {from: user1});
      await paymentAppInstance.addFriend(friend1, {from: user1});
      await paymentAppInstance.addFriend(friend2, {from: user1});
      const friends = await paymentAppInstance.getMyFriends({from: user1});
      assert.equal(friends[0], friend1)
      assert.equal(friends[1], friend2)
    })
  })
  describe('events', function () {
    it('should set eventStruct name', async function () {
      const userName = "kseniya292"
      const eventName = "GirlsNightOut"
      await paymentAppInstance.createUser(userName, {from: user1});
      await paymentAppInstance.addFriend(friend1, {from: user1});
      await paymentAppInstance.addFriend(friend2, {from: user1});

      await paymentAppInstance.createEvent(eventName, {from: user1});
      const x = await paymentAppInstance.eventStruct.call(0);
      assert.equal(x.eventName, eventName)
    })
    it('should set eventStruct id', async function () {
      const userName = "kseniya292"
      const eventName = "GirlsNightOut"
      await paymentAppInstance.createUser(userName, {from: user1});

      // console.log((await paymentAppInstance.counter.call()).toNumber());
      await paymentAppInstance.createEvent(eventName, {from: user1});
      const x = await paymentAppInstance.eventStruct.call(0);
      assert.equal(x.id.toNumber(), 0)
    })
    it('should set eventStruct owner', async function () {
      const userName = "kseniya292"
      const eventName = "GirlsNightOut"
      await paymentAppInstance.createUser(userName, {from: user1});
      await paymentAppInstance.createEvent(eventName, {from: user1});
      const x = await paymentAppInstance.eventStruct.call(0);
      assert.equal(x.owner, user1)
    })
    it('should allow user to join event', async function () {
      const userName = "kseniya292"
      const eventName = "GirlsNightOut"
      await paymentAppInstance.createUser(userName, {from: user1});
      await paymentAppInstance.createUser(userName, {from: friend1});
      await paymentAppInstance.addFriend(friend1, {from: user1});
      await paymentAppInstance.addFriend(friend2, {from: user1});
      await paymentAppInstance.createEvent(eventName, {from: user1});
      await paymentAppInstance.joinEvent(0, {from: friend1});
      const x = await paymentAppInstance.getEventParticipants(0, {from: user1})
      assert.equal(x[1], friend1)
    })
    it('should increment numOfPeople by 1', async function () {
      const userName = "kseniya292"
      const eventName = "GirlsNightOut"
      await paymentAppInstance.createUser(userName, {from: user1});
      await paymentAppInstance.createUser(userName, {from: friend1});
      await paymentAppInstance.addFriend(friend1, {from: user1});
      await paymentAppInstance.addFriend(friend2, {from: user1});
      await paymentAppInstance.createEvent(eventName, {from: user1});
      await paymentAppInstance.joinEvent(0, {from: friend1});
      const x = await paymentAppInstance.getEventInfo(0, {from: user1})
      assert.equal(x[4], 2)
    })
    it('should allow user to add funds to event', async function () {
      const userName = "kseniya292"
      const eventName = "GirlsNightOut"
      const valueSent = 2000000000;
      const valueSent2 = 4000000000;
      await paymentAppInstance.createUser(userName, {from: user1});
      await paymentAppInstance.createUser(userName, {from: friend1});
      await paymentAppInstance.addFriend(friend1, {from: user1});
      await paymentAppInstance.addFriend(friend2, {from: user1});
      await paymentAppInstance.createEvent(eventName, {from: user1});
      await paymentAppInstance.joinEvent(0, {from: friend1});
      await paymentAppInstance.addFundsToEvent(0, valueSent, {from: friend1});
      const x = await paymentAppInstance.getEventInfo(0, {from: user1});
      assert.equal(x[3], valueSent);
    })
    it('should end event', async function () {
      const eventName = "GirlsNightOut"
      const valueSent1 = 2000000000;
      const valueSent2 = 4000000000;
      const valueSent3 = 3000000000;
      await paymentAppInstance.createUser("kseniya292", {from: user1});
      await paymentAppInstance.createUser("sarah123", {from: friend1});
      await paymentAppInstance.createUser("jenna123", {from: friend2});
      await paymentAppInstance.createEvent(eventName, {from: user1});

      await paymentAppInstance.addFriend(friend1, {from: user1});
      await paymentAppInstance.addFriend(friend2, {from: user1});
      
      await paymentAppInstance.joinEvent(0, {from: friend1});
      await paymentAppInstance.joinEvent(0, {from: friend2});

      await paymentAppInstance.addFundsToEvent(0, valueSent1, {from: user1});
      await paymentAppInstance.addFundsToEvent(0, valueSent2, {from: friend1});
      await paymentAppInstance.addFundsToEvent(0, valueSent3, {from: friend2});

      await paymentAppInstance.endEvent(0, {from: user1});

      const x = await paymentAppInstance.getEventInfo(0, {from: user1});
      assert.isTrue(x[5]);
    })
    it('should end event and split funds', async function () {
      const eventName = "GirlsNightOut"
      const valueSent1 = 2000000000;
      const valueSent2 = 4000000000;
      const valueSent3 = 3000000000;
      await paymentAppInstance.createUser("kseniya292", {from: user1});
      await paymentAppInstance.createUser("sarah123", {from: friend1});
      await paymentAppInstance.createUser("jenna123", {from: friend2});
      await paymentAppInstance.createEvent(eventName, {from: user1});

      await paymentAppInstance.addFriend(friend1, {from: user1});
      await paymentAppInstance.addFriend(friend2, {from: user1});
      
      await paymentAppInstance.joinEvent(0, {from: friend1});
      await paymentAppInstance.joinEvent(0, {from: friend2});

      await paymentAppInstance.addFundsToEvent(0, valueSent1, {from: user1});
      await paymentAppInstance.addFundsToEvent(0, valueSent2, {from: friend1});
      await paymentAppInstance.addFundsToEvent(0, valueSent3, {from: friend2});

      await paymentAppInstance.endEvent(0, {from: user1});
      await paymentAppInstance.deposit(1000000000, {from: user1, value: 100000000});
      // console.log(await web3.eth.getBalance(paymentApp.address));
      await paymentAppInstance.withdraw(0, 100000000, {from: friend1});
      // console.log(await web3.eth.getBalance(paymentApp.address));
    })
  })

})