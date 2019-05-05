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
  describe.only('events', function () {
    it('should set eventStruct mapping', async function () {
      const userName = "kseniya292"
      const eventName = "GirlsNightOut"
      await paymentAppInstance.createUser(userName, {from: user1});
      await paymentAppInstance.addFriend(friend1, {from: user1});
      await paymentAppInstance.addFriend(friend2, {from: user1});

      await paymentAppInstance.createEvent(eventName, {from: user1});
      const x = await paymentAppInstance.eventStruct.call(user1);
      assert.equal(x.eventName, eventName)
    })
    it('should allow user to join event', async function () {
      const userName = "kseniya292"
      const eventName = "GirlsNightOut"
      await paymentAppInstance.createUser(userName, {from: user1});
      await paymentAppInstance.createUser(userName, {from: friend1});
      await paymentAppInstance.addFriend(friend1, {from: user1});
      await paymentAppInstance.addFriend(friend2, {from: user1});
      await paymentAppInstance.createEvent(eventName, {from: user1});
      await paymentAppInstance.joinEvent(user1, {from: friend1});
      const x = await paymentAppInstance.getEventParticipants({from: user1})
      console.log(x)
      assert.equal(x[0], friend1)
    })
    it('should allow user to add funds to event', async function () {
      const userName = "kseniya292"
      const eventName = "GirlsNightOut"
      await paymentAppInstance.createUser(userName, {from: user1});
      await paymentAppInstance.createUser(userName, {from: friend1});
      await paymentAppInstance.addFriend(friend1, {from: user1});
      await paymentAppInstance.addFriend(friend2, {from: user1});
      await paymentAppInstance.createEvent(eventName, {from: user1});
      await paymentAppInstance.joinEvent(user1, {from: friend1});
      await paymentAppInstance.addFundsToEvent(user1, {from: user1, value: 2000000000});
      const x = await paymentAppInstance.eventStruct.call(user1);
      assert.equal(x.eventBalance.toNumber(), 2000000000)
    })
  })

})