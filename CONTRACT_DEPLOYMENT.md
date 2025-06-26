# 修仙游戏智能合约部署指南

## 📋 概述

这个智能合约用于存储修仙游戏的玩家数据，包括：
- 钱包地址
- 昵称/道号
- 等级
- 修为
- 功力
- 经验值
- 最后登录时间

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的私钥和 RPC URL
```

### 3. 编译合约

```bash
npm run compile
```

### 4. 部署合约

#### 本地测试网络
```bash
# 启动本地节点
npm run node

# 在新终端中部署
npm run deploy:localhost
```

#### Sepolia 测试网络
```bash
npm run deploy:sepolia
```

#### Polygon Mumbai 测试网络
```bash
npm run deploy:mumbai
```

### 5. 更新合约地址

部署成功后，将输出的合约地址复制到 `src/contracts/XiuxianGameABI.js` 文件中：

```javascript
export const XIUXIAN_GAME_ADDRESS = "0x你的合约地址"
```

## 🎮 游戏功能

### 新玩家注册
- 连接钱包后，如果是新玩家会弹出昵称输入框
- 输入昵称后会调用智能合约注册新角色
- 初始属性：等级1，修为0，功力10，经验0

### 数据同步
- 游戏数据每30秒自动同步到区块链
- 玩家登录时会从区块链读取最新数据
- 支持多设备数据同步

### 排行榜
- 智能合约提供排行榜功能
- 按等级排序显示前10名玩家
- 实时更新玩家排名

## 📊 合约功能

### 主要方法

1. **registerPlayer(nickname)** - 注册新玩家
2. **playerExists(address)** - 检查玩家是否存在
3. **getMyPlayer()** - 获取当前玩家信息
4. **updatePlayer(level, cultivation, power, experience)** - 更新玩家数据
5. **login()** - 记录玩家登录
6. **getLeaderboard(limit)** - 获取排行榜

### 事件

1. **PlayerRegistered** - 玩家注册事件
2. **PlayerUpdated** - 玩家数据更新事件
3. **PlayerLogin** - 玩家登录事件

## 🔧 开发说明

### 合约结构

```solidity
struct Player {
    string nickname;      // 昵称
    uint256 level;       // 等级
    uint256 cultivation; // 修为
    uint256 power;       // 功力
    uint256 experience;  // 经验值
    uint256 lastLoginTime; // 最后登录时间
    bool exists;         // 是否存在
}
```

### 安全特性

- 使用 modifier 确保只有存在的玩家才能更新数据
- 昵称长度限制（1-20字符）
- 防止重复注册
- 事件日志记录所有重要操作

## 🌐 支持的网络

- **本地开发**: Hardhat 本地网络
- **Sepolia**: 以太坊测试网络
- **Mumbai**: Polygon 测试网络
- **BSC Testnet**: 币安智能链测试网络

## 💡 使用建议

1. **测试环境**: 建议先在测试网络部署和测试
2. **Gas 优化**: 合约已启用优化器，减少 Gas 消耗
3. **数据备份**: 重要数据会永久存储在区块链上
4. **版本管理**: 合约部署后不可修改，请谨慎测试

## 🔍 故障排除

### 常见问题

1. **部署失败**: 检查私钥和 RPC URL 是否正确
2. **Gas 不足**: 确保钱包有足够的测试币
3. **网络连接**: 检查网络连接和 RPC 节点状态
4. **合约调用失败**: 确保合约地址正确且已部署

### 获取测试币

- **Sepolia**: https://sepoliafaucet.com/
- **Mumbai**: https://faucet.polygon.technology/
- **BSC Testnet**: https://testnet.binance.org/faucet-smart

## 📞 技术支持

如果遇到问题，请检查：
1. 环境变量配置
2. 网络连接状态
3. 钱包余额
4. 合约地址是否正确

---

🎉 **祝你修仙之路顺利！**
