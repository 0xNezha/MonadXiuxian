const ItemsTab = ({ gameData, setGameData }) => {
  const { player } = gameData

  const handleEquip = (item) => {
    if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
      setGameData(prev => {
        const newInventory = prev.player.inventory.filter(i => i.id !== item.id)
        const oldEquipment = prev.player.equipment[item.type]
        
        if (oldEquipment) {
          newInventory.push(oldEquipment)
        }

        return {
          ...prev,
          player: {
            ...prev.player,
            inventory: newInventory,
            equipment: {
              ...prev.player.equipment,
              [item.type]: item
            },
            power: prev.player.power + (item.power || 0) - (oldEquipment?.power || 0)
          }
        }
      })
    }
  }

  const handleUnequip = (equipmentType) => {
    const equipment = player.equipment[equipmentType]
    if (equipment) {
      setGameData(prev => ({
        ...prev,
        player: {
          ...prev.player,
          inventory: [...prev.player.inventory, equipment],
          equipment: {
            ...prev.player.equipment,
            [equipmentType]: null
          },
          power: prev.player.power - (equipment.power || 0)
        }
      }))
    }
  }

  const handleUse = (item) => {
    if (item.type === 'book') {
      setGameData(prev => ({
        ...prev,
        player: {
          ...prev.player,
          inventory: prev.player.inventory.filter(i => i.id !== item.id),
          cultivation: prev.player.cultivation + (item.power * 10)
        }
      }))
    } else if (item.type === 'material') {
      const maxHealth = 100 + (player.level - 1) * 20
      setGameData(prev => ({
        ...prev,
        player: {
          ...prev.player,
          inventory: prev.player.inventory.filter(i => i.id !== item.id),
          health: Math.min(prev.player.health + (item.health || 0), maxHealth)
        }
      }))
    }
  }

  const handleSell = (item) => {
    setGameData(prev => ({
      ...prev,
      player: {
        ...prev.player,
        inventory: prev.player.inventory.filter(i => i.id !== item.id),
        spiritStones: prev.player.spiritStones + item.price
      }
    }))
  }

  const getItemTypeText = (type) => {
    const types = {
      weapon: '武器',
      armor: '衣服',
      accessory: '饰品',
      book: '书籍',
      material: '材料'
    }
    return types[type] || type
  }

  const getItemColor = (type) => {
    const colors = {
      weapon: 'text-red-400',
      armor: 'text-blue-400',
      accessory: 'text-purple-400',
      book: 'text-green-400',
      material: 'text-yellow-400'
    }
    return colors[type] || 'text-gray-400'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-orange-400 mb-4">物品管理</h2>
        <p className="text-gray-400">管理你的装备和物品</p>
      </div>

      {/* 已装备物品 */}
      <div className="border border-gray-600 p-4 bg-gray-900">
        <h3 className="text-xl font-bold text-orange-400 mb-4">已装备</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['weapon', 'armor', 'accessory'].map(type => {
            const equipment = player.equipment[type]
            return (
              <div key={type} className="border border-gray-700 p-3 bg-gray-800">
                <h4 className="text-lg font-bold mb-2 capitalize">
                  {getItemTypeText(type)}
                </h4>
                {equipment ? (
                  <div>
                    <div className={`font-bold ${getItemColor(equipment.type)}`}>
                      {equipment.name}
                    </div>
                    {equipment.power && (
                      <div className="text-sm text-gray-400">
                        功力: +{equipment.power}
                      </div>
                    )}
                    <button
                      onClick={() => handleUnequip(type)}
                      className="mt-2 w-full py-1 px-2 border border-red-600 bg-red-900 hover:bg-red-800 text-red-200 text-sm"
                    >
                      卸下
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-500">未装备</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 背包物品 */}
      <div className="border border-gray-600 p-4 bg-gray-900">
        <h3 className="text-xl font-bold text-orange-400 mb-4">背包</h3>
        {player.inventory.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            背包空空如也
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {player.inventory.map(item => (
              <div key={item.id} className="border border-gray-700 p-3 bg-gray-800">
                <div className={`font-bold ${getItemColor(item.type)} mb-1`}>
                  {item.name}
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  类型: {getItemTypeText(item.type)}
                </div>
                {item.power && (
                  <div className="text-sm text-gray-400 mb-2">
                    功力: +{item.power}
                  </div>
                )}
                {item.health && (
                  <div className="text-sm text-gray-400 mb-2">
                    血量: +{item.health}
                  </div>
                )}
                <div className="text-sm text-yellow-400 mb-3">
                  价值: {item.price} 灵石
                </div>
                
                <div className="space-y-2">
                  {(item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') && (
                    <button
                      onClick={() => handleEquip(item)}
                      className="w-full py-1 px-2 border border-green-600 bg-green-900 hover:bg-green-800 text-green-200 text-sm"
                    >
                      装备
                    </button>
                  )}
                  
                  {(item.type === 'book' || item.type === 'material') && (
                    <button
                      onClick={() => handleUse(item)}
                      className="w-full py-1 px-2 border border-blue-600 bg-blue-900 hover:bg-blue-800 text-blue-200 text-sm"
                    >
                      使用
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleSell(item)}
                    className="w-full py-1 px-2 border border-red-600 bg-red-900 hover:bg-red-800 text-red-200 text-sm"
                  >
                    出售
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemsTab
