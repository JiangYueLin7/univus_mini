Page({
  data: {
    showCalendar: true,
    selectedDate: "", // 默认选中当前日期
    minDate: new Date(2023, 0, 1).getTime(),
    maxDate: new Date(2025, 11, 31).getTime(),
  },
  onReady() {
    this.setData({ showCalendar: true })
  },
  // 打开日历弹窗
  /**
   * 打开日历视图。
   * 该方法设置 `showCalendar` 数据属性为 `true`，从而在界面上显示日历组件。
   */
  openCalendar() {
    this.setData({ showCalendar: true });
  },

  // 关闭日历弹窗
  closeCalendar() {
    this.setData({ showCalendar: false });
  },
  onConfirm(e: any) {
    const selectedDate = e.detail ? new Date(e.detail).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' }) // 指定时区为中国上海
    : undefined;
    console.log(e)
    console.log('Selected date:', selectedDate);
    this.setData({
      selectedDate: selectedDate
    });
    this.closeCalendar();
  },
  // 处理日期选择事件
  onDateSelect(e: any) {

    // 假设 e.detail.date 是一个时间戳
    const timestamp = e.detail.date;

    // 创建一个新的 Date 对象
    const date = new Date(timestamp);

    // 获取年、月、日
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份是从0开始的，所以需要加1
    const day = date.getDate();

    // 拼接成年月日字符串
    const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;

    this.setData({
      selectedDate: formattedDate as string | undefined
    });
  }
});