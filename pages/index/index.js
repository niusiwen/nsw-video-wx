const app = getApp()

Page({
  data: {
    //用于分页的属性
    totalPage: 1,
    page: 1,
    videoList: [],

    screenWidth: 350,
    serverUrl: "", //展示图片
    searchContent: ""
  },

  onLoad: function (params) {
    var me = this;  
    var screenWidth = wx.getSystemInfoSync().screenWidth;//wx.getSystemInfoSync()：获取系统信息同步接口
    //var newVideolist = me.data.videoList; 
    me.setData({
      screenWidth: screenWidth
    });
    //获取页面跳转传过来的参数
    var searchContent = params.search;
    var isSaveRecord = params.isSaveRecord;
    if (isSaveRecord == null || isSaveRecord == '' || isSaveRecord == undefined) {
      isSaveRecord = 0;
    }
    me.setData({
      searchContent: searchContent
    });

    //获取当前分页数
    var page = me.data.page;
    //调用获取视频列表的方法
    me.getAllVideoList(page, isSaveRecord);
  },

  //请求视频列表的封装方法
  getAllVideoList: function (page, isSaveRecord) {
    var me = this;  
    var serverUrl = app.serverUrl;
    wx.showLoading({
      title: '请等待，加载中...',
    })
    //
    var searchContent = me.data.searchContent;
    wx.request({
      url: serverUrl + '/video/showAll?page=' + page + "&isSaveRecord=" + isSaveRecord,
      method: "POST",
      data: {
        videoDesc: searchContent
      },
      success: function (res) {
        wx.hideLoading();
        wx.hideNavigationBarLoading();//隐藏在当前页面显示导航条加载动画
        wx.stopPullDownRefresh(); //停止当前页面的下拉刷新

        console.log(res.data);
        //判断当前页是否是第一页，如果是第一页，那么设置videoList为空
        if (page === 1) {
          me.setData({
            videoList: []
          })
        }
        //
        var videoList = res.data.data.rows;
        var newVideList = me.data.videoList;
        me.setData({
          videoList: newVideList.concat(videoList),//将新旧视频列表拼接
          page: page,
          totalPage: res.data.data.total,
          serverUrl: serverUrl
        })
      }
    })
  },

  //微信的页面上拉方法，用之前要先在json文件的配置开启
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
    this.getAllVideoList(1, 0);
  },

  //微信的页面下拉方法
  onReachBottom:function() {
    var me = this;
    var currentPage = me.data.page;
    var totalPage = me.data.totalPage;

    //判断当前页数和总页数是否相等，如果相等则则需查询
    if (currentPage === totalPage){
      wx.showToast({
        title: '已经没有视频了',
        icon: "none"
      })
      return;
    }

    var page = currentPage + 1;
    me.getAllVideoList(page, 0);
  },

  showVideoInfo:function(e) {
    var me = this;
    var videoList = me.data.videoList;
    var arrindex = e.target.dataset.arrindex;//
    var videoInfo = JSON.stringify(videoList[arrindex]);

    wx.redirectTo({
      url: '../videoinfo/videoinfo?videoInfo=' + videoInfo,
    })
  }
})
