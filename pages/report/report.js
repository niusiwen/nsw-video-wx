const app = getApp()

Page({
    data: {
        reasonType: "请选择原因",
        reportReasonArray: app.reportReasonArray,
        publishUserId:"",
        videoId:""
    },

    onLoad:function(params) {
      var me = this;
      //获取传过来的参数
      var videoId = params.videoId;
      var publishUserId = params.publishUserId;
      //放到data中
      me.setData({
        publishUserId: publishUserId,
        videoId: videoId
      });
    },

    //picker选择器的选定函数
    changeMe:function(e) {
      var me = this;
      //获取选择的下标值
      var index = e.detail.value;
      var reasonType = app.reportReasonArray[index];
      //放入data中以显示出来
      me.setData({
        reasonType: reasonType
      });
    },

    //提交举报信息函数
    submitReport:function(e) {
      var me = this;
      //获取form表单中填入的值
      var reasonIndex = e.detail.value.reasonIndex;
      var reasonContent = e.detail.value.reasonContent;
      //获取当前的user对象
      var user = app.getGlobalUserInfo();
      var currentUserId = user.id;
      //判断举报原因是否为空
      if (reasonIndex == null || reasonIndex == '' || reasonIndex == undefined) {
        wx.showToast({
          title: '选择举报理由',
          icon: "none"
        })
        return;
      }
      //请求接口 提交数据
      var serverUrl = app.serverUrl;
      wx.request({
        url: serverUrl + '/user/reportUser',
        method: 'POST',
        data: {
          dealUserId: me.data.publishUserId,
          dealVideoId: me.data.videoId,
          title: app.reportReasonArray[reasonIndex],
          content:reasonContent,
          userid: currentUserId
        },
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        success:function(res) {
          wx.showToast({
            title: res.data.msg,
            duration: 2000,
            icon: 'none',
            success: function() {
              wx.navigateBack();
            }
          })
        }

      })

    }
    
})
