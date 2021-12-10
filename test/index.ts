import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, BigNumber, Signer } from "ethers";

describe("V2Proposal", function () {
  let contract: Contract;
  let nemo: Contract;
  let signers: Array<Signer>;

  beforeEach(async () => {
    signers = await ethers.getSigners();

    const nemo_ = await ethers.getContractFactory("NeonMonsters");
    nemo = await nemo_.deploy();
    await nemo.deployed();

    const contract_ = await ethers.getContractFactory("V2Proposal");
    contract = await contract_.deploy(nemo.address);
    await contract.deployed();
  });

  it("Should be deployed", async () => {
    const results = await contract.results();

    expect(results).to.be.eql([BigNumber.from("0"), BigNumber.from("0")]);
  });

  it("Should not vote if under the balance", async () => {
    await expect(contract.vote(0)).to.be.revertedWith(
      "V2Proposal: have no right to vote"
    );
  });

  it("Should not vote twice", async () => {
    for (let i = 0; i < 55; i++) {
      await nemo.mint(await signers[0].getAddress());
    }

    await contract.connect(signers[0]).vote(1);
    await expect(contract.connect(signers[0]).vote(1)).to.be.revertedWith(
      "V2Proposal: already voted"
    );
  });

  it("Should see results", async () => {
    let i = 0;
    while (i < 999) {
      const addrsIndex: number = parseInt((i / 50).toString());

      await nemo
        .connect(signers[addrsIndex])
        .mint(await signers[addrsIndex].getAddress());

      const vote = Math.floor(Math.random() * (1 - 0 + 1) + 0);

      if (
        parseInt(
          (
            await nemo.balanceOf(await signers[addrsIndex].getAddress())
          ).toString()
        ) >= 50
      )
        await contract.connect(signers[addrsIndex]).vote(vote);

      process.stdout.write(`\r    > Mint index: ${i}`);
      i++;
    }
    console.log("");

    const [yes_, no_] = await contract.results();
    const yes = yes_.toNumber();
    const no = no_.toNumber();

    const sum = yes + no;

    const yesFractional = (yes / sum) * 100;
    const noFractional = (no / sum) * 100;

    process.stdout.write(
      `\r    > YES: ${yesFractional.toFixed(2)}% NO: ${noFractional.toFixed(
        2
      )}%\n`
    );

    expect(yesFractional + noFractional).to.be.equal(100);
  });
});
