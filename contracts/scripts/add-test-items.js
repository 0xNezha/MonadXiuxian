const { ethers } = require("hardhat");

async function main() {
  console.log("为玩家添加测试物品...");

  // 获取合约实例
  const contractAddress = "0x4A679253410272dd5232B3Ff7cF5dbB88f295319";
  const XiuxianGame = await ethers.getContractFactory("XiuxianGame");
  const game = XiuxianGame.attach(contractAddress);

  // 获取测试账户
  const [owner, player1] = await ethers.getSigners();
  
  console.log("为玩家添加物品:", player1.address);

  try {
    // 添加武器
    const tx1 = await game.addItem(player1.address, "青钢剑", 1, 15, 0, 50);
    await tx1.wait();
    console.log("添加武器: 青钢剑");

    const tx2 = await game.addItem(player1.address, "烈焰刀", 1, 20, 0, 80);
    await tx2.wait();
    console.log("添加武器: 烈焰刀");

    // 添加防具
    const tx3 = await game.addItem(player1.address, "道袍", 2, 0, 10, 30);
    await tx3.wait();
    console.log("添加防具: 道袍");

    const tx4 = await game.addItem(player1.address, "护心镜", 3, 0, 8, 25);
    await tx4.wait();
    console.log("添加饰品: 护心镜");

    // 添加书籍和材料
    const tx5 = await game.addItem(player1.address, "修炼心得", 4, 0, 0, 20);
    await tx5.wait();
    console.log("添加书籍: 修炼心得");

    const tx6 = await game.addItem(player1.address, "回血丹", 5, 0, 0, 15);
    await tx6.wait();
    console.log("添加材料: 回血丹");

    console.log("✅ 测试物品添加完成！");

  } catch (error) {
    console.error("❌ 添加物品失败:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
