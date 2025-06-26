// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract XiuxianGame {
    struct Player {
        string nickname;
        uint256 level;
        uint256 cultivation; // 修为
        uint256 power; // 功力
        uint256 experience; // 经验值
        uint256 lastLoginTime;
        bool exists;
    }
    
    mapping(address => Player) public players;
    address[] public playerAddresses;
    
    event PlayerRegistered(address indexed player, string nickname);
    event PlayerUpdated(address indexed player, uint256 level, uint256 cultivation, uint256 power);
    event PlayerLogin(address indexed player, uint256 timestamp);
    
    modifier onlyExistingPlayer() {
        require(players[msg.sender].exists, "Player does not exist");
        _;
    }
    
    modifier onlyNewPlayer() {
        require(!players[msg.sender].exists, "Player already exists");
        _;
    }
    
    // 注册新玩家
    function registerPlayer(string memory _nickname) external onlyNewPlayer {
        require(bytes(_nickname).length > 0, "Nickname cannot be empty");
        require(bytes(_nickname).length <= 20, "Nickname too long");
        
        players[msg.sender] = Player({
            nickname: _nickname,
            level: 1,
            cultivation: 0,
            power: 10,
            experience: 0,
            lastLoginTime: block.timestamp,
            exists: true
        });
        
        playerAddresses.push(msg.sender);
        
        emit PlayerRegistered(msg.sender, _nickname);
        emit PlayerLogin(msg.sender, block.timestamp);
    }
    
    // 检查玩家是否存在
    function playerExists(address _player) external view returns (bool) {
        return players[_player].exists;
    }
    
    // 获取玩家信息
    function getPlayer(address _player) external view returns (
        string memory nickname,
        uint256 level,
        uint256 cultivation,
        uint256 power,
        uint256 experience,
        uint256 lastLoginTime
    ) {
        require(players[_player].exists, "Player does not exist");
        Player memory player = players[_player];
        return (
            player.nickname,
            player.level,
            player.cultivation,
            player.power,
            player.experience,
            player.lastLoginTime
        );
    }
    
    // 获取当前玩家信息
    function getMyPlayer() external view onlyExistingPlayer returns (
        string memory nickname,
        uint256 level,
        uint256 cultivation,
        uint256 power,
        uint256 experience,
        uint256 lastLoginTime
    ) {
        Player memory player = players[msg.sender];
        return (
            player.nickname,
            player.level,
            player.cultivation,
            player.power,
            player.experience,
            player.lastLoginTime
        );
    }
    
    // 更新玩家数据
    function updatePlayer(
        uint256 _level,
        uint256 _cultivation,
        uint256 _power,
        uint256 _experience
    ) external onlyExistingPlayer {
        Player storage player = players[msg.sender];
        player.level = _level;
        player.cultivation = _cultivation;
        player.power = _power;
        player.experience = _experience;
        player.lastLoginTime = block.timestamp;
        
        emit PlayerUpdated(msg.sender, _level, _cultivation, _power);
        emit PlayerLogin(msg.sender, block.timestamp);
    }
    
    // 记录玩家登录
    function login() external onlyExistingPlayer {
        players[msg.sender].lastLoginTime = block.timestamp;
        emit PlayerLogin(msg.sender, block.timestamp);
    }
    
    // 获取排行榜（按等级排序）
    function getLeaderboard(uint256 _limit) external view returns (
        address[] memory addresses,
        string[] memory nicknames,
        uint256[] memory levels,
        uint256[] memory powers
    ) {
        uint256 totalPlayers = playerAddresses.length;
        uint256 limit = _limit > totalPlayers ? totalPlayers : _limit;
        
        // 创建临时数组用于排序
        address[] memory tempAddresses = new address[](totalPlayers);
        uint256[] memory tempLevels = new uint256[](totalPlayers);
        
        // 复制数据
        for (uint256 i = 0; i < totalPlayers; i++) {
            tempAddresses[i] = playerAddresses[i];
            tempLevels[i] = players[playerAddresses[i]].level;
        }
        
        // 简单的冒泡排序（按等级降序）
        for (uint256 i = 0; i < totalPlayers - 1; i++) {
            for (uint256 j = 0; j < totalPlayers - i - 1; j++) {
                if (tempLevels[j] < tempLevels[j + 1]) {
                    // 交换等级
                    uint256 tempLevel = tempLevels[j];
                    tempLevels[j] = tempLevels[j + 1];
                    tempLevels[j + 1] = tempLevel;
                    
                    // 交换地址
                    address tempAddr = tempAddresses[j];
                    tempAddresses[j] = tempAddresses[j + 1];
                    tempAddresses[j + 1] = tempAddr;
                }
            }
        }
        
        // 返回前 limit 名玩家
        addresses = new address[](limit);
        nicknames = new string[](limit);
        levels = new uint256[](limit);
        powers = new uint256[](limit);
        
        for (uint256 i = 0; i < limit; i++) {
            addresses[i] = tempAddresses[i];
            Player memory player = players[tempAddresses[i]];
            nicknames[i] = player.nickname;
            levels[i] = player.level;
            powers[i] = player.power;
        }
        
        return (addresses, nicknames, levels, powers);
    }
    
    // 获取玩家总数
    function getTotalPlayers() external view returns (uint256) {
        return playerAddresses.length;
    }
    
    // 修改昵称（可选功能）
    function updateNickname(string memory _newNickname) external onlyExistingPlayer {
        require(bytes(_newNickname).length > 0, "Nickname cannot be empty");
        require(bytes(_newNickname).length <= 20, "Nickname too long");
        
        players[msg.sender].nickname = _newNickname;
    }
}
