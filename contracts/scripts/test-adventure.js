const { ethers } = require("hardhat");

async function main() {
  console.log("测试冒险系统...");

  // 获取合约实例
  const contractAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
  const XiuxianGame = await ethers.getContractFactory("XiuxianGame");
  const game = XiuxianGame.attach(contractAddress);

  // 获取测试账户
  const [owner] = await ethers.getSigners();
  
  console.log("使用账户:", owner.address);

  try {
    // 检查玩家是否已注册
    let player = await game.getPlayer(owner.address);
    if (!player.isRegistered) {
      console.log("注册玩家...");
      const registerTx = await game.registerPlayer("AdventureTestPlayer");
      await registerTx.wait();
      console.log("✅ 玩家注册成功");
    } else {
      console.log("✅ 玩家已注册");
    }

    // 获取玩家信息
    player = await game.getPlayer(owner.address);
    console.log("\n玩家信息:");
    console.log("- 道号:", player.daoHao);
    console.log("- 等级:", Number(player.level));
    console.log("- 修为:", Number(player.xiuwei));
    console.log("- 血量:", Number(player.health));
    console.log("- 金币:", Number(player.gold));

    // 初始化冒险区域
    console.log("\n初始化冒险区域...");
    const initTx = await game.initializeAdventures();
    await initTx.wait();
    console.log("✅ 冒险区域初始化成功");

    // 获取冒险区域列表
    const adventures = await game.getAdventures();
    console.log("\n冒险区域列表:");
    for (let i = 0; i < adventures.length; i++) {
      const adventure = adventures[i];
      console.log(`${i}. ${adventure.name}`);
      console.log(`   - 需要等级: ${Number(adventure.requiredLevel)}`);
      console.log(`   - 消耗体力: ${Number(adventure.energyCost)}`);
      console.log(`   - 基础奖励: ${Number(adventure.baseReward)} 金币`);
      console.log(`   - 风险等级: ${Number(adventure.riskLevel)}`);
    }

    // 获取玩家当前体力
    let energy = await game.getPlayerEnergy(owner.address);
    console.log("\n当前体力:", Number(energy));

    // 测试冒险 - 选择第一个区域（新手村郊外）
    console.log("\n开始冒险 - 新手村郊外...");
    const goldBefore = Number(player.gold);
    const xiuweiBefore = Number(player.xiuwei);
    const healthBefore = Number(player.health);
    
    const adventureTx = await game.startAdventure(0);
    const receipt = await adventureTx.wait();
    
    // 查找AdventureCompleted事件
    const adventureEvent = receipt.logs.find(log => {
      try {
        const parsed = game.interface.parseLog(log);
        return parsed.name === 'AdventureCompleted';
      } catch (e) {
        return false;
      }
    });

    if (adventureEvent) {
      const parsed = game.interface.parseLog(adventureEvent);
      console.log("✅ 冒险完成!");
      console.log("- 成功:", parsed.args.success);
      console.log("- 奖励:", Number(parsed.args.reward), "金币");
      console.log("- 物品奖励:", parsed.args.item || "无");
    }

    // 获取冒险后的玩家信息
    player = await game.getPlayer(owner.address);
    console.log("\n冒险后玩家状态:");
    console.log("- 金币变化:", Number(player.gold) - goldBefore);
    console.log("- 修为变化:", Number(player.xiuwei) - xiuweiBefore);
    console.log("- 血量变化:", Number(player.health) - healthBefore);

    // 检查体力消耗
    energy = await game.getPlayerEnergy(owner.address);
    console.log("- 剩余体力:", Number(energy));

    // 获取物品列表检查是否有新物品
    const items = await game.getPlayerItems(owner.address);
    console.log("- 当前物品数量:", items.length);
    
    if (items.length > 6) { // 初始6件物品
      console.log("- 新获得物品:");
      for (let i = 6; i < items.length; i++) {
        console.log(`  * ${items[i].name} (价值: ${Number(items[i].value)} 金币)`);
      }
    }

    // 尝试连续冒险直到体力不足
    console.log("\n连续冒险测试...");
    let adventureCount = 1;
    
    while (true) {
      energy = await game.getPlayerEnergy(owner.address);
      if (Number(energy) < 1) {
        console.log("体力不足，停止冒险");
        break;
      }
      
      try {
        console.log(`第${adventureCount + 1}次冒险...`);
        const tx = await game.startAdventure(0);
        await tx.wait();
        adventureCount++;
        
        if (adventureCount >= 5) {
          console.log("已完成5次冒险，停止测试");
          break;
        }
      } catch (error) {
        console.log("冒险失败:", error.message);
        break;
      }
    }

    // 最终状态
    player = await game.getPlayer(owner.address);
    energy = await game.getPlayerEnergy(owner.address);
    const finalItems = await game.getPlayerItems(owner.address);
    
    console.log("\n最终状态:");
    console.log("- 等级:", Number(player.level));
    console.log("- 修为:", Number(player.xiuwei));
    console.log("- 血量:", Number(player.health));
    console.log("- 金币:", Number(player.gold));
    console.log("- 体力:", Number(energy));
    console.log("- 物品数量:", finalItems.length);
    console.log("- 完成冒险次数:", adventureCount);

    console.log("\n✅ 冒险系统测试完成！");

  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
