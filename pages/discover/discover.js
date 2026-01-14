// pages/discover/discover.js
// pages/discover/discover.js
Page({
  data: {
    currentTab: 'hot',
    banners: [
      {
        id: 1,
        image: '/asserts/images/轮播图1.png',
        title: '热门故事合集',
        desc: '探索最受欢迎的故事创作'
      }
      // {
      //   id: 2, 
      //   image: '/images/banner2.jpg',
      //   title: '新人创作指南',
      //   desc: '快速上手故事接力'
      // },
      // {
      //   id: 3,
      //   image: '/images/banner3.jpg',
      //   title: '每周精选',
      //   desc: '发现精彩故事'
      // }
    ],
    categories: [
      { id: 1, name: '悬疑惊悚', icon: '🔮', count: 128 },
      { id: 2, name: '浪漫爱情', icon: '💖', count: 96 },
      { id: 3, name: '科幻未来', icon: '🚀', count: 87 },
      { id: 4, name: '奇幻冒险', icon: '🧙‍♂️', count: 73 },
      { id: 5, name: '现实生活', icon: '🏙️', count: 65 },
      { id: 6, name: '搞笑喜剧', icon: '😂', count: 58 },
      { id: 7, name: '历史穿越', icon: '⏳', count: 42 },
      { id: 8, name: '恐怖灵异', icon: '👻', count: 39 }
    ],
    recommendedStories: [],
    loading: false,
    page: 1
  },

  onLoad() {
    this.loadRecommendedStories()
  },

  onShow() {
    this.loadRecommendedStories()
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ 
      currentTab: tab,
      page: 1
    }, () => {
      this.loadRecommendedStories()
    })
  },

  // 分类点击
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    wx.showToast({
      title: `进入${category}分类`,
      icon: 'none'
    })
  },

  // 加载推荐故事
  loadRecommendedStories() {
    this.setData({ loading: true })

    // 模拟数据
    const mockStories = [
      {
        id: 'ST001',
        title: '深夜图书馆的神秘事件',
        theme: '悬疑惊悚',
        preview: '那天晚上，我在图书馆值夜班，突然听到古籍区传来奇怪的声音。当我走过去时，发现一本古书正在自动翻页...',
        views: 1520,
        likes: 89,
        participants: 4,
        author: '小明同学',
        createTime: '2小时前'
      },
      {
        id: 'ST002',
        title: '未来世界的爱情故事',
        theme: '浪漫爱情',
        preview: '在人工智能高度发达的未来，我遇到了一个特别的机器人。它有着人类的情感，却无法表达...',
        views: 980,
        likes: 67,
        participants: 3,
        author: '小美酱',
        createTime: '5小时前'
      },
      {
        id: 'ST003',
        title: '魔法学院的秘密社团',
        theme: '奇幻冒险',
        preview: '作为魔法学院的新生，我意外发现了一个隐藏在校园深处的秘密社团。他们似乎在策划着什么...',
        views: 1230,
        likes: 78,
        participants: 5,
        author: '魔法师Leo',
        createTime: '1天前'
      },
      {
        id: 'ST004',
        title: '都市职场生存指南',
        theme: '现实生活',
        preview: '刚入职场的我，面对复杂的人际关系和高压的工作环境，逐渐学会了如何在都市中生存...',
        views: 870,
        likes: 45,
        participants: 3,
        author: '职场小白',
        createTime: '2天前'
      }
    ]

    setTimeout(() => {
      this.setData({
        recommendedStories: mockStories,
        loading: false
      })
    }, 1000)
  },

  // 加载更多
  loadMoreStories() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    setTimeout(() => {
      // 模拟加载更多数据
      const newStories = [...this.data.recommendedStories, ...this.data.recommendedStories]
      this.setData({
        recommendedStories: newStories,
        loading: false,
        page: this.data.page + 1
      })
    }, 1500)
  },

  // 查看故事
  viewStory(e) {
    const story = e.currentTarget.dataset.story
    wx.showModal({
      title: '加入故事',
      content: `是否要加入故事《${story.title}》？`,
      confirmText: '加入',
      success: (res) => {
        if (res.confirm) {
          // 这里可以跳转到故事详情或直接加入
          wx.navigateTo({
            url: `/pages/room/room?storyId=${story.id}`
          })
        }
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadRecommendedStories()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  }
})