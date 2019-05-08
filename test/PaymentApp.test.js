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
      await paymentAppInstance.createUser(userName);
      const user = await paymentAppInstance.userStruct.call(creator);
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
      await paymentAppInstance.addFundsToEvent(0, {from: user1, value: valueSent});
      await paymentAppInstance.addFundsToEvent(0, {from: friend1, value: valueSent2});
      
      const event = await paymentAppInstance.eventStruct.call(0);
      const total = valueSent + valueSent2;
      assert.equal(event.eventBalance.toNumber(), total)

      const amount = await paymentAppInstance.fundsSubmitted.call(user1, 0);
      assert.equal(amount.toNumber(), valueSent)

      const amount2 = await paymentAppInstance.fundsSubmitted.call(friend1, 0);
      assert.equal(amount2.toNumber(), valueSent2)
    })
    it('should split funds', async function () {
      const userName = "kseniya292"
      const eventName = "GirlsNightOut"
      const valueSent = 2000000000;
      const valueSent2 = 4000000000;
      const balance = await web3.eth.getBalance(user1)
      const balance2 = await web3.eth.getBalance(friend1)
      // console.log(balance)
      // console.log(balance2)
      await paymentAppInstance.createUser(userName, {from: user1});
      await paymentAppInstance.createUser(userName, {from: friend1});
      await paymentAppInstance.addFriend(friend1, {from: user1});
      await paymentAppInstance.createEvent(eventName, {from: user1});
      await paymentAppInstance.joinEvent(0, {from: friend1});
      await paymentAppInstance.addFundsToEvent(0, {from: user1, value: valueSent});
      await paymentAppInstance.addFundsToEvent(0, {from: friend1, value: valueSent2});
      
      await paymentAppInstance.endEvent(0, {from: user1});
      const balance3 = await web3.eth.getBalance(user1)
      const balance4 = await web3.eth.getBalance(friend1)
      // console.log(balance3)
      // console.log(balance4)
    })
  })

})