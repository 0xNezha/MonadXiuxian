const { ethers } = require("hardhat");

async function main() {
  console.log("测试出售物品功能...");

  // 获取合约实例
  const contractAddress = "0x09635F643e140090A9A8Dcd712eD6285858ceBef";
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
      const registerTx = await game.registerPlayer("TestPlayer");
      await registerTx.wait();
      console.log("✅ 玩家注册成功");
    } else {
      console.log("✅ 玩家已注册");
    }

    // 获取初始玩家信息
    player = await game.getPlayer(owner.address);
    console.log("\n初始玩家信息:");
    console.log("- 道号:", player.daoHao);
    console.log("- 等级:", Number(player.level));
    console.log("- 修为:", Number(player.xiuwei));
    console.log("- 血量:", Number(player.health));
    console.log("- 金币:", Number(player.gold));

    // 获取玩家物品
    let items = await game.getPlayerItems(owner.address);
    console.log("\n初始物品列表:");
    
    const itemTypes = ["", "武器", "衣服", "饰品", "书籍", "材料"];
    let totalValue = 0;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`${i}. ${item.name} (${itemTypes[Number(item.itemType)]}) - 价值: ${Number(item.value)} 金币`);
      totalValue += Number(item.value);
    }
    
    console.log(`总物品价值: ${totalValue} 金币`);

    // 测试出售第一个物品（新手木剑）
    console.log("\n测试出售物品...");
    const firstItem = items[0];
    console.log(`准备出售: ${firstItem.name} (价值: ${Number(firstItem.value)} 金币)`);
    console.log("出售前金币:", Number(player.gold));
    
    const sellTx = await game.sellItem(0);
    await sellTx.wait();
    console.log("✅ 物品出售成功！");
    
    // 获取更新后的玩家信息
    player = await game.getPlayer(owner.address);
    console.log("出售后金币:", Number(player.gold));
    console.log("金币增加:", Number(player.gold) - 100, `(应该是${Number(firstItem.value)})`);

    // 获取更新后的物品列表
    items = await game.getPlayerItems(owner.address);
    console.log("\n出售后物品列表:");
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`${i}. ${item.name} (${itemTypes[Number(item.itemType)]}) - 价值: ${Number(item.value)} 金币`);
    }

    // 测试出售已装备的物品（应该失败）
    console.log("\n测试出售已装备的物品...");

    // 找到一个可以装备的物品（武器、衣服或饰品）
    let equipableIndex = -1;
    for (let i = 0; i < items.length; i++) {
      const itemType = Number(items[i].itemType);
      if (itemType >= 1 && itemType <= 3) {
        equipableIndex = i;
        break;
      }
    }

    if (equipableIndex === -1) {
      console.log("❌ 没有可装备的物品");
      return;
    }

    console.log(`装备物品: ${items[equipableIndex].name}`);
    const equipTx = await game.equipItem(equipableIndex);
    await equipTx.wait();
    console.log("✅ 物品装备成功");
    
    try {
      const sellEquippedTx = await game.sellItem(equipableIndex); // 尝试出售已装备的物品
      await sellEquippedTx.wait();
      console.log("❌ 不应该能出售已装备的物品");
    } catch (error) {
      console.log("✅ 正确阻止了出售已装备的物品:", error.message.includes("Cannot sell equipped item"));
    }

    // 再出售一个未装备的物品
    console.log("\n出售另一个未装备的物品...");
    items = await game.getPlayerItems(owner.address);
    let unequippedIndex = -1;
    for (let i = 0; i < items.length; i++) {
      if (!items[i].isEquipped) {
        unequippedIndex = i;
        break;
      }
    }
    
    if (unequippedIndex !== -1) {
      const itemToSell = items[unequippedIndex];
      console.log(`出售: ${itemToSell.name} (价值: ${Number(itemToSell.value)} 金币)`);
      
      player = await game.getPlayer(owner.address);
      const goldBefore = Number(player.gold);
      
      const sellTx2 = await game.sellItem(unequippedIndex);
      await sellTx2.wait();
      console.log("✅ 第二个物品出售成功！");
      
      player = await game.getPlayer(owner.address);
      console.log("出售前金币:", goldBefore);
      console.log("出售后金币:", Number(player.gold));
      console.log("金币增加:", Number(player.gold) - goldBefore, `(应该是${Number(itemToSell.value)})`);
    }

    // 获取最终状态
    player = await game.getPlayer(owner.address);
    items = await game.getPlayerItems(owner.address);
    
    console.log("\n最终状态:");
    console.log("- 金币:", Number(player.gold));
    console.log("- 剩余物品数量:", items.length);
    
    console.log("\n✅ 出售物品功能测试完成！");

  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
