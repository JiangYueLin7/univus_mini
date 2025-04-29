
interface Card {
  title: string;
  subtitle: string;
  iconType: string;
  imageUrl: string;
}

Page({
  data: {
    cards: // 保留原始imageUrl路径的12个卡片数据
      [
        // 原有核心卡片（保留原始路径）
        {
          title: "Admissions",
          subtitle: "Undergraduate Programs",
          iconType: "Admissions",
          imageUrl: '/pictures/biometrics-150x150.png' // 保留截图中的原始路径
        },
        {
          title: "Academic",
          subtitle: "Graduate Studies",
          iconType: "Academic",
          imageUrl: '/pictures/Bus-Widget-150x150.png' // 保留原数据路径
        },
        {
          title: "Financial Aid",
          subtitle: "Scholarships",
          iconType: "Financial",
          imageUrl: '/pictures/Crowd-Insight-150x150.png' // 保留原数据路径
        },

        // 新增子类（复用原始路径）
        {
          title: "International Admissions",
          subtitle: "Global Applicants",
          iconType: "Admissions",
          imageUrl: '/pictures/biometrics-150x150.png' // 复用Admissions图标
        },
        {
          title: "Research Centers",
          subtitle: "Academic Facilities",
          iconType: "Research",
          imageUrl: '/pictures/Digital-ID-150x150.png' // 复用Digital-ID路径
        },
        {
          title: "Career Services",
          subtitle: "Job Placement",
          iconType: "Career",
          imageUrl: '/pictures/eAttendance-1-150x150.png' // 复用eAttendance路径
        },

        // 功能扩展（保持路径复用）
        {
          title: "Residential Life",
          subtitle: "Dormitory Services",
          iconType: "Residential",
          imageUrl: '/pictures/Digital-ID-150x150.png' // 复用宿舍相关图标
        },
        {
          title: "Health Services",
          subtitle: "Medical Care",
          iconType: "Health",
          imageUrl: '/pictures/Digital-ID-150x150.png' // 复用医疗相关图标
        },
        {
          title: "Library Resources",
          subtitle: "Digital Collections",
          iconType: "Library",
          imageUrl: '/pictures/Digital-ID-150x150.png' // 统一使用数字资源图标
        },

        // 底部按钮专用（匹配截图）
        {
          title: "Apply Now",
          subtitle: "Admissions Portal",
          iconType: "Admissions",
          imageUrl: '/pictures/biometrics-150x150.png' // 完全匹配截图按钮图标
        },
        {
          title: "Alumni Network",
          subtitle: "Graduate Connections",
          iconType: "Alumni",
          imageUrl: '/pictures/Digital-ID-150x150.png' // 复用现有图标
        },
        {
          title: "Campus Tours",
          subtitle: "Virtual Visits",
          iconType: "Campus",
          imageUrl: '/pictures/Digital-ID-150x150.png' // 统一使用数字资源图标
        }
      ] as Card[],
    searchText: '', // 用户输入的搜索文本
    filteredCards: [] as Card[]// 过滤后的卡片数据
  },

  onLoad() {
    // 初始化时显示所有卡片
    this.setData({
      filteredCards: this.data.cards
    });
  },
  onInputChange(e: WechatMiniprogram.Input) {
    const searchText = e.detail.value;
    this.setData({
      searchText: searchText
    });
    this.filterCards(searchText);
  },

  filterCards(searchText: string) {
    if (!searchText) {
      // 如果搜索文本为空，显示所有卡片
      this.setData({
        filteredCards: this.data.cards
      });
      return;
    }

    const filtered = this.data.cards.filter(card => {
      // 根据标题和副标题进行过滤
      return card.title.toLowerCase().includes(searchText.toLowerCase()) || card.subtitle.toLowerCase().includes(searchText.toLowerCase());
    });

    this.setData({
      filteredCards: filtered
    });
  }
})