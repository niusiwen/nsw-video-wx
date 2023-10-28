const app = getApp()

Page({
    data: {
      bgmList: [],
      serverUrl: "",
      videoParams: {}
    },

    onLoad: function (params) { //params接受页面传过来的参数，object格式
      var me = this;
      console.log(params)
      me.setData({
        videoParams: params
      });
      wx.showLoading({
        title: '请等待...',
      });
      var serverUrl = app.serverUrl;
      var user = app.getGlobalUserInfo();
      // 调用后端 加载背景音乐列表
      wx.request({
        url: serverUrl + '/bgm/list',
        method: "POST",
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': user.id,
          'headerUserToken': user.userToken
        },
        success: function (res) {
          console.log(res.data);
          wx.hideLoading();
          if (res.data.status == 200) {
            var bgmList = res.data.data;
            me.setData({
              bgmList: bgmList,
              serverUrl: serverUrl
            })
          } else if (res.data.status == 502) {
            wx.showToast({
              title: res.data.msg,
              duration: 2000,
              icon: "none",
              success: function () {
                wx.redirectTo({
                  url: '../userLogin/login',
                })
              }
            });
          }
        }
      })
    },

    upload: function(e) {
      var me = this;

      var bgmId = e.detail.value.bgmId;
      var desc = e.detail.value.desc;

      console.log("bgmId="+ bgmId);
      console.log("desc=" + desc);

      var duration = me.data.videoParams.duration;  //视频时长
      var tmpHeight = me.data.videoParams.tmpHeight;   //视频高度
      var tmpWidth = me.data.videoParams.tmpWidth;     //视频宽度
      var tmpVideoUrl = me.data.videoParams.tmpVideoUrl;  //视频的临时路径
      var tmpCoverUrl = me.data.videoParams.tmpCoverUrl; //图片的临时路径

      //上传短视频
      wx.showLoading({
        title: '上传中...',
      })
      var serverUrl = app.serverUrl;
      //fixme 修改原有的全局对象为本地缓存
      var userInfo = app.getGlobalUserInfo();
      wx.uploadFile({   //微信上传文件的api
        url: serverUrl + '/video/upload',  
        formData: {
          userId: userInfo.id,  //fixme 原来的 app.userInfo.id
          bgmId: bgmId,
          desc: desc,
          videoSeconds: duration,
          videoHeight: tmpHeight,
          videoWidth: tmpWidth
        },
        filePath: tmpVideoUrl,
        name: 'file',
        header: {
          'content-type': 'application/json', // 默认值
          'headerUserId': userInfo.id,
          'headerUserToken': userInfo.userToken
        },
        success: function (res) {
          var data = JSON.parse(res.data);
          wx.hideLoading();
          if (data.status == 200) {
            wx.showToast({
              title: '上传成功!~~',
              icon: "success"
            });
            //返回上一个页面
            wx.navigateBack({
                delta: 1,
            })
            //
            // var videoId = data.data;
            // //上传封面
            // wx.showLoading({
            //   title: '上传中...',
            // })
            // wx.uploadFile({   //微信上传文件的api
            //   url: serverUrl + '/video/uploadCover',  //app.userInfo.id,
            //   formData: {
            //     userId: app.userInfo.id,
            //     videoId: videoId
            //   },
            //   filePath: tmpCoverUrl,
            //   name: 'file',
            //   header: {
            //     'content-type': 'application/json', // 默认值
            //   },
            //   success: function (res) {
            //     var data = JSON.parse(res.data);
            //     wx.hideLoading();
            //     if (data.status == 200) {
            //       wx.showToast({
            //         title: '上传成功!~~',
            //         icon: "success"
            //       });
            //       //返回上一个页面
            //       wx.navigateBack({
            //         delta: 1,
            //       })
            //     } else {
            //       wx.showToast({
            //         title: '上传失败!~~',
            //         icon: "success"
            //       });
            //     }

            //   }
            // })

          } else if (res.data.status == 502) {
            wx.showToast({
              title: res.data.msg,
              duration: 2000,
              icon: "none"
            });
            wx.redirectTo({
              url: '../userLogin/login',
            })
          } else {
            wx.showToast({
              title: '上传失败!~~',
              icon: "success"
            });
          }

        }
      })

    }
    
})

