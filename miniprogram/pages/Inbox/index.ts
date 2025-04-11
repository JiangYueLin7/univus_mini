interface ContentCard {
  imageUrl: string;
  title: string;
  content: string;
}
// inbox.ts
Page({
  data: {
    tabs: [
      "NUS Alert", "Emergency", "Notification",
      "Feed", "Bookmarks", "Following"
    ],
    activeTab: 0,
    contentCards: [
      {
        imageUrl: '/pictures/Maps-e-banner-for-uNivUS-website_updated.png',
        title: '[Test] Will you become the next shining beacon?',
        content: 'Teach Singapore — 寻找学生导师！Looking for mentoring opportunity? Teach Singapore wants you! Teach Singapore is a university-wide initiative aimed at involving N...'
      },
      {
        imageUrl: '/pictures/uNivUS_Website_Banner_ContactCard_new.png',
        title: `Contact Card
        Share and edit your contact information easily via the Digital ID!
        
        Tap on and drag the tab “My Contact/Business Card” upwards.`,
        content: `Contact Card
        Share and edit your contact information easily via the Digital ID!
        
        Tap on and drag the tab “My Contact/Business Card” upwards.
        
        You will see tabs for two QR codes:
        
        1. Your contact card QR code which will share your contact details for saving to another phone.
        
        2. Your LinkedIn QR code which will open up your LinkedIn profile page.
        
        People you meet can now save your contact details with a single scan!`
      }],
  },

  switchTab(e: any) {
    const index = e.currentTarget.dataset.index
    this.setData({ activeTab: index })
  },

  onReadMore() {
    wx.showToast({ title: '展开全文', icon: 'none' })
  }
})