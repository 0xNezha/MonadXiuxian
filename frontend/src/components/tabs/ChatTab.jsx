import { useState, useEffect, useRef } from 'react'

export function ChatTab({ player }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const chatModelRef = useRef(null)
  const chatViewRef = useRef(null)

  // MultiSYNQ聊天模型
  useEffect(() => {
    if (!player || !window.Multisynq) return

    // 定义聊天模型
    class ChatModel extends window.Multisynq.Model {
      init() {
        this.messages = []
        this.subscribe('chat', 'new-message', this.addMessage)
      }

      addMessage(messageData) {
        this.messages.push({
          id: Date.now() + Math.random(),
          user: messageData.user,
          message: messageData.message,
          timestamp: new Date()
        })

        // 限制消息数量，保持最新的100条
        if (this.messages.length > 100) {
          this.messages = this.messages.slice(-100)
        }
      }
    }

    // 定义聊天视图
    class ChatView extends window.Multisynq.View {
      init() {
        this.subscribe('model', 'messages', this.updateMessages)
      }

      updateMessages() {
        // 通过回调更新React状态
        if (this.onMessagesUpdate) {
          this.onMessagesUpdate(this.model.messages)
        }
      }
    }

    // 注册模型和视图
    window.Multisynq.Model.register(ChatModel)
    window.Multisynq.View.register(ChatView)

    // 加入会话
    const sessionPromise = window.Multisynq.Session.join({
      apiKey: '2V7TyJ7qkb1nxZ1O7YKrZu0ZEGNFT6Shd8elbgcfqk',
      appId: 'com.xiuxian.chat',
      sessionId: 'xiuxian-chat-room',
      password: 'xiuxian123',
      modelClass: ChatModel,
      viewClass: ChatView
    })

    sessionPromise.then(({ model, view }) => {
      chatModelRef.current = model
      chatViewRef.current = view

      // 设置消息更新回调
      view.onMessagesUpdate = (newMessages) => {
        setMessages([...newMessages])
      }

      // 初始化消息
      setMessages([...model.messages])
      setIsConnected(true)

      // 发送欢迎消息
      if (model.messages.length === 0) {
        model.addMessage({
          user: '系统',
          message: '欢迎来到修仙世界聊天室！'
        })
      }
    }).catch(error => {
      console.error('MultiSYNQ连接失败:', error)
      // 使用模拟消息作为后备
      const welcomeMessages = [
        { id: 1, user: '系统', message: '欢迎来到修仙世界聊天室！（离线模式）', timestamp: new Date() },
        { id: 2, user: '仙人指路', message: '新人记得多修炼，提升实力！', timestamp: new Date() },
        { id: 3, user: '剑仙', message: '有人要组队冒险吗？', timestamp: new Date() },
      ]
      setMessages(welcomeMessages)
    })

    return () => {
      // 清理
      if (chatViewRef.current) {
        chatViewRef.current.unsubscribeAll()
      }
    }
  }, [player])

  const sendMessage = () => {
    if (!inputMessage.trim() || !player) return

    if (isConnected && chatViewRef.current) {
      // 通过MultiSYNQ发送消息
      chatViewRef.current.publish('chat', 'new-message', {
        user: player.daoHao,
        message: inputMessage
      })
    } else {
      // 离线模式，直接添加到本地消息
      const newMessage = {
        id: Date.now(),
        user: player.daoHao,
        message: inputMessage,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newMessage])
    }

    setInputMessage('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!player) {
    return <div>加载中...</div>
  }

  return (
    <div className="chat-tab">
      <h3>聊天</h3>
      
      <div className="chat-section">
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className="chat-message">
              <div className="message-header">
                <span className="message-user">{msg.user}</span>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <div className="input-container">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              rows={3}
              className="message-input"
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              className="send-btn"
            >
              发送
            </button>
          </div>
        </div>

        <div className="chat-info">
          <p>
            {isConnected ? (
              <>💡 已连接到MultiSYNQ聊天服务器，可以与其他修仙者实时聊天！</>
            ) : (
              <>⚠️ MultiSYNQ连接失败，当前为离线模式</>
            )}
          </p>
          <p>🎮 在这里可以与其他修仙者交流心得，组队冒险！</p>
        </div>
      </div>
    </div>
  )
}
