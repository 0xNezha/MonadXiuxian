const { ethers } = require("hardhat");

async function main() {
  console.log("开始测试修仙游戏合约...");

  // 获取合约实例
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const XiuxianGame = await ethers.getContractFactory("XiuxianGame");
  const game = XiuxianGame.attach(contractAddress);

  // 获取测试账户
  const [owner, player1, player2] = await ethers.getSigners();
  
  console.log("测试账户:");
  console.log("Owner:", owner.address);
  console.log("Player1:", player1.address);
  console.log("Player2:", player2.address);

  try {
    // 测试1: 注册玩家
    console.log("\n=== 测试玩家注册 ===");
    
    // 玩家1注册
    const tx1 = await game.connect(player1).registerPlayer("剑仙李白");
    await tx1.wait();
    console.log("玩家1注册成功: 剑仙李白");

    // 玩家2注册
    const tx2 = await game.connect(player2).registerPlayer("道士张三丰");
    await tx2.wait();
    console.log("玩家2注册成功: 道士张三丰");

    // 测试2: 获取玩家信息
    console.log("\n=== 测试获取玩家信息 ===");
    const player1Data = await game.getPlayer(player1.address);
    const player2Data = await game.getPlayer(player2.address);
    
    console.log("玩家1信息:", {
      道号: player1Data.daoHao,
      等级: Number(player1Data.level),
      修为: Number(player1Data.xiuwei),
      血量: Number(player1Data.health),
      攻击力: Number(player1Data.attack),
      防御力: Number(player1Data.defense),
      金币: Number(player1Data.gold)
    });

    console.log("玩家2信息:", {
      道号: player2Data.daoHao,
      等级: Number(player2Data.level),
      修为: Number(player2Data.xiuwei),
      血量: Number(player2Data.health),
      攻击力: Number(player2Data.attack),
      防御力: Number(player2Data.defense),
      金币: Number(player2Data.gold)
    });

    // 测试3: 更新玩家属性
    console.log("\n=== 测试更新玩家属性 ===");
    const tx3 = await game.connect(player1).updatePlayer(150, 100, 120);
    await tx3.wait();
    console.log("玩家1属性更新成功");

    // 测试4: 突破境界
    console.log("\n=== 测试突破境界 ===");
    const tx4 = await game.connect(player1).breakthrough();
    await tx4.wait();
    console.log("玩家1突破境界成功");

    // 获取更新后的玩家信息
    const updatedPlayer1 = await game.getPlayer(player1.address);
    console.log("突破后玩家1信息:", {
      道号: updatedPlayer1.daoHao,
      等级: Number(updatedPlayer1.level),
      修为: Number(updatedPlayer1.xiuwei),
      血量: Number(updatedPlayer1.health),
      攻击力: Number(updatedPlayer1.attack),
      防御力: Number(updatedPlayer1.defense)
    });

    // 测试5: 运功疗伤
    console.log("\n=== 测试运功疗伤 ===");
    const tx5 = await game.connect(player1).heal();
    await tx5.wait();
    console.log("玩家1运功疗伤成功");

    // 测试6: PVP挑战
    console.log("\n=== 测试PVP挑战 ===");
    const tx6 = await game.connect(player1).challengePlayer(player2.address);
    await tx6.wait();
    console.log("玩家1挑战玩家2成功");

    // 测试7: 获取排行榜
    console.log("\n=== 测试排行榜 ===");
    const leaderboard = await game.getLeaderboard();
    const [addresses, players] = leaderboard;
    
    console.log("排行榜:");
    for (let i = 0; i < addresses.length; i++) {
      if (players[i].isRegistered) {
        console.log(`${i + 1}. ${players[i].daoHao} (等级${Number(players[i].level)}) - 胜场:${Number(players[i].wins)} 负场:${Number(players[i].losses)}`);
      }
    }

    // 测试8: 添加物品
    console.log("\n=== 测试添加物品 ===");
    const tx7 = await game.addItem(player1.address, "青钢剑", 1, 15, 0, 50);
    await tx7.wait();
    const tx8 = await game.addItem(player1.address, "道袍", 2, 0, 10, 30);
    await tx8.wait();
    console.log("为玩家1添加物品成功");

    // 测试9: 获取玩家物品
    console.log("\n=== 测试获取玩家物品 ===");
    const items = await game.getPlayerItems(player1.address);
    console.log("玩家1的物品:");
    items.forEach((item, index) => {
      console.log(`${index}. ${item.name} (类型:${Number(item.itemType)}) 攻击+${Number(item.attackBonus)} 防御+${Number(item.defenseBonus)} 价值:${Number(item.value)}`);
    });

    // 测试10: 装备物品
    console.log("\n=== 测试装备物品 ===");
    const tx9 = await game.connect(player1).equipItem(0); // 装备第一个物品
    await tx9.wait();
    console.log("玩家1装备物品成功");

    // 获取装备后的玩家信息
    const equippedPlayer1 = await game.getPlayer(player1.address);
    console.log("装备后玩家1信息:", {
      道号: equippedPlayer1.daoHao,
      等级: Number(equippedPlayer1.level),
      攻击力: Number(equippedPlayer1.attack),
      防御力: Number(equippedPlayer1.defense)
    });

    console.log("\n✅ 所有测试完成！合约功能正常");

  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
