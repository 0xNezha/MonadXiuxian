export const XIUXIAN_GAME_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_nickname",
        "type": "string"
      }
    ],
    "name": "registerPlayer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_player",
        "type": "address"
      }
    ],
    "name": "playerExists",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_player",
        "type": "address"
      }
    ],
    "name": "getPlayer",
    "outputs": [
      {
        "internalType": "string",
        "name": "nickname",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "level",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "cultivation",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "power",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "experience",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastLoginTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyPlayer",
    "outputs": [
      {
        "internalType": "string",
        "name": "nickname",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "level",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "cultivation",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "power",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "experience",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastLoginTime",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_level",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_cultivation",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_power",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_experience",
        "type": "uint256"
      }
    ],
    "name": "updatePlayer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "login",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_limit",
        "type": "uint256"
      }
    ],
    "name": "getLeaderboard",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "addresses",
        "type": "address[]"
      },
      {
        "internalType": "string[]",
        "name": "nicknames",
        "type": "string[]"
      },
      {
        "internalType": "uint256[]",
        "name": "levels",
        "type": "uint256[]"
      },
      {
        "internalType": "uint256[]",
        "name": "powers",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalPlayers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_newNickname",
        "type": "string"
      }
    ],
    "name": "updateNickname",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "nickname",
        "type": "string"
      }
    ],
    "name": "PlayerRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "level",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "cultivation",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "power",
        "type": "uint256"
      }
    ],
    "name": "PlayerUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "PlayerLogin",
    "type": "event"
  }
]

// 合约地址 - 已部署
export const XIUXIAN_GAME_ADDRESS = "0x925031548668D8f1338dFbD6E81Ca788a9FeCdE6"
