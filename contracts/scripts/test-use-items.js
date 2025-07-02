const { ethers } = require("hardhat");

async function main() {
  console.log("测试使用物品功能...");

  // 获取合约实例
  const contractAddress = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";
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
    console.log("- 最大血量:", Number(player.maxHealth));

    // 获取玩家物品
    let items = await game.getPlayerItems(owner.address);
    console.log("\n初始物品列表:");
    
    const itemTypes = ["", "武器", "衣服", "饰品", "书籍", "材料"];
    let bookIndex = -1;
    let potionIndex = -1;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`${i}. ${item.name} (${itemTypes[Number(item.itemType)]})`);
      
      if (item.name === "Basic Cultivation Manual") {
        bookIndex = i;
      }
      if (item.name === "Healing Potion") {
        potionIndex = i;
      }
    }

    // 测试使用书籍（增加100修为）
    if (bookIndex !== -1) {
      console.log("\n测试使用书籍...");
      console.log("使用前修为:", Number(player.xiuwei));
      
      const useBookTx = await game.useItem(bookIndex);
      await useBookTx.wait();
      console.log("✅ 书籍使用成功！");
      
      // 获取更新后的玩家信息
      player = await game.getPlayer(owner.address);
      console.log("使用后修为:", Number(player.xiuwei));
      console.log("修为增加:", Number(player.xiuwei) - 0, "(应该是100)");
    }

    // 先降低血量以便测试药品
    console.log("\n降低血量以便测试药品...");
    const updateTx = await game.updatePlayer(Number(player.xiuwei), 50, Number(player.gold));
    await updateTx.wait();
    
    player = await game.getPlayer(owner.address);
    console.log("降低后血量:", Number(player.health));

    // 重新获取物品列表（因为书籍已被使用）
    items = await game.getPlayerItems(owner.address);
    potionIndex = -1;
    for (let i = 0; i < items.length; i++) {
      if (items[i].name === "Healing Potion") {
        potionIndex = i;
        break;
      }
    }

    // 测试使用药品（恢复50血量）
    if (potionIndex !== -1) {
      console.log("\n测试使用药品...");
      console.log("使用前血量:", Number(player.health));
      
      const usePotionTx = await game.useItem(potionIndex);
      await usePotionTx.wait();
      console.log("✅ 药品使用成功！");
      
      // 获取更新后的玩家信息
      player = await game.getPlayer(owner.address);
      console.log("使用后血量:", Number(player.health));
      console.log("血量恢复:", Number(player.health) - 50, "(应该是50)");
    }

    // 获取最终物品列表
    items = await game.getPlayerItems(owner.address);
    console.log("\n使用后物品列表:");
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`${i}. ${item.name} (${itemTypes[Number(item.itemType)]})`);
    }

    console.log("\n✅ 使用物品功能测试完成！");
    console.log("书籍和药品已被消耗，剩余物品:", items.length, "件");

  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
