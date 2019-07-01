# Payment DApp

This is a test project for DApp Ladies. 

Make sure an instance of ganache-cli is running `ganache-cli`

#### Setup

```
git clone https://github.com/dappladies/paymentApp.git
npm install
```

#### Compile
```
truffle console
migrate
```

After you do this, you should see something like:

```
   Deploying 'UserFactory'
   -----------------------
   > transaction hash:    0xbd44481eb10ccac77aba568230898f5290e2b9bd07e41611083ca33a5b874d53
   > Blocks: 0            Seconds: 0
   > contract address:    0x2300e34F11cAbf935D752FA19325A15966108a53
   > account:             0x93a44CE3F16aE5D76317E873B169cCAbaa4d9Ce9
   > balance:             99.02787366
   > gas used:            2091467
   > gas price:           20 gwei
   > value sent:          0 ETH
   > total cost:          0.04182934 ETH
```

Make sure you copy the contract address because you will use it to interact with the functions.

#### Interact

Insert the copied contract address here:
```
const contract = await UserFactory.at('0x2300e34F11cAbf935D752FA19325A15966108a53');
```

Shows you all the functions you can interact with:
`contract.` + click tab twice

**Returns 10 user addresses**
```
let accounts = await web3.eth.getAccounts();
```
Now you can access addresses like `accounts[0], accounts[1]`, etc

**Create a user**
```
await contract.createUser('Kseniya')
```
If you want to create multiple users, you need to add an object into the arguments to specify which account to make a user from. 
```
await contract.createUser('Swati', { from: accounts[1]})
```

**Add Friends**
```
await contract.addFriend(accounts[2])
```
To verify you added a friend, call the `getMyFriends()` function.
```
await contract.getMyFriends()
```
This returns an array of the addresses of friends you have entered. 