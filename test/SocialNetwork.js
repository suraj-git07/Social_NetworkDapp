const SocialNetwork = artifacts.require("SocialNetwork");

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("SocialNetwork", ([deployer, author, tipper]) => {
  let socialNetwork;

  before(async () => {
    socialNetwork = await SocialNetwork.deployed();
  });

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      const address = await socialNetwork.address;

      assert.notEqual(address, "0x0");
      assert.notEqual(address, "");
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
    });

    it("has a name", async () => {
      let name = await socialNetwork.name();
      assert.equal(name, "Dapp Social Network");
    });
  });

  describe("posts", async () => {
    let postCount, result;

    before(async () => {
      result = await socialNetwork.createPost("Hello Bro", { from: author });
      postCount = await socialNetwork.postCount();
    });

    it("creates posts", async () => {
      //SUCCESS
      assert.equal(postCount, 1);
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), postCount.toNumber(), "id is correct");
      assert.equal(event.content, "Hello Bro", "content is correct");
      assert.equal(event.tipAmount, "0", "tip amount is correct");
      assert.equal(event.author, author, "author is correct");

      // FAILURE:   Post must have content
      await socialNetwork.createPost("", { form: author }).should.be.rejected;
    });

    it("lists posts", async () => {
      const post = await socialNetwork.posts(postCount);

      assert.equal(post.id.toNumber(), postCount.toNumber(), "id is correct");
      assert.equal(post.content, "Hello Bro", "content is correct");
      assert.equal(post.tipAmount, "0", "tip amount is correct");
      assert.equal(post.author, author, "author is correct");
    });

    it("allow user to tip posts", async () => {
      //Track author balance before purchase
      let oldAuthorBalance;
      oldAuthorBalance = await web3.eth.getBalance(author);
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance);

      result = await socialNetwork.tipPost(postCount, {
        from: tipper,
        value: web3.utils.toWei("1", "Ether"),
      });

      //SUCCESS

      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), postCount.toNumber(), "id is correct");
      assert.equal(event.content, "Hello Bro", "content is correct");
      assert.equal(
        event.tipAmount,
        web3.utils.toWei("1", "Ether"),
        "tip amount is correct"
      );
      assert.equal(event.author, author, "author is correct");

      //Check that author received the funds
      let newAuthorBalance;
      newAuthorBalance = await web3.eth.getBalance(author);
      newAuthorBalance = new web3.utils.BN(newAuthorBalance);

      let tipAmount;
      tipAmount = web3.utils.toWei("1", "Ether");
      tipAmount = new web3.utils.BN(tipAmount);

      const expectedBalance = oldAuthorBalance.add(tipAmount);

      assert.equal(newAuthorBalance.toString(), expectedBalance.toString());

      //FAILURE: tries to tip a post that doesn't exist

      await socialNetwork.tipPost(99, {
        from: tipper,
        value: web3.utils.toWei("1", "Ether"),
      }).should.be.rejected;
    });
  });
});
