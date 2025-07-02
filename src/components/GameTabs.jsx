import { useState } from 'react'
import { CultivationTab } from './tabs/CultivationTab'
import { ItemsTab } from './tabs/ItemsTab'
import { AdventureTab } from './tabs/AdventureTab'
import { BattleTab } from './tabs/BattleTab'
import { ChatTab } from './tabs/ChatTab'

export function GameTabs({ player, onUpdate }) {
  const [activeTab, setActiveTab] = useState('cultivation')

  const tabs = [
    { id: 'cultivation', name: '修炼', component: CultivationTab },
    { id: 'items', name: '物品', component: ItemsTab },
    { id: 'adventure', name: '冒险', component: AdventureTab },
    { id: 'battle', name: '征战', component: BattleTab },
    { id: 'chat', name: '聊天', component: ChatTab },
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component

  return (
    <div className="game-tabs">
      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {ActiveComponent && (
          <ActiveComponent player={player} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  )
}
