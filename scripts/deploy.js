const { ethers, run, network } = require("hardhat");

async function main() {
  // Получаем аккаунт деплойера
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contract with account: ${deployer.address}`);

  // Получаем фабрику контракта AuthMessageContract
  const AuthMessageContract = await ethers.getContractFactory(
    "AuthMessageContract"
  );
  // Разворачиваем контракт (конструктор не принимает аргументов)
  const contract = await AuthMessageContract.deploy();
  // Ожидаем завершения развертывания (новый метод в Hardhat вместо deployed())
  await contract.waitForDeployment();

  // Получаем адрес развернутого контракта
  const contractAddress = await contract.getAddress();
  console.log(`AuthMessageContract deployed at: ${contractAddress}`);

  // Верификация контракта на Etherscan (если сеть Sepolia и указан ETHERSCAN_API_KEY)
  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for 6 confirmations before verification...");
    await contract.deploymentTransaction().wait(6);
    await verify(contractAddress, []);
  }
}

async function verify(contractAddress, args) {
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
    console.log("Contract verified on Etherscan!");
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Contract is already verified.");
    } else {
      console.error(e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
