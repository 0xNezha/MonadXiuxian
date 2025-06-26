import { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import './ChatWindow.css'

const ChatWindow = ({ isVisible = true, onClose }) => {
  const { address } = useAccount()
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [participants, setParticipants] = useState(0)
  const [nickname, setNickname] = useState('')
  const [multisynqStatus, setMultisynqStatus] = useState('disconnected')
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [position, setPosition] = useState({ x: 16, y: 16 }) // right-4 top-4 的像素值
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const messagesEndRef = useRef(null)

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 初始化 MultiSYNQ 聊天
  useEffect(() => {
    if (!address) return

    let isComponentMounted = true
    let currentSession = null

    const initChatMultiSynq = async () => {
      try {
        setIsLoading(true)
        setMultisynqStatus('connecting')

        // 检查是否已经加载了 MultiSYNQ
        if (typeof window.Multisynq === 'undefined') {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/@multisynq/client@latest/bundled/multisynq-client.min.js'

          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })

          // 等待 MultiSYNQ 完全加载
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        // 定义简化的聊天模型
        if (!window.XiuxianChatModel) {
          window.XiuxianChatModel = class extends window.Multisynq.Model {
            init() {
              this.participants = 0
              this.messages = []

              // 只订阅基本的系统事件
              this.subscribe(this.sessionId, 'view-join', 'onViewJoin')
              this.subscribe(this.sessionId, 'view-exit', 'onViewExit')
              this.subscribe('input', 'newPost', 'onNewPost')
            }

            onViewJoin(viewId) {
              this.participants++
              if (window.updateXiuxianChatViewInfo) {
                window.updateXiuxianChatViewInfo('修仙者', this.participants)
              }
            }

            onViewExit(viewId) {
              this.participants--
              if (window.updateXiuxianChatViewInfo) {
                window.updateXiuxianChatViewInfo('修仙者', this.participants)
              }
            }

            onNewPost(messageText) {
              // 简单处理消息
              const escapedText = String(messageText).replace(/</g, '&lt;').replace(/>/g, '&gt;')
              const newMessage = `<b style="color: #60a5fa;">道友:</b> ${escapedText}`

              this.messages.push(newMessage)
              if (this.messages.length > 50) {
                this.messages.shift()
              }

              if (window.updateXiuxianChatHistory) {
                window.updateXiuxianChatHistory(this.messages.join('<br>'))
              }
            }
          }

          // 定义简化的聊天视图
          window.XiuxianChatView = class extends window.Multisynq.View {
            init() {
              // 视图初始化完成
              if (window.updateXiuxianChatViewInfo) {
                window.updateXiuxianChatViewInfo('修仙者', 1)
              }
            }
          }

          // 注册模型
          try {
            window.XiuxianChatModel.register()
          } catch (error) {
            console.warn('聊天模型注册警告:', error.message)
          }
        }

        // 设置全局回调
        window.updateXiuxianChatHistory = (historyHtml) => {
          if (!isComponentMounted) return
          const messages = historyHtml.split('<br>').filter(msg => msg.trim())
          setMessages(messages)
        }

        window.updateXiuxianChatViewInfo = (userNickname, participantCount) => {
          if (!isComponentMounted) return
          setNickname(userNickname)
          setParticipants(participantCount)
        }

        // 加入聊天会话
        const sessionResult = await window.Multisynq.Session.join({
          apiKey: '2V7TyJ7qkb1nxZ1O7YKrZu0ZEGNFT6Shd8elbgcfqk',
          appId: 'com.xiuxian.chat',
          modelClass: window.XiuxianChatModel,
          viewClass: window.XiuxianChatView,
          sessionName: 'xiuxian-chat-room'
        })

        if (!isComponentMounted) return

        currentSession = sessionResult
        setSession(sessionResult)
        setMultisynqStatus('connected')

      } catch (error) {
        console.error('聊天室初始化失败:', error)
        if (!isComponentMounted) return
        setMultisynqStatus('error')
        setMessages([`<i style="color: #ef4444;">聊天室连接失败: ${error.message}</i>`])
      } finally {
        if (isComponentMounted) {
          setIsLoading(false)
        }
      }
    }

    initChatMultiSynq()

    // 清理函数
    return () => {
      isComponentMounted = false
      if (window.updateXiuxianChatHistory) {
        delete window.updateXiuxianChatHistory
      }
      if (window.updateXiuxianChatViewInfo) {
        delete window.updateXiuxianChatViewInfo
      }
    }
  }, [address])

  // 发送消息 - 简化版本
  const handleSendMessage = () => {
    if (!inputText.trim() || !session || multisynqStatus !== 'connected') return

    try {
      const messageText = inputText.trim()

      if (messageText === '/reset') {
        // 直接重置本地历史
        setMessages([`<i style="color: #fbbf24;">聊天室已重置</i>`])
      } else {
        // 直接添加消息到本地显示
        const nickname = session.model?.views?.get(session.view.viewId) || '修仙者'
        const newMessage = `<b style="color: #60a5fa;">${nickname}:</b> ${messageText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}`
        setMessages(prev => [...prev.slice(-49), newMessage]) // 保持最多50条消息

        // 尝试同步到其他用户
        try {
          session.view.publish('input', 'newPost', messageText)
        } catch (e) {
          console.warn('同步消息失败:', e)
        }
      }
      setInputText('')
    } catch (error) {
      console.error('发送消息失败:', error)
      setMessages(prev => [...prev, `<i style="color: #ef4444;">发送失败</i>`])
    }
  }

  // 处理回车键
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  // 拖拽处理
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    // 限制在窗口范围内
    const maxX = window.innerWidth - 320 // 320px 是聊天窗口宽度
    const maxY = window.innerHeight - (isMinimized ? 48 : 384) // 窗口高度

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart, position, isMinimized])

  // 如果不可见，不渲染组件
  if (!isVisible) return null

  return (
    <div
      className={`fixed w-80 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl z-[9999] transition-all duration-300 ${
        isMinimized ? 'h-12' : 'h-96'
      } ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* 聊天窗口标题栏 */}
      <div
        className={`flex items-center justify-between p-3 bg-gray-800 rounded-t-lg select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            multisynqStatus === 'connected' ? 'bg-green-400' :
            multisynqStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
            'bg-red-400'
          }`}></div>
          <span className="text-sm font-medium text-blue-400">修仙聊天室</span>
          <span className="text-xs text-gray-400">({participants})</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            className="text-gray-400 hover:text-white p-1 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              setIsMinimized(!isMinimized)
            }}
            title={isMinimized ? "展开" : "最小化"}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button
            className="text-gray-400 hover:text-red-400 p-1 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onClose && onClose()
            }}
            title="关闭"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 聊天内容区域 */}
      {!isMinimized && (
        <>
          {/* 消息显示区域 */}
          <div className="h-64 overflow-y-auto p-3 bg-black text-green-400 text-xs custom-scrollbar">
            {isLoading ? (
              <div className="text-center text-gray-500 py-8">
                <div className="mb-2">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
                <div>正在连接聊天室...</div>
                <div className="text-xs mt-1">请稍候</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="mb-2">🏮</div>
                <div>欢迎来到修仙聊天室</div>
                <div className="text-xs mt-1">与其他修仙者论道切磋</div>
              </div>
            ) : (
              <div className="space-y-1">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className="break-words p-1 rounded hover:bg-gray-900 transition-colors"
                    dangerouslySetInnerHTML={{ __html: message }}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* 输入区域 */}
          <div className="p-3 border-t border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  isLoading ? '加载中...' :
                  multisynqStatus === 'connected' ? '输入消息...' :
                  multisynqStatus === 'connecting' ? '连接中...' : '连接失败'
                }
                disabled={isLoading || multisynqStatus !== 'connected'}
                className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputText.trim() || multisynqStatus !== 'connected'}
                className={`px-3 py-1 text-xs transition-colors ${
                  !isLoading && inputText.trim() && multisynqStatus === 'connected'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? '...' : '发送'}
              </button>
            </div>
            {nickname && (
              <div className="mt-1 text-xs text-gray-400">
                昵称: {nickname}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ChatWindow
