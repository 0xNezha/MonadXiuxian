const { ethers } = require("hardhat");

async function main() {
  console.log("测试初始物品功能...");

  // 获取合约实例
  const contractAddress = "0x2bdCC0de6bE1f7D2ee689a0342D76F52E8EFABa3";
  const XiuxianGame = await ethers.getContractFactory("XiuxianGame");
  const game = XiuxianGame.attach(contractAddress);

  // 获取测试账户
  const [owner] = await ethers.getSigners();
  
  console.log("使用账户:", owner.address);

  try {
    // 注册玩家
    console.log("注册玩家...");
    const registerTx = await game.registerPlayer("TestPlayer");
    await registerTx.wait();
    console.log("✅ 玩家注册成功");

    // 获取玩家信息
    const player = await game.getPlayer(owner.address);
    console.log("\n玩家信息:");
    console.log("- 道号:", player.daoHao);
    console.log("- 等级:", Number(player.level));
    console.log("- 修为:", Number(player.xiuwei));
    console.log("- 血量:", Number(player.health));
    console.log("- 攻击力:", Number(player.attack)); // 应该包含装备加成
    console.log("- 防御力:", Number(player.defense)); // 应该包含装备加成
    console.log("- 金币:", Number(player.gold));

    // 获取玩家物品
    const items = await game.getPlayerItems(owner.address);
    console.log("\n初始物品列表:");
    
    const itemTypes = ["", "武器", "衣服", "饰品", "书籍", "材料"];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`${i + 1}. ${item.name}`);
      console.log(`   - 类型: ${itemTypes[Number(item.itemType)]}`);
      console.log(`   - 攻击力加成: ${Number(item.attackBonus)}`);
      console.log(`   - 防御力加成: ${Number(item.defenseBonus)}`);
      console.log(`   - 价值: ${Number(item.value)}`);
      console.log(`   - 已装备: ${item.isEquipped ? "是" : "否"}`);
      console.log("");
    }

    // 验证装备加成
    console.log("验证装备加成:");
    const baseAttack = 10; // 基础攻击力
    const baseDefense = 5; // 基础防御力
    
    let totalAttackBonus = 0;
    let totalDefenseBonus = 0;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].isEquipped) {
        totalAttackBonus += Number(items[i].attackBonus);
        totalDefenseBonus += Number(items[i].defenseBonus);
      }
    }
    
    console.log(`- 基础攻击力: ${baseAttack}`);
    console.log(`- 装备攻击力加成: ${totalAttackBonus}`);
    console.log(`- 总攻击力: ${baseAttack + totalAttackBonus} (实际: ${Number(player.attack)})`);
    console.log(`- 基础防御力: ${baseDefense}`);
    console.log(`- 装备防御力加成: ${totalDefenseBonus}`);
    console.log(`- 总防御力: ${baseDefense + totalDefenseBonus} (实际: ${Number(player.defense)})`);

    // 验证装备状态
    console.log("\n装备槽位状态:");
    const weaponEquipped = await game.equippedItems(owner.address, 1);
    const armorEquipped = await game.equippedItems(owner.address, 2);
    const accessoryEquipped = await game.equippedItems(owner.address, 3);
    
    console.log(`- 武器槽: ${weaponEquipped ? "已装备" : "未装备"}`);
    console.log(`- 衣服槽: ${armorEquipped ? "已装备" : "未装备"}`);
    console.log(`- 饰品槽: ${accessoryEquipped ? "已装备" : "未装备"}`);

    console.log("\n✅ 初始物品功能测试完成！");

  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
