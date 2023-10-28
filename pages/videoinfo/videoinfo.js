var videoUtil = require('../../utils/videoUtil.js')

const app = getApp()

Page({
  data: {
    cover: "cover",
    videoId: "",
    src: "",
    videoInfo: {},

    userLikeVideo: false,

    commentsPage: 1,
    commentsTotalPage: 1,
    commentsList: [],

    placeholder: "说点什么..."
  },
  //定义全局的视频上下文对象
  videoCts: {

  },

  onLoad:function(params) {
    var me = this;
    me.videoCts = wx.createVideoContext("myVideo", me);

    //获取上一个页面传入的数据 即视频的相关信息
    var videoInfo = JSON.parse(params.videoInfo);
    me.setData({
      videoId: videoInfo.id,
      src: app.serverUrl + videoInfo.videoPath,
      videoInfo: videoInfo,
    });
    //请求视频发布者的相关信息
    var serverUrl = app.serverUrl;
    var user = app.getGlobalUserInfo();
    var loginUserId = ""
    if (user != null && user != undefined && user != "") {
      loginUserId = user.id;
    }
    wx.request({
      url: serverUrl + '/user/queryPublisher?loginUserId=' + loginUserId + "&videoId=" + videoInfo.id + "&publishUserId=" + videoInfo.userId,
      method: 'POST',
      success: function(res) {
        console.log(res.data);
        var publisher = res.data.data.publisher;
        var userLikeVideo = res.data.data.userLikeVideo;
        me.setData({
          serverUrl: serverUrl,
          publisher: publisher,
          userLikeVideo: userLikeVideo
        })
      }
    })

    //查询评论列表
    me.getCommentsList(1);
  },

  onShow:function() {
    var me = this;
    me.videoCts.play();
  },

  onHide:function() {
    var me = this;
    me.videoCts.pause();
  },
  //查询图标的函数
  showSearch:function(){
    wx.navigateTo({
      url: '../searchVideo/searchVideo',
    })
  },
  //上传图标的函数
  upload:function() {
    var me = this;
    var user = app.getGlobalUserInfo();

    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;//使用？=会被过滤掉，这里#@代替

    if (user == null || user == undefined || user == "") {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      videoUtil.uploadVideo();
    }
    
  },
  //首页图标的函数
  showIndex:function() {
    wx.redirectTo({
      url: '../index/index',
    })
  },
  //个人信息图标的函数
  showMine:function() {
    var user = app.getGlobalUserInfo();

    if(user == null || user == undefined || user == "") {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    }else {
      wx.navigateTo({
        url: '../mine/mine',
      })
    }
  },
  //点赞图标
  likeVideoOrNot:function() {
    var me = this;
    var videoInfo = me.data.videoInfo;
    var user = app.getGlobalUserInfo();

    if (user == null || user == undefined || user == "") {
      wx.navigateTo({
        url: '../userLogin/login',
      })
    } else {
      
      var userLikeVideo = me.data.userLikeVideo;
      var url = "/video/userLike?userId=" + user.id + "&videoId=" + videoInfo.id + "&videoCreaterId=" + videoInfo.userId;
      if (userLikeVideo){
        url = "/video/userUnLike?userId=" + user.id + "&videoId=" + videoInfo.id + "&videoCreaterId=" + videoInfo.userId;
      }

      var serverUrl = app.serverUrl
      wx.request({
        url: serverUrl + url,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        success: function(res){
          wx.hideLoading();
          me.setData({
            userLikeVideo: !userLikeVideo
          })
        }
      })


    }
  },
  //点击头像 查看视频发布者信息
  showPublisher:function() {
    var me = this;
    var user = app.getGlobalUserInfo();

    var videoInfo = me.data.videoInfo;
    //拦截登陆后 进入原来页面的url
    var realUrl = '../mine/mine#publisherId@' + videoInfo.userId;//使用？=会被过滤掉，这里#@代替

    if (user == null || user == undefined || user == "") {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.navigateTo({
        url: '../mine/mine?publisherId=' + videoInfo.userId,
      })
    }
  },

  //分享图标
  shareMe: function(){
    var me = this;
    var user = app.getGlobalUserInfo();
    wx.showActionSheet({//​微信显示操作菜单的API
      itemList: ["下载到本地","举报用户","分享到朋友圈","分享到QQ空间","分享到微博"],
      success: function(res){
        console.log(res.tapIndex);//打印itemList下标值
        if (res.tapIndex == 0){
          //下载
          wx.showLoading({
            title: '下载中...',
          })
          //微信下载文件的API 下载到临时路径中
          wx.downloadFile({
            url: app.serverUrl + me.data.videoInfo.videoPath, 
            success: function (res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                // wx.playVoice({
                //   filePath: res.tempFilePath
                // })
                console.log(res.tempFilePath);
                //微信保存视频到本地相册的API
                wx.saveVideoToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success:function(res) {
                    console.log(res.errMsg);
                    wx.hideLoading();
                  }
                })
              }
            }
          })

        } else if (res.tapIndex == 1){
          //举报
          var videoInfo = JSON.stringify(me.data.videoInfo);
          var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;
          if (user == null || user == undefined || user == "") {
            wx.navigateTo({
              url: '../userLogin/login?redirectUrl=' + realUrl,
            })
          } else {
            var publishUserId = me.data.videoInfo.userId;
            var videoId = me.data.videoInfo.id;
            var currentUserId = user.id;
            wx.navigateTo({
              url: '../report/report?videoId=' + videoId + '&publishUserId=' + publishUserId ,
            })
          }

        } else {
          //分享
          wx.showToast({
            title: '官方暂未开放...',
            icon: 'none'
          })
        }
        // } else if (res.tapIndex == 3) {
        //   //分享到QQ空间
        // } else if (res.tapIndex == 4) {
        //   //分享到微博
        // }
          
      }
    })
  },

  //微信转发api
  onShareAppMessage: function (res) {
    // if (res.from === 'button') {
    //   // 来自页面内转发按钮
    //   console.log(res.target)
    // }

    var me = this;
    var videoInfo = me.data.videoInfo;

    return {
      title: '短视频内容分享',
      path: 'pages/videoinfo/videoinfo?videoInfo=' + JSON.stringify(videoInfo)
    }
  },

  //留言图标
  leaveComment:function(){
    this.setData({
      commentFocus: true,
    });
  },

  //回复留言的函数
  replyFocus:function(e){
    var fatherCommentId = e.currentTarget.dataset.fathercommentid; //
    var toUserId = e.currentTarget.dataset.touserid;
    var toNickname = e.currentTarget.dataset.tonickname; 
    //debugger;
    this.setData({
      placeholder: "回复 " + toNickname,
      replyFatherCommentId: fatherCommentId,
      replyToUserId: toUserId,
      commentFocus: true
    })
  },

  //发送留言
  saveComment:function(e){
    var me = this;
    var content = e.detail.value;

    //获取评论回复的fatherCommentId和toUserId
    var fatherCommentId = e.currentTarget.dataset.replyfathercommentid; //
    var toUserId = e.currentTarget.dataset.replytouserid;
    //debugger;
    var user = app.getGlobalUserInfo();
    var videoInfo = JSON.stringify(me.data.videoInfo);
    var realUrl = '../videoinfo/videoinfo#videoInfo@' + videoInfo;
    if (user == null || user == undefined || user == "") {
      wx.navigateTo({
        url: '../userLogin/login?redirectUrl=' + realUrl,
      })
    } else {
      wx.showLoading({
        title: '请稍后...',
      })
      wx.request({
        url: app.serverUrl + '/video/saveComment?fatherCommentId=' + fatherCommentId + '&toUserId=' + toUserId,
        method: 'POST',
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        data: {
          videoId: me.data.videoInfo.id,
          fromUserId: user.id,
          comment: content
        },
        success:function(res){
          console.log(res.data);
          wx.hideLoading();
          //评论成功后，输入框设置为空,评论列表清空去重新加载
          me.setData({
            contentValue: "",
            commentsList: []
          });
          //加载评论列表
          me.getCommentsList(1);
        }
      })
    }
  },

  //分页查询评论列表
  getCommentsList:function(page){
    var me = this;

    var videoId = me.data.videoInfo.id;

    wx.request({
      url: app.serverUrl + '/video/getVideoComments?videoId=' + videoId + '&page=' + page + '&pageSize=' + 5,
      method: 'POST',
      success:function(res){
        console.log(res.data);

        var commentsList = res.data.data.rows;
        var newCommentsList = me.data.commentsList;
        me.setData({
          commentsList: newCommentsList.concat(commentsList),
          commentsPage: page,
          commentsTotalPage: res.data.data.total
        });
      }
    })
  },

  //
  onReachBottom:function(){
    var me = this;
    var currentPage = me.data.commentsPage;
    var totalPage = me.data.commentsTotalPage;
    if (currentPage === totalPage){
      return;
    }
    var page = currentPage + 1;
    me.getCommentsList(page);
  }

})