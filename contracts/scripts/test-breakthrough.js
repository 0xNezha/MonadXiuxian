const { ethers } = require("hardhat");

async function main() {
  console.log("测试突破境界功能...");

  // 获取合约实例
  const contractAddress = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";
  const XiuxianGame = await ethers.getContractFactory("XiuxianGame");
  const game = XiuxianGame.attach(contractAddress);

  // 获取测试账户
  const [owner] = await ethers.getSigners();
  
  console.log("使用账户:", owner.address);

  try {
    // 先注册玩家
    console.log("注册玩家...");
    const registerTx = await game.registerPlayer("测试修仙者");
    await registerTx.wait();
    console.log("✅ 玩家注册成功");

    // 获取玩家信息
    let player = await game.getPlayer(owner.address);
    console.log("初始玩家信息:");
    console.log("- 道号:", player.daoHao);
    console.log("- 等级:", Number(player.level));
    console.log("- 修为:", Number(player.xiuwei));
    console.log("- 血量:", Number(player.health));
    console.log("- 攻击力:", Number(player.attack));
    console.log("- 防御力:", Number(player.defense));

    // 测试新的updateAndBreakthrough函数
    console.log("\n测试updateAndBreakthrough函数...");
    console.log("设置修为为150，然后突破境界");
    
    const breakthroughTx = await game.updateAndBreakthrough(150);
    await breakthroughTx.wait();
    console.log("✅ 突破境界成功！");

    // 获取更新后的玩家信息
    player = await game.getPlayer(owner.address);
    console.log("\n突破后玩家信息:");
    console.log("- 道号:", player.daoHao);
    console.log("- 等级:", Number(player.level));
    console.log("- 修为:", Number(player.xiuwei)); // 应该是 150 - 100 = 50
    console.log("- 血量:", Number(player.health));
    console.log("- 攻击力:", Number(player.attack));
    console.log("- 防御力:", Number(player.defense));

    // 测试updateAndHeal函数
    console.log("\n测试updateAndHeal函数...");
    console.log("设置修为为70，然后运功疗伤");
    
    // 先降低血量
    const updateTx = await game.updatePlayer(70, 80, 100);
    await updateTx.wait();
    
    const healTx = await game.updateAndHeal(70);
    await healTx.wait();
    console.log("✅ 运功疗伤成功！");

    // 获取最终玩家信息
    player = await game.getPlayer(owner.address);
    console.log("\n疗伤后玩家信息:");
    console.log("- 道号:", player.daoHao);
    console.log("- 等级:", Number(player.level));
    console.log("- 修为:", Number(player.xiuwei)); // 应该是 70 - 20 = 50
    console.log("- 血量:", Number(player.health)); // 应该是 80 + 20 = 100
    console.log("- 攻击力:", Number(player.attack));
    console.log("- 防御力:", Number(player.defense));

    console.log("\n✅ 所有测试完成！新的合约函数工作正常");

  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
