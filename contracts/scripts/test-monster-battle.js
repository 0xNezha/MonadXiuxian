const { ethers } = require("hardhat");

async function main() {
  console.log("测试怪物战斗系统...");

  // 获取合约实例
  const contractAddress = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
  const XiuxianGame = await ethers.getContractFactory("XiuxianGame");
  const game = XiuxianGame.attach(contractAddress);

  // 获取测试账户
  const [owner] = await ethers.getSigners();
  
  console.log("使用账户:", owner.address);

  try {
    // 注册玩家
    console.log("注册玩家...");
    const registerTx = await game.registerPlayer("BattleTestPlayer");
    await registerTx.wait();
    console.log("✅ 玩家注册成功");

    // 获取玩家信息
    let player = await game.getPlayer(owner.address);
    console.log("\n玩家信息:");
    console.log("- 道号:", player.daoHao);
    console.log("- 等级:", Number(player.level));
    console.log("- 修为:", Number(player.xiuwei));
    console.log("- 血量:", Number(player.health));
    console.log("- 攻击力:", Number(player.attack));
    console.log("- 防御力:", Number(player.defense));
    console.log("- 金币:", Number(player.gold));

    // 初始化怪物
    console.log("\n初始化怪物...");
    const initTx = await game.initializeMonsters();
    await initTx.wait();
    console.log("✅ 怪物初始化成功");

    // 获取怪物列表
    const monsters = await game.getMonsters();
    console.log("\n怪物列表:");
    for (let i = 0; i < monsters.length; i++) {
      const monster = monsters[i];
      console.log(`${i}. ${monster.name}`);
      console.log(`   - 等级: ${Number(monster.level)}`);
      console.log(`   - 血量: ${Number(monster.maxHealth)}`);
      console.log(`   - 攻击力: ${Number(monster.attack)}`);
      console.log(`   - 防御力: ${Number(monster.defense)}`);
    }

    // 测试生成随机怪物
    console.log("\n生成随机怪物...");
    const randomMonster = await game.generateRandomMonster();
    console.log("随机怪物:", randomMonster.name);
    console.log("- 血量:", Number(randomMonster.currentHealth));

    // 测试战斗 - 攻击史莱姆 (最弱的怪物)
    console.log("\n开始战斗 - 攻击史莱姆...");
    const goldBefore = Number(player.gold);
    const xiuweiBefore = Number(player.xiuwei);
    const healthBefore = Number(player.health);
    
    const battleTx = await game.attackMonster(0); // 攻击史莱姆
    const receipt = await battleTx.wait();
    
    console.log("✅ 战斗完成!");

    // 查找战斗事件
    const battleEvents = receipt.logs.filter(log => {
      try {
        const parsed = game.interface.parseLog(log);
        return ['BattleStarted', 'BattleAction', 'BattleEnded'].includes(parsed.name);
      } catch (e) {
        return false;
      }
    });

    console.log("\n战斗事件:");
    for (const event of battleEvents) {
      const parsed = game.interface.parseLog(event);
      if (parsed.name === 'BattleStarted') {
        console.log(`- 战斗开始: vs ${parsed.args.monsterName}`);
      } else if (parsed.name === 'BattleAction') {
        console.log(`- ${parsed.args.action}: 伤害 ${Number(parsed.args.damage)}, 玩家血量 ${Number(parsed.args.playerHealth)}, 怪物血量 ${Number(parsed.args.monsterHealth)}`);
      } else if (parsed.name === 'BattleEnded') {
        console.log(`- 战斗结束: 玩家${parsed.args.playerWon ? '获胜' : '失败'}`);
        if (parsed.args.playerWon) {
          console.log(`  奖励: ${Number(parsed.args.reward)} 金币`);
          if (parsed.args.item) {
            console.log(`  物品: ${parsed.args.item}`);
          }
        }
      }
    }

    // 获取战斗后的玩家信息
    player = await game.getPlayer(owner.address);
    console.log("\n战斗后玩家状态:");
    console.log("- 金币变化:", Number(player.gold) - goldBefore);
    console.log("- 修为变化:", Number(player.xiuwei) - xiuweiBefore);
    console.log("- 血量变化:", Number(player.health) - healthBefore);

    // 获取战斗日志
    const battleLogs = await game.getBattleLogs(owner.address);
    console.log("\n战斗日志:");
    for (let i = 0; i < battleLogs.length; i++) {
      console.log(`${i + 1}. ${battleLogs[i]}`);
    }

    // 获取物品列表检查是否有新物品
    const items = await game.getPlayerItems(owner.address);
    console.log("\n当前物品数量:", items.length);
    
    if (items.length > 6) { // 初始6件物品
      console.log("新获得物品:");
      for (let i = 6; i < items.length; i++) {
        console.log(`- ${items[i].name} (价值: ${Number(items[i].value)} 金币)`);
      }
    }

    // 测试连续战斗
    console.log("\n连续战斗测试...");
    let battleCount = 1;
    
    for (let i = 0; i < 3; i++) {
      if (Number(player.health) === 0) {
        console.log("玩家血量为0，停止战斗");
        break;
      }
      
      try {
        console.log(`第${battleCount + 1}次战斗...`);
        const tx = await game.attackMonster(0); // 继续攻击史莱姆
        await tx.wait();
        battleCount++;
        
        // 更新玩家状态
        player = await game.getPlayer(owner.address);
        console.log(`战斗${battleCount}完成，当前血量: ${Number(player.health)}`);
        
      } catch (error) {
        console.log("战斗失败:", error.message);
        break;
      }
    }

    // 最终状态
    player = await game.getPlayer(owner.address);
    const finalItems = await game.getPlayerItems(owner.address);
    const finalLogs = await game.getBattleLogs(owner.address);
    
    console.log("\n最终状态:");
    console.log("- 等级:", Number(player.level));
    console.log("- 修为:", Number(player.xiuwei));
    console.log("- 血量:", Number(player.health));
    console.log("- 金币:", Number(player.gold));
    console.log("- 物品数量:", finalItems.length);
    console.log("- 战斗日志条数:", finalLogs.length);
    console.log("- 完成战斗次数:", battleCount);

    console.log("\n✅ 怪物战斗系统测试完成！");

  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
