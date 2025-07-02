const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("Deploying XiuxianGame contract...");

  const XiuxianGame = await ethers.getContractFactory("XiuxianGame");
  const xiuxianGame = await XiuxianGame.deploy();

  await xiuxianGame.waitForDeployment();

  console.log(`XiuxianGame deployed to: ${xiuxianGame.target}`);
  
  // 创建前端contracts目录
  const contractsDir = path.join(__dirname, '../../frontend/src/contracts');
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }
  
  // 保存合约地址到文件
  const contractAddress = {
    XiuxianGame: xiuxianGame.target
  };
  
  fs.writeFileSync(
    path.join(contractsDir, 'addresses.json'),
    JSON.stringify(contractAddress, null, 2)
  );
  
  console.log("Contract address saved to frontend/src/contracts/addresses.json");
  
  // 复制ABI文件
  const artifactsDir = path.join(__dirname, '../artifacts/contracts/XiuxianGame.sol');
  const abiSource = path.join(artifactsDir, 'XiuxianGame.json');
  const abiDest = path.join(contractsDir, 'XiuxianGame.json');
  
  if (fs.existsSync(abiSource)) {
    fs.copyFileSync(abiSource, abiDest);
    console.log("ABI file copied to frontend/src/contracts/XiuxianGame.json");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
