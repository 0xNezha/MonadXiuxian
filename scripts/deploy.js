const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署修仙游戏智能合约...");

  // 获取合约工厂
  const XiuxianGame = await ethers.getContractFactory("XiuxianGame");
  
  // 部署合约
  console.log("正在部署合约...");
  const xiuxianGame = await XiuxianGame.deploy();
  
  // 等待部署完成
  await xiuxianGame.deployed();
  
  console.log("✅ 修仙游戏合约部署成功!");
  console.log("📍 合约地址:", xiuxianGame.address);
  console.log("🔗 网络:", network.name);
  
  // 验证部署
  console.log("\n验证合约部署...");
  const totalPlayers = await xiuxianGame.getTotalPlayers();
  console.log("当前玩家总数:", totalPlayers.toString());
  
  console.log("\n🎉 部署完成! 请将以下地址更新到 XiuxianGameABI.js 文件中:");
  console.log(`export const XIUXIAN_GAME_ADDRESS = "${xiuxianGame.address}"`);
  
  // 如果是测试网络，可以创建一些测试数据
  if (network.name !== "mainnet") {
    console.log("\n创建测试数据...");
    
    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    
    // 注册测试玩家
    await xiuxianGame.registerPlayer("测试修仙者");
    console.log("✅ 测试玩家已注册");
    
    // 更新测试数据
    await xiuxianGame.updatePlayer(5, 250, 35, 150);
    console.log("✅ 测试数据已更新");
    
    // 验证数据
    const playerData = await xiuxianGame.getMyPlayer();
    console.log("测试玩家数据:", {
      nickname: playerData[0],
      level: playerData[1].toString(),
      cultivation: playerData[2].toString(),
      power: playerData[3].toString(),
      experience: playerData[4].toString()
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署失败:", error);
    process.exit(1);
  });
