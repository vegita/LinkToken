require('./support/helpers.js')

contract('Standard223Token', (accounts) => {
  let Standard223TokenExample = artifacts.require("../contracts/token/examples/Standard223TokenExample.sol");
  let Standard223TokenReceiver = artifacts.require("../contracts/token/mocks/Standard223TokenReceiverMock.sol");

  let receiver, token;

  beforeEach(async function() {
    receiver = await Standard223TokenReceiver.new();
    token = await Standard223TokenExample.new(1000);
    assert.equal(await receiver.sentValue(), 0);
  });

  describe("#transfer(address, uint)", () => {
    it("calls the fallback on transfer", async () => {
      await token.transfer(receiver.address, 100);

      let tokenSender = await receiver.tokenSender();
      assert.equal(tokenSender, accounts[0]);

      let sentValue = await receiver.sentValue();
      assert.equal(sentValue, 100);

      let calledFallback = await receiver.calledFallback();
      assert(calledFallback);
    });

    context("when sending to a contract that is not ERC223 compatible", () => {
      it("throws an error", async () => {
        await assertActionThrows(async () => {
          await token.transfer(token.address, 100);
        });
      });
    });
  });

  describe("#transfer(address, uint, bytes)", () => {
    it("calls the correct function on transfer", async () => {
      await token.transfer(receiver.address, 100, new ArrayBuffer(4));

      let tokenSender = await receiver.tokenSender();
      assert.equal(tokenSender, accounts[0]);

      let sentValue = await receiver.sentValue();
      assert.equal(sentValue, 100);

      let calledFallback = await receiver.calledFallback();
      assert(calledFallback);
    });

    context("when sending to a contract that is not ERC223 compatible", () => {
      it("throws an error", async () => {
        await assertActionThrows(async () => {
          await token.transfer(token.address, 100, new ArrayBuffer(4));
        });
      });
    });
  });

  describe("#unsafeTransfer(address, uint)", () => {
    it("does not call the fallback on transfer", async () => {
      await token.unsafeTransfer(receiver.address, 100);

      let tokenSender = await receiver.tokenSender();
      assert.equal(tokenSender, '0x0000000000000000000000000000000000000000');
      assert.equal(await receiver.sentValue(), 0);
      let calledFallback = await receiver.calledFallback();
      assert(!calledFallback);

      let newBalance = await token.balanceOf.call(receiver.address);
      assert.equal(newBalance, 100);
    });

    context("when sending to a contract that is not ERC223 compatible", () => {
      it("still transfers the token", async () => {
        await token.unsafeTransfer(receiver.address, 100);

        let tokenSender = await receiver.tokenSender();
        assert.equal(tokenSender, '0x0000000000000000000000000000000000000000');
        assert.equal(await receiver.sentValue(), 0);

        let newBalance = await token.balanceOf.call(receiver.address);
        assert.equal(newBalance, 100);
      });
    });
  });
});