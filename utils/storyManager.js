// 故事数据管理器 - 完全本地化
// utils/storyManager.js
class StoryManager {
  constructor() {
    this.stories = []
    this.loadStories()
  }

  // 加载故事数据
  loadStories() {
    try {
      this.stories = wx.getStorageSync('stories') || this.getDefaultStories()
    } catch (error) {
      this.stories = this.getDefaultStories()
    }
  }

  // 保存故事数据
  saveStories() {
    try {
      wx.setStorageSync('stories', this.stories)
    } catch (error) {
      console.error('保存故事失败:', error)
    }
  }

  // 获取默认故事数据
  getDefaultStories() {
    return [
      {
        id: 'STORY01',
        title: '深夜图书馆的奇遇',
        theme: '悬疑惊悚',
        creator: { nickName: '小明' },
        participants: [
          { nickName: '小明' },
          { nickName: '小红' },
          { nickName: '小刚' }
        ],
        maxParticipants: 3,
        turns: [
          { 
            user: '小明', 
            content: '那天深夜，我在图书馆赶论文，突然听到书架后面传来奇怪的声音...',
            timestamp: new Date('2024-01-20 20:00:00')
          },
          { 
            user: '小红', 
            content: '我小心翼翼地走过去，发现一本古老的书籍正在自己翻页！',
            timestamp: new Date('2024-01-20 20:30:00')
          }
        ],
        currentTurn: 2,
        status: 'playing',
        createdAt: new Date('2024-01-20 19:00:00')
      },
      {
        id: 'STORY02',
        title: '未来世界的冒险',
        theme: '科幻未来',
        creator: { nickName: '小李' },
        participants: [
          { nickName: '小李' },
          { nickName: '当前用户' }
        ],
        maxParticipants: 4,
        turns: [
          { 
            user: '小李', 
            content: '公元3024年，我是一名时空警察，负责维护时间线的稳定。今天接到一个特殊任务...',
            timestamp: new Date('2024-01-19 15:00:00')
          }
        ],
        currentTurn: 1,
        status: 'playing',
        createdAt: new Date('2024-01-19 14:30:00')
      },
      {
        id: 'STORY03',
        title: '魔法学院的秘密',
        theme: '奇幻魔法',
        creator: { nickName: '小美' },
        participants: [
          { nickName: '小美' },
          { nickName: '小华' }
        ],
        maxParticipants: 3,
        turns: [
          { 
            user: '小美', 
            content: '作为魔法学院的新生，我发现自己有一种特殊的能力...',
            timestamp: new Date('2024-01-18 10:00:00')
          },
          { 
            user: '小华', 
            content: '在古老的图书馆里，我发现了一本记载着禁忌魔法的书籍...',
            timestamp: new Date('2024-01-18 11:00:00')
          },
          { 
            user: '小美', 
            content: '正当我们研究这本书时，学院的钟声突然响起，预示着危险即将来临...',
            timestamp: new Date('2024-01-18 12:00:00')
          }
        ],
        currentTurn: 0,
        status: 'completed',
        createdAt: new Date('2024-01-18 09:00:00')
      }
    ]
  }

  // 创建新故事
  createStory(storyData) {
    const newStory = {
      id: this.generateStoryId(),
      title: storyData.title,
      theme: storyData.theme,
      creator: storyData.creator,
      participants: [storyData.creator],
      maxParticipants: parseInt(storyData.maxParticipants),
      turns: storyData.opening ? [{ 
        user: storyData.creator.nickName, 
        content: storyData.opening,
        timestamp: new Date()
      }] : [],
      currentTurn: storyData.opening ? 1 : 0,
      status: 'waiting',
      createdAt: new Date()
    }
    
    this.stories.unshift(newStory)
    this.saveStories()
    return newStory
  }

  // 加入故事
  joinStory(storyId, user) {
    const story = this.stories.find(s => s.id === storyId)
    if (!story) return false
    
    if (story.participants.length >= story.maxParticipants) {
      return false
    }

    // 检查是否已经加入
    const alreadyJoined = story.participants.some(p => p.nickName === user.nickName)
    if (alreadyJoined) {
      return true // 已经加入，返回成功
    }

    story.participants.push(user)
    
    // 如果人数达到2人且是等待状态，开始游戏
    if (story.participants.length >= 2 && story.status === 'waiting') {
      story.status = 'playing'
    }
    
    this.saveStories()
    return true
  }

  // 添加故事段落
  addStoryTurn(storyId, content, user) {
    const story = this.stories.find(s => s.id === storyId)
    if (!story) return false

    story.turns.push({
      user: user.nickName,
      content: content,
      timestamp: new Date()
    })
    
    // 更新轮到谁
    story.currentTurn = (story.currentTurn + 1) % story.participants.length
    
    // 检查是否完成（演示：超过5段就完成）
    if (story.turns.length >= 5) {
      story.status = 'completed'
    }
    
    this.saveStories()
    return true
  }

  // 获取用户的故事
  getUserStories(userName) {
    return this.stories.filter(story => 
      story.participants.some(p => p.nickName === userName) || 
      story.creator.nickName === userName
    )
  }

  // 根据ID获取故事
  getStoryById(id) {
    return this.stories.find(story => story.id === id)
  }

  // 生成故事ID
  generateStoryId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // 模拟AI润色
  async enhanceWithAI(text) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 简单的润色逻辑
        const enhancements = [
          '经过润色后，故事更加生动了。',
          'AI优化了语言表达，让情节更连贯。',
          '润色后的文本更具文学性。'
        ]
        const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)]
        resolve(text + ' ' + randomEnhancement)
      }, 800)
    })
  }

  // 模拟AI建议
  async generateSuggestions(storySoFar) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const suggestions = [
          '可以让主角发现一个关键线索',
          '引入一个新角色推动剧情',
          '设置一个意外的转折点',
          '描写主角的内心矛盾',
          '增加一些环境氛围的描写'
        ]
        resolve(suggestions.slice(0, 3))
      }, 1000)
    })
  }
}

// 创建单例
const storyManager = new StoryManager()
module.exports = storyManager