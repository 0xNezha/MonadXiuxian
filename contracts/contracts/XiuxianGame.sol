// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract XiuxianGame {
    // 玩家结构体
    struct Player {
        string daoHao;          // 道号
        uint256 level;          // 等级
        uint256 xiuwei;         // 修为
        uint256 health;         // 血量
        uint256 maxHealth;      // 最大血量
        uint256 attack;         // 攻击力
        uint256 defense;        // 防御力
        uint256 gold;           // 金币
        uint256 wins;           // 胜场数
        uint256 losses;         // 负场数
        bool isRegistered;      // 是否已注册
        uint256 lastUpdateTime; // 最后更新时间
    }

    // 物品结构体
    struct Item {
        string name;            // 物品名称
        uint256 itemType;       // 物品类型 (1:武器, 2:衣服, 3:饰品, 4:书籍, 5:材料)
        uint256 attackBonus;    // 攻击力加成
        uint256 defenseBonus;   // 防御力加成
        uint256 value;          // 价值
        bool isEquipped;        // 是否已装备
    }

    // 状态变量
    mapping(address => Player) public players;
    mapping(address => Item[]) public playerItems;
    mapping(address => mapping(uint256 => bool)) public equippedItems; // 装备槽位 (1:武器, 2:衣服, 3:饰品)
    
    address[] public registeredPlayers;
    
    // 事件
    event PlayerRegistered(address indexed player, string daoHao);
    event PlayerUpdated(address indexed player);
    event ItemObtained(address indexed player, string itemName);
    event BattleResult(address indexed attacker, address indexed defender, bool attackerWon);
    event LevelUp(address indexed player, uint256 newLevel);

    // 修饰符
    modifier onlyRegistered() {
        require(players[msg.sender].isRegistered, "Player not registered");
        _;
    }

    // 注册玩家
    function registerPlayer(string memory _daoHao) external {
        require(!players[msg.sender].isRegistered, "Player already registered");
        require(bytes(_daoHao).length > 0, "Dao hao cannot be empty");

        players[msg.sender] = Player({
            daoHao: _daoHao,
            level: 1,
            xiuwei: 0,
            health: 100,
            maxHealth: 100,
            attack: 10, // 基础攻击力，装备会增加
            defense: 5, // 基础防御力，装备会增加
            gold: 100,
            wins: 0,
            losses: 0,
            isRegistered: true,
            lastUpdateTime: block.timestamp
        });

        registeredPlayers.push(msg.sender);

        // 为新玩家添加初始物品
        _addInitialItems(msg.sender);

        // 不需要更新属性，因为没有装备任何物品

        emit PlayerRegistered(msg.sender, _daoHao);
    }

    // 为新玩家添加初始物品的内部函数
    function _addInitialItems(address player) internal {
        // 添加初始武器 - 放在背包中
        playerItems[player].push(Item({
            name: "Wooden Sword",
            itemType: 1, // 武器
            attackBonus: 5,
            defenseBonus: 0,
            value: 10,
            isEquipped: false // 不自动装备
        }));

        // 添加初始防具 - 放在背包中
        playerItems[player].push(Item({
            name: "Cloth Robe",
            itemType: 2, // 衣服
            attackBonus: 0,
            defenseBonus: 3,
            value: 8,
            isEquipped: false // 不自动装备
        }));

        // 添加初始饰品 - 放在背包中
        playerItems[player].push(Item({
            name: "Jade Pendant",
            itemType: 3, // 饰品
            attackBonus: 1,
            defenseBonus: 1,
            value: 15,
            isEquipped: false // 不自动装备
        }));

        // 添加初始书籍
        playerItems[player].push(Item({
            name: "Basic Cultivation Manual",
            itemType: 4, // 书籍
            attackBonus: 0,
            defenseBonus: 0,
            value: 20,
            isEquipped: false
        }));

        // 添加初始材料
        playerItems[player].push(Item({
            name: "Qi Pill",
            itemType: 5, // 材料
            attackBonus: 0,
            defenseBonus: 0,
            value: 5,
            isEquipped: false
        }));

        playerItems[player].push(Item({
            name: "Healing Potion",
            itemType: 5, // 材料
            attackBonus: 0,
            defenseBonus: 0,
            value: 8,
            isEquipped: false
        }));

        // 不设置装备槽位，让用户手动装备
        // equippedItems[player][1] = false; // 武器槽空
        // equippedItems[player][2] = false; // 衣服槽空
        // equippedItems[player][3] = false; // 饰品槽空
    }

    // 更新玩家属性（包含装备加成）
    function _updatePlayerStats(address playerAddr) internal {
        Player storage player = players[playerAddr];

        // 重置为基础属性
        uint256 baseAttack = 10 + (player.level - 1) * 5;
        uint256 baseDefense = 5 + (player.level - 1) * 3;

        // 计算装备加成
        uint256 equipmentAttack = 0;
        uint256 equipmentDefense = 0;

        Item[] storage items = playerItems[playerAddr];
        for (uint i = 0; i < items.length; i++) {
            if (items[i].isEquipped) {
                equipmentAttack += items[i].attackBonus;
                equipmentDefense += items[i].defenseBonus;
            }
        }

        // 更新玩家属性
        player.attack = baseAttack + equipmentAttack;
        player.defense = baseDefense + equipmentDefense;
    }

    // 获取玩家信息
    function getPlayer(address _player) external view returns (Player memory) {
        return players[_player];
    }

    // 更新玩家属性
    function updatePlayer(
        uint256 _xiuwei,
        uint256 _health,
        uint256 _gold
    ) external onlyRegistered {
        Player storage player = players[msg.sender];
        player.xiuwei = _xiuwei;
        player.health = _health;
        player.gold = _gold;
        player.lastUpdateTime = block.timestamp;
        
        emit PlayerUpdated(msg.sender);
    }

    // 突破境界
    function breakthrough() external onlyRegistered {
        Player storage player = players[msg.sender];
        require(player.xiuwei >= 100, "Not enough xiuwei for breakthrough");

        player.xiuwei -= 100;
        player.level += 1;

        // 计算新的属性
        player.attack = 10 + (player.level - 1) * 5;
        player.defense = 5 + (player.level - 1) * 3;
        player.maxHealth = 100 + (player.level - 1) * 20;
        player.health = player.maxHealth; // 突破后满血

        emit LevelUp(msg.sender, player.level);
        emit PlayerUpdated(msg.sender);
    }

    // 更新修为并突破境界（前端专用）
    function updateAndBreakthrough(uint256 _xiuwei) external onlyRegistered {
        Player storage player = players[msg.sender];

        // 更新修为
        player.xiuwei = _xiuwei;
        require(player.xiuwei >= 100, "Not enough xiuwei for breakthrough");

        // 突破境界
        player.xiuwei -= 100;
        player.level += 1;

        // 计算新的属性
        player.attack = 10 + (player.level - 1) * 5;
        player.defense = 5 + (player.level - 1) * 3;
        player.maxHealth = 100 + (player.level - 1) * 20;
        player.health = player.maxHealth; // 突破后满血

        emit LevelUp(msg.sender, player.level);
        emit PlayerUpdated(msg.sender);
    }

    // 运功疗伤
    function heal() external onlyRegistered {
        Player storage player = players[msg.sender];
        require(player.xiuwei >= 20, "Not enough xiuwei for healing");

        player.xiuwei -= 20;
        player.health = player.health + 20 > player.maxHealth ? player.maxHealth : player.health + 20;

        emit PlayerUpdated(msg.sender);
    }

    // 更新修为并运功疗伤（前端专用）
    function updateAndHeal(uint256 _xiuwei) external onlyRegistered {
        Player storage player = players[msg.sender];

        // 更新修为
        player.xiuwei = _xiuwei;
        require(player.xiuwei >= 20, "Not enough xiuwei for healing");

        // 运功疗伤
        player.xiuwei -= 20;
        player.health = player.health + 20 > player.maxHealth ? player.maxHealth : player.health + 20;

        emit PlayerUpdated(msg.sender);
    }

    // 获取排行榜
    function getLeaderboard() external view returns (address[] memory, Player[] memory) {
        uint256 length = registeredPlayers.length;
        address[] memory addresses = new address[](length);
        Player[] memory playerList = new Player[](length);
        
        for (uint256 i = 0; i < length; i++) {
            addresses[i] = registeredPlayers[i];
            playerList[i] = players[registeredPlayers[i]];
        }
        
        return (addresses, playerList);
    }

    // PVP战斗
    function challengePlayer(address _opponent) external onlyRegistered {
        require(players[_opponent].isRegistered, "Opponent not registered");
        require(_opponent != msg.sender, "Cannot challenge yourself");
        
        Player storage attacker = players[msg.sender];
        Player storage defender = players[_opponent];
        
        // 简单的战斗逻辑：比较攻击力和防御力
        uint256 attackerPower = attacker.attack + attacker.level * 2;
        uint256 defenderPower = defender.defense + defender.level * 2;
        
        bool attackerWins = attackerPower > defenderPower;
        
        if (attackerWins) {
            attacker.wins += 1;
            defender.losses += 1;
        } else {
            attacker.losses += 1;
            defender.wins += 1;
        }
        
        emit BattleResult(msg.sender, _opponent, attackerWins);
        emit PlayerUpdated(msg.sender);
        emit PlayerUpdated(_opponent);
    }

    // 添加物品到背包
    function addItem(
        address _player,
        string memory _name,
        uint256 _itemType,
        uint256 _attackBonus,
        uint256 _defenseBonus,
        uint256 _value
    ) external {
        // 在实际游戏中，这个函数应该有权限控制
        playerItems[_player].push(Item({
            name: _name,
            itemType: _itemType,
            attackBonus: _attackBonus,
            defenseBonus: _defenseBonus,
            value: _value,
            isEquipped: false
        }));
        
        emit ItemObtained(_player, _name);
    }

    // 获取玩家物品
    function getPlayerItems(address _player) external view returns (Item[] memory) {
        return playerItems[_player];
    }

    // 装备物品
    function equipItem(uint256 _itemIndex) external onlyRegistered {
        require(_itemIndex < playerItems[msg.sender].length, "Item does not exist");
        
        Item storage item = playerItems[msg.sender][_itemIndex];
        require(item.itemType >= 1 && item.itemType <= 3, "Item cannot be equipped");
        require(!item.isEquipped, "Item already equipped");
        
        // 卸下同类型的装备
        if (equippedItems[msg.sender][item.itemType]) {
            for (uint256 i = 0; i < playerItems[msg.sender].length; i++) {
                if (playerItems[msg.sender][i].itemType == item.itemType && 
                    playerItems[msg.sender][i].isEquipped) {
                    playerItems[msg.sender][i].isEquipped = false;
                    break;
                }
            }
        }
        
        item.isEquipped = true;
        equippedItems[msg.sender][item.itemType] = true;
        
        // 更新玩家属性
        Player storage player = players[msg.sender];
        player.attack += item.attackBonus;
        player.defense += item.defenseBonus;
        
        emit PlayerUpdated(msg.sender);
    }

    // 卸下物品
    function unequipItem(uint256 _itemIndex) external onlyRegistered {
        require(_itemIndex < playerItems[msg.sender].length, "Item does not exist");
        
        Item storage item = playerItems[msg.sender][_itemIndex];
        require(item.isEquipped, "Item not equipped");
        
        item.isEquipped = false;
        equippedItems[msg.sender][item.itemType] = false;
        
        // 更新玩家属性
        Player storage player = players[msg.sender];
        player.attack -= item.attackBonus;
        player.defense -= item.defenseBonus;
        
        emit PlayerUpdated(msg.sender);
    }

    // 使用物品
    function useItem(uint256 _itemIndex) external onlyRegistered {
        require(_itemIndex < playerItems[msg.sender].length, "Item does not exist");

        Item storage item = playerItems[msg.sender][_itemIndex];
        require(item.itemType == 4 || item.itemType == 5, "Item cannot be used");
        require(!item.isEquipped, "Cannot use equipped item");

        Player storage player = players[msg.sender];

        if (item.itemType == 4) {
            // 书籍：增加100修为
            player.xiuwei += 100;
        } else if (item.itemType == 5) {
            // 材料/药品：恢复50血量
            uint256 newHealth = player.health + 50;
            player.health = newHealth > player.maxHealth ? player.maxHealth : newHealth;
        }

        // 移除使用过的物品
        _removeItem(msg.sender, _itemIndex);

        emit PlayerUpdated(msg.sender);
    }

    // 出售物品
    function sellItem(uint256 _itemIndex) external onlyRegistered {
        require(_itemIndex < playerItems[msg.sender].length, "Item does not exist");

        Item storage item = playerItems[msg.sender][_itemIndex];
        require(!item.isEquipped, "Cannot sell equipped item");

        Player storage player = players[msg.sender];

        // 增加金币
        player.gold += item.value;

        // 移除出售的物品
        _removeItem(msg.sender, _itemIndex);

        emit PlayerUpdated(msg.sender);
    }

    // 移除物品的内部函数
    function _removeItem(address player, uint256 itemIndex) internal {
        require(itemIndex < playerItems[player].length, "Item index out of bounds");

        // 将最后一个物品移动到要删除的位置
        playerItems[player][itemIndex] = playerItems[player][playerItems[player].length - 1];

        // 删除最后一个物品
        playerItems[player].pop();
    }

    // 怪物战斗系统
    struct Monster {
        string name;
        uint256 maxHealth;
        uint256 currentHealth;
        uint256 attack;
        uint256 defense;
        uint256 level;
        bool isAlive;
    }

    struct Battle {
        uint256 monsterId;
        bool isActive;
        uint256 playerInitialHealth;
        uint256 monsterInitialHealth;
    }

    mapping(uint256 => Monster) public monsters;
    mapping(address => Battle) public playerBattles;
    mapping(address => string[]) public battleLogs;

    uint256 public monsterCount = 0;

    event BattleStarted(address indexed player, uint256 monsterId, string monsterName);
    event BattleAction(address indexed player, string action, uint256 damage, uint256 playerHealth, uint256 monsterHealth);
    event BattleEnded(address indexed player, bool playerWon, uint256 reward, string item);

    // 初始化怪物
    function initializeMonsters() external {
        if (monsterCount == 0) {
            monsters[0] = Monster("Slime", 30, 30, 8, 2, 1, true);
            monsters[1] = Monster("Goblin", 50, 50, 12, 3, 2, true);
            monsters[2] = Monster("Orc", 80, 80, 18, 5, 3, true);
            monsters[3] = Monster("Troll", 120, 120, 25, 8, 4, true);
            monsters[4] = Monster("Dragon", 200, 200, 40, 15, 5, true);
            monsterCount = 5;
        }
    }

    // 生成随机怪物
    function generateRandomMonster() external view returns (Monster memory) {
        require(monsterCount > 0, "Monsters not initialized");
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % monsterCount;
        Monster memory baseMonster = monsters[random];

        // 随机化血量 (80%-120%)
        uint256 healthVariation = (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, "health"))) % 41) + 80;
        uint256 randomHealth = (baseMonster.maxHealth * healthVariation) / 100;

        return Monster({
            name: baseMonster.name,
            maxHealth: randomHealth,
            currentHealth: randomHealth,
            attack: baseMonster.attack,
            defense: baseMonster.defense,
            level: baseMonster.level,
            isAlive: true
        });
    }

    // 攻击怪物
    function attackMonster(uint256 _monsterId) external onlyRegistered {
        require(_monsterId < monsterCount, "Monster does not exist");
        require(!playerBattles[msg.sender].isActive, "Already in battle");

        Player storage player = players[msg.sender];
        require(player.health > 0, "Player is dead");

        // 生成怪物实例
        Monster memory monster = monsters[_monsterId];

        // 随机化怪物血量
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, _monsterId)));
        uint256 healthVariation = (random % 41) + 80; // 80%-120%
        monster.maxHealth = (monster.maxHealth * healthVariation) / 100;
        monster.currentHealth = monster.maxHealth;

        // 开始战斗
        playerBattles[msg.sender] = Battle({
            monsterId: _monsterId,
            isActive: true,
            playerInitialHealth: player.health,
            monsterInitialHealth: monster.currentHealth
        });

        // 清空战斗日志
        delete battleLogs[msg.sender];

        emit BattleStarted(msg.sender, _monsterId, monster.name);

        // 执行战斗
        _executeBattle(msg.sender, monster);
    }

    // 执行战斗逻辑
    function _executeBattle(address _player, Monster memory _monster) internal {
        Player storage player = players[_player];
        Battle storage battle = playerBattles[_player];

        uint256 playerAttack = player.attack;
        uint256 playerDefense = player.defense;
        uint256 playerHealth = player.health;
        uint256 monsterHealth = _monster.currentHealth;

        string memory logEntry;

        // 战斗循环
        while (playerHealth > 0 && monsterHealth > 0) {
            // 玩家攻击
            uint256 playerDamage = playerAttack > _monster.defense ? playerAttack - _monster.defense : 1;
            monsterHealth = monsterHealth > playerDamage ? monsterHealth - playerDamage : 0;

            logEntry = string(abi.encodePacked("You attack ", _monster.name, " for ", _uint2str(playerDamage), " damage"));
            battleLogs[_player].push(logEntry);

            emit BattleAction(_player, "player_attack", playerDamage, playerHealth, monsterHealth);

            if (monsterHealth == 0) break;

            // 怪物攻击
            uint256 monsterDamage = _monster.attack > playerDefense ? _monster.attack - playerDefense : 1;
            playerHealth = playerHealth > monsterDamage ? playerHealth - monsterDamage : 0;

            logEntry = string(abi.encodePacked(_monster.name, " attacks you for ", _uint2str(monsterDamage), " damage"));
            battleLogs[_player].push(logEntry);

            emit BattleAction(_player, "monster_attack", monsterDamage, playerHealth, monsterHealth);
        }

        // 更新玩家血量
        player.health = playerHealth;

        // 战斗结束
        battle.isActive = false;

        uint256 reward = 0;
        string memory itemReward = "";

        if (playerHealth > 0) {
            // 玩家获胜
            battleLogs[_player].push("Victory! You defeated the monster!");

            // 奖励计算
            reward = _monster.level * 10 + (uint256(keccak256(abi.encodePacked(block.timestamp, _player))) % 20);
            player.gold += reward;

            // 修为奖励
            uint256 xiuweiReward = _monster.level * 5;
            player.xiuwei += xiuweiReward;

            // 物品奖励 (30%概率)
            if (uint256(keccak256(abi.encodePacked(block.timestamp, _player, "item"))) % 10 < 3) {
                if (_monster.level <= 2) {
                    itemReward = "Healing Potion";
                    playerItems[_player].push(Item({
                        name: "Healing Potion",
                        itemType: 5,
                        attackBonus: 0,
                        defenseBonus: 0,
                        value: 8,
                        isEquipped: false
                    }));
                } else if (_monster.level <= 4) {
                    itemReward = "Qi Pill";
                    playerItems[_player].push(Item({
                        name: "Qi Pill",
                        itemType: 5,
                        attackBonus: 0,
                        defenseBonus: 0,
                        value: 15,
                        isEquipped: false
                    }));
                } else {
                    itemReward = "Rare Gem";
                    playerItems[_player].push(Item({
                        name: "Rare Gem",
                        itemType: 5,
                        attackBonus: 0,
                        defenseBonus: 0,
                        value: 50,
                        isEquipped: false
                    }));
                }
                if (bytes(itemReward).length > 0) {
                    emit ItemObtained(_player, itemReward);
                    battleLogs[_player].push(string(abi.encodePacked("You found: ", itemReward)));
                }
            }

            string memory rewardLog = string(abi.encodePacked("Rewards: ", _uint2str(reward), " gold, ", _uint2str(xiuweiReward), " cultivation"));
            battleLogs[_player].push(rewardLog);

        } else {
            // 玩家失败
            battleLogs[_player].push("Defeat! You were defeated by the monster!");
        }

        emit BattleEnded(_player, playerHealth > 0, reward, itemReward);
        emit PlayerUpdated(_player);
    }

    // 辅助函数：将uint转换为string
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // 获取所有怪物
    function getMonsters() external view returns (Monster[] memory) {
        Monster[] memory result = new Monster[](monsterCount);
        for (uint256 i = 0; i < monsterCount; i++) {
            result[i] = monsters[i];
        }
        return result;
    }

    // 获取战斗日志
    function getBattleLogs(address _player) external view returns (string[] memory) {
        return battleLogs[_player];
    }

    // 获取玩家战斗状态
    function getPlayerBattle(address _player) external view returns (Battle memory) {
        return playerBattles[_player];
    }

    // 获取注册玩家数量
    function getRegisteredPlayersCount() external view returns (uint256) {
        return registeredPlayers.length;
    }
}
