# 修仙挂机游戏 (Xiuxian Idle Game)

一个基于区块链的文字挂机修仙类游戏，使用React前端和Solidity智能合约构建。

## 🎮 游戏特色

- **区块链驱动**: 所有游戏数据存储在智能合约中，确保数据透明和永久性
- **钱包登录**: 通过连接Web3钱包进行游戏登录
- **修炼系统**: 自动增加修为，突破境界提升等级
- **战斗系统**: PVE冒险和PVP征战
- **物品系统**: 装备管理和使用
- **实时聊天**: 基于MultiSYNQ的多人聊天功能
- **排行榜**: 玩家等级和战绩排名

## 🏗️ 技术架构

### 前端
- **React 18**: 现代化的用户界面
- **Vite**: 快速的开发构建工具
- **Wagmi**: Web3钱包连接和区块链交互
- **MultiSYNQ**: 实时多人聊天功能

### 智能合约
- **Solidity**: 智能合约开发语言
- **Hardhat**: 开发、测试和部署框架
- **支持网络**: 本地Hardhat网络和Monad测试网

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- MetaMask 或其他Web3钱包

### 安装和运行

1. **克隆项目**
```bash
git clone <repository-url>
cd MonadXiuxianAugment
```

2. **安装依赖**
```bash
# 安装智能合约依赖
cd contracts
npm install

# 安装前端依赖
cd ../frontend
npm install
```

3. **启动本地区块链网络**
```bash
cd contracts
npx hardhat node
```

4. **部署智能合约**
```bash
# 在新终端中
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

5. **启动前端应用**
```bash
cd frontend
npm run dev
```

6. **访问游戏**
打开浏览器访问 `http://localhost:5173`

## 🎯 游戏玩法

### 基本流程
1. **连接钱包**: 使用MetaMask等钱包连接游戏
2. **注册角色**: 输入道号完成游戏注册
3. **修炼提升**: 修为自动增长，消耗修为突破境界
4. **冒险战斗**: 挑战野外怪物获得奖励
5. **PVP征战**: 挑战其他玩家，争夺排行榜排名
6. **物品管理**: 装备武器和防具提升战力
7. **社交聊天**: 与其他修仙者实时交流

### 游戏界面
- **左侧30%**: 玩家基本属性面板
- **右侧70%**: 五个功能选项卡
  - 修炼: 修为增长和境界突破
  - 物品: 装备和背包管理
  - 冒险: PVE战斗系统
  - 征战: PVP战斗和排行榜
  - 聊天: 实时多人聊天

## 🔧 开发指南

### 智能合约测试
```bash
cd contracts
npx hardhat run scripts/test-game.js --network localhost
```

### 部署到Monad测试网
1. 创建 `.env` 文件并添加私钥:
```bash
PRIVATE_KEY=your_private_key_here
```

2. 部署合约:
```bash
npx hardhat run scripts/deploy.js --network monad
```

### 前端开发
- 修改 `frontend/src/config/wagmi.js` 配置网络
- 组件位于 `frontend/src/components/` 目录
- 样式文件为 `frontend/src/App.css`

## 📋 功能清单

### ✅ 已完成功能
- [x] 项目初始化和基础架构
- [x] 智能合约开发和测试
- [x] 前端基础框架搭建
- [x] 钱包连接和网络切换
- [x] 玩家注册和属性管理
- [x] 修炼系统（自动修为、突破境界、运功疗伤）
- [x] 物品系统（装备管理、穿戴卸下）
- [x] 冒险系统（PVE战斗、战利品）
- [x] 征战系统（PVP战斗、排行榜）
- [x] 聊天系统（MultiSYNQ集成）
- [x] 战斗日志记录
- [x] 响应式UI设计

### 🔄 可扩展功能
- [ ] 更多装备类型和稀有度
- [ ] 公会系统
- [ ] 任务系统
- [ ] NFT集成
- [ ] 代币经济
- [ ] 移动端适配

## 🌐 网络配置

### Monad测试网
- **RPC URL**: https://testnet-rpc.monad.xyz
- **Chain ID**: 10143
- **货币符号**: MON

### 本地开发网络
- **RPC URL**: http://127.0.0.1:8545
- **Chain ID**: 31337

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues
- 游戏内聊天系统

## 📄 许可证

MIT License

---

**开始你的修仙之旅吧！** 🧙‍♂️✨
