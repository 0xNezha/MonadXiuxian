import CultivationTab from './tabs/CultivationTab'
import ItemsTab from './tabs/ItemsTab'
import AdventureTab from './tabs/AdventureTab'
import BattleTab from './tabs/BattleTab'

const GameTabs = ({ activeTab, gameData, setGameData }) => {
  const renderTab = () => {
    switch (activeTab) {
      case 'cultivation':
        return <CultivationTab gameData={gameData} setGameData={setGameData} />
      case 'items':
        return <ItemsTab gameData={gameData} setGameData={setGameData} />
      case 'adventure':
        return <AdventureTab gameData={gameData} setGameData={setGameData} />
      case 'battle':
        return <BattleTab gameData={gameData} setGameData={setGameData} />
      default:
        return <CultivationTab gameData={gameData} setGameData={setGameData} />
    }
  }

  return (
    <div className="h-[calc(100vh-200px)] overflow-y-auto">
      {renderTab()}
    </div>
  )
}

export default GameTabs
