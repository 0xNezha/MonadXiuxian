const { ethers } = require("hardhat");

async function main() {
  console.log("调试玩家状态...");

  // 获取合约实例
  const contractAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
  const XiuxianGame = await ethers.getContractFactory("XiuxianGame");
  const game = XiuxianGame.attach(contractAddress);

  // 获取测试账户
  const [owner, player1, player2] = await ethers.getSigners();

  console.log("可用账户:");
  console.log("- Owner:", owner.address);
  console.log("- Player1:", player1.address);
  console.log("- Player2:", player2.address);

  // 检查所有账户的注册状态
  console.log("\n检查所有账户的注册状态:");
  const accounts = [owner, player1, player2];
  const accountNames = ["Owner", "Player1", "Player2"];

  for (let i = 0; i < accounts.length; i++) {
    const player = await game.getPlayer(accounts[i].address);
    console.log(`${accountNames[i]} (${accounts[i].address}): 注册=${player.isRegistered}, 道号="${player.daoHao}", 修为=${Number(player.xiuwei)}`);
  }

  console.log("\n=== 详细检查第一个注册的玩家 ===");

  try {
    // 找到第一个注册的玩家
    let registeredPlayer = null;
    let registeredAccount = null;

    for (let i = 0; i < accounts.length; i++) {
      const player = await game.getPlayer(accounts[i].address);
      if (player.isRegistered) {
        registeredPlayer = player;
        registeredAccount = accounts[i];
        console.log(`使用已注册的账户: ${accountNames[i]} (${accounts[i].address})`);
        break;
      }
    }

    if (!registeredPlayer) {
      console.log("❌ 没有找到已注册的玩家");
      return;
    }

    // 获取玩家信息
    const player = registeredPlayer;
    
    console.log("玩家信息:");
    console.log("- 道号:", player.daoHao);
    console.log("- 是否注册:", player.isRegistered);
    console.log("- 等级:", Number(player.level));
    console.log("- 修为:", Number(player.xiuwei));
    console.log("- 血量:", Number(player.health));
    console.log("- 最大血量:", Number(player.maxHealth));
    console.log("- 攻击力:", Number(player.attack));
    console.log("- 防御力:", Number(player.defense));
    console.log("- 金币:", Number(player.gold));
    console.log("- 胜场:", Number(player.wins));
    console.log("- 负场:", Number(player.losses));

    // 检查是否可以突破
    if (Number(player.xiuwei) >= 100) {
      console.log("\n✅ 修为足够，可以突破境界");
      
      // 尝试突破
      console.log("尝试突破境界...");
      const tx = await game.connect(registeredAccount).breakthrough();
      await tx.wait();
      console.log("✅ 突破成功！");

      // 获取更新后的玩家信息
      const updatedPlayer = await game.getPlayer(registeredAccount.address);
      console.log("\n突破后玩家信息:");
      console.log("- 等级:", Number(updatedPlayer.level));
      console.log("- 修为:", Number(updatedPlayer.xiuwei));
      console.log("- 血量:", Number(updatedPlayer.health));
      console.log("- 攻击力:", Number(updatedPlayer.attack));
      console.log("- 防御力:", Number(updatedPlayer.defense));
      
    } else {
      console.log("\n❌ 修为不足，无法突破境界");
      console.log("需要修为: 100");
      console.log("当前修为:", Number(player.xiuwei));
      console.log("还需要:", 100 - Number(player.xiuwei));
    }

  } catch (error) {
    console.error("❌ 调试失败:", error.message);
    
    // 如果是revert错误，尝试解析原因
    if (error.message.includes("revert")) {
      console.log("\n可能的原因:");
      console.log("1. 玩家未注册");
      console.log("2. 修为不足100");
      console.log("3. 合约状态异常");
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
