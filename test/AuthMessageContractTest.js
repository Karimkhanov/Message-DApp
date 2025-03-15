const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AuthMessageContract", function () {
  let contract, owner, addr1, addr2;

  // Перед каждым тестом разворачиваем новый экземпляр контракта
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const AuthMessageContract = await ethers.getContractFactory(
      "AuthMessageContract"
    );
    contract = await AuthMessageContract.deploy();
    await contract.waitForDeployment();
  });

  it("✅ Должен установить правильного владельца при развертывании", async function () {
    // Проверяем, что владелец контракта соответствует аккаунту, который его развернул
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("✅ Должен позволять пользователю сохранять и получать своё сообщение", async function () {
    const messageContent = "Hello, decentralized world!";
    // addr1 сохраняет сообщение
    await contract.connect(addr1).storeMessage(messageContent);
    // addr1 получает свои сообщения
    const messages = await contract.connect(addr1).getMessages(addr1.address);
    // Проверяем, что сообщение записалось
    expect(messages.length).to.equal(1);
    const message = messages[0];
    expect(message.content).to.equal(messageContent);
    expect(message.sender).to.equal(addr1.address);
    expect(message.timestamp).to.be.gt(0);
  });

  it("✅ Владелец должен иметь возможность получать сообщения любого пользователя", async function () {
    // addr1 сохраняет два сообщения
    await contract.connect(addr1).storeMessage("First message");
    await contract.connect(addr1).storeMessage("Second message");
    // Владелец получает сообщения addr1
    const messages = await contract.getMessages(addr1.address);
    expect(messages.length).to.equal(2);
    expect(messages[0].content).to.equal("First message");
    expect(messages[1].content).to.equal("Second message");
  });

  it("✅ Должно отклоняться получение сообщений другого пользователя, если вызывающий не владелец", async function () {
    // addr1 сохраняет сообщение
    await contract.connect(addr1).storeMessage("Private message");
    // addr2 пытается получить сообщения addr1, что должно привести к ошибке доступа
    await expect(
      contract.connect(addr2).getMessages(addr1.address)
    ).to.be.revertedWith("Access denied");
  });
});
