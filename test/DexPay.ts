import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("DexPay", function () {
  async function getFixtures() {
    const [deployer, receiver, payer] = await hre.ethers.getSigners();

    const dexTokenFactory = await hre.ethers.getContractFactory("DexToken");
    const dexToken = await dexTokenFactory.deploy(payer.address, 100n);

    const Factory = await hre.ethers.getContractFactory(
      "DeterministicDeployFactory"
    );
    const factory = await Factory.deploy();
    const bytecode = (await hre.artifacts.readArtifact("DexPay")).bytecode;

    return {
      bytecode,
      deployer,
      dexToken,
      factory,
      payer,
      receiver,
    };
  }

  describe("deployment", function () {
    it("should withdraw funds on deployment", async function () {
      const { receiver, payer, factory, bytecode } = await loadFixture(
        getFixtures
      );

      const preReceiverBalance = await hre.ethers.provider.getBalance(
        receiver.address
      );

      const salt = hre.ethers.id("dexpay ftw");
      const initCode =
        bytecode +
        new hre.ethers.AbiCoder()
          .encode(
            ["address", "address"],
            [receiver.address, "0x0000000000000000000000000000000000000000"]
          )
          .slice(2);

      const create2Addr = hre.ethers.getCreate2Address(
        await factory.getAddress(),
        salt,
        hre.ethers.keccak256(initCode)
      );

      await payer.sendTransaction({ to: create2Addr, value: 100n });
      expect(await hre.ethers.provider.getBalance(create2Addr)).to.equal(100n);

      await factory.deploy(initCode, salt);

      expect(await hre.ethers.provider.getBalance(create2Addr)).to.equal(0n);
      expect(await hre.ethers.provider.getBalance(receiver.address)).to.equal(
        preReceiverBalance + 100n
      );
    });

    it("should also work for ERC20s", async function () {
      const { receiver, payer, factory, bytecode, dexToken } =
        await loadFixture(getFixtures);

      const preReceiverBalance = await dexToken.balanceOf(receiver.address);

      const salt = hre.ethers.id("dexpay ftw");
      const initCode =
        bytecode +
        new hre.ethers.AbiCoder()
          .encode(
            ["address", "address"],
            [receiver.address, await dexToken.getAddress()]
          )
          .slice(2);

      const create2Addr = hre.ethers.getCreate2Address(
        await factory.getAddress(),
        salt,
        hre.ethers.keccak256(initCode)
      );

      await dexToken.connect(payer).transfer(create2Addr, 100n);
      expect(await dexToken.balanceOf(create2Addr)).to.equal(100n);

      await factory.deploy(initCode, salt);

      expect(await dexToken.balanceOf(create2Addr)).to.equal(0);
      expect(await dexToken.balanceOf(receiver.address)).to.equal(
        preReceiverBalance + 100n
      );
    });
  });
});
