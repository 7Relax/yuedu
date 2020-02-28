<template>
	<view>
		<!-- #ifdef MP-WEIXIN -->
		<button type="primary" open-type="getUserInfo" @getuserinfo="getUserInfo">使用微信登录</button>
		<!-- #endif -->
	</view>
</template>

<script>
var _self;
var openid, session_key, pageOptions;
var sign = require("../../commons/sign.js");
export default {
	methods: {
		/**
		 * 这个方法最终会提交用户信息到业务的后台去（登录的操作，若是用第三方微信登录，则需要提交用户的微信信息）
		 * 1、getUserInfo()这个方法的返回值是用户的基本信息（是从微信传回的信息，里面没有openId等信息）
		 */
		getUserInfo: function(info) {
			/** 
			 微信小程序AppID分为：个人版微信小程序AppID、企业版微信小程序AppID
			 注意：如果是企业认证的appId，返回值里会有加密的信息，解密后则可以拿到unionId
			 小程序端整个过程（unionId版，可做到多端的同步登录）：
			 1、通过weixin.login获取code
			 2、通过code去换取sessionKey
			 3、用户点击微信登录后（调用getUserInfo）会获取到用户的基本信息和加密信息，通过将加密信息传递给服务端，服务端解密后返回明文
			 4、获取unionId，小程序和App这些应用都能拿到unionId，只要这些应用都是添加到同一个开发者账户下的，则unionId是一样的，但openId不一样！
				相关数据
					var encryptedData = info.mp.detail.encryptedData;  // 加密数据 !!!
					var iv            = info.mp.detail.iv;
					var signature     = info.mp.detail.signature;
					var uInfo         = info.mp.detail.userInfo;
			    与服务器端交互进行解密，以下代码只是在unionId版本的写法
				    uni.request({
					    url: _self.apiServer+'member&m=wxaes', // 地址
					    method: 'POST',
					    header: {'content-type': 'application/x-www-form-urlencoded'},
					    data: {
						    session_key: session_key,
						    encryptedData: encryptedData,
						    iv: iv
					    },
					    success: res => {
						// 此处可以获取unionId，利用unionId完成登录即可
					    }
				    });
			 */
			// 向本地获取签名信息
			var sign = uni.getStorageSync('sign');
			// 发起登录请求（openId版）
			// var info = info.mp.detail.userInfo; // 结构和App端返回的不太一样，因为没有appId所以获得不到正确的info，故先注释掉
			/** 返回的userInfo里头没有 openId、session_key，       userInfo这段是注释，看结构而已！
			    userInfo = {
					avatarUrl: "",
					city: "",
					country: "",
					gender: 1,
					language: "zh_CN",
					nickName: "",
					province: ""
			    }
			 */
			uni.request({
				url: _self.apiServer+'member&m=login',
				method: 'POST',
				header: {'content-type': 'application/x-www-form-urlencoded'}, // POST请求要加header
				data: {
					openid: openid, // 此openid全局变量，是在页面加载完毕时就已经拿到了，后台是以用户的openId来做为用户登录的凭证
					// name:   info.nickName,
					// face:   info.avatarUrl,
					name:   '张三',
					face:   'http://test123',
					sign:   sign
				},
				success: res => {
					console.log(res);
					var resp = res.data;
					if (resp.status == 'ok') {
						uni.showToast({title: '登录成功'});
						// 将后台返回的用户信息存到前端本地，我们采用同步写入前端本地
						uni.setStorageSync('SUID', resp.data.u_id + '');
						uni.setStorageSync('SRAND', resp.data.u_random + '');
						uni.setStorageSync('SNAME', resp.data.u_name + '');
						uni.setStorageSync('SFACE', resp.data.u_face + '');
						// 跳转 {"backpage":"../write/write","backtype":"2"} 
						if (pageOptions.backpage == '1') { // 约定的而已
							uni.redirectTo({url: pageOptions.backpage})
						} else {
							uni.switchTab({url: pageOptions.backpage})
						}
					} else {
						uni.showToast({title: '登录失败', icon: 'none'});
					}
				},
				fail: () => {
				}
			});
			// 模拟登录成功
			// uni.showToast({title: '登录成功'});
			// uni.setStorageSync('SUID', '123');
			// uni.setStorageSync('SRAND', '456');
			// uni.setStorageSync('SNAME', '小明');
			// uni.setStorageSync('SFACE', 'fjdsafdsa');
			// // 跳转 {"backpage":"../write/write","backtype":"2"} 
			// if (pageOptions.backpage == '1') { // 约定的而已
			// 	uni.redirectTo({url: pageOptions.backpage})
			// } else {
			// 	uni.switchTab({url: pageOptions.backpage})
			// }
			
			/* 以下代码是ok（openId版）主要是因为没有appId，先注释掉 */
			// var info = info.mp.detail.userInfo; // 结构和App端返回的不太一样
			/** 返回的userInfo里头没有 openId、session_key，  userInfo这段是注释，看结构而已
			    userInfo = {
					avatarUrl: "",
					city: "",
					country: "",
					gender: 1,
					language: "zh_CN",
					nickName: "",
					province: ""
			    }
			 */
			// 向本地获取签名信息
			// var sign = uni.getStorageSync('sign');
			// 发起登录请求
			// uni.request({
			// 	url: _self.apiServer+'member&m=login',
			// 	method: 'POST',
			// 	header: {'content-type': 'application/x-www-form-urlencoded'}, // POST请求要加header
			// 	data: {
			// 		openid: openid, // 此openid全局变量，是在页面加载完毕时就已经拿到了，后台是以用户的openId来做为用户登录的凭证
			// 		name:   info.nickName,
			// 		face:   info.avatarUrl,
			//      sign:   sign
			// 	},
			// 	success: res => {
			// 		console.log(res);
			// 		var resp = res.data;
			// 		if (resp.status == 'ok') {
			// 			uni.showToast({title: '登录成功'});
			// 			// 将后台返回的用户信息存到前端本地，我们采用同步写入前端本地
			// 			uni.setStorageSync('SUID', resp.data.u_id + '');
			// 			uni.setStorageSync('SRAND', resp.data.u_random + '');
			// 			uni.setStorageSync('SNAME', resp.data.u_name + '');
			// 			uni.setStorageSync('SFACE', resp.data.u_face + '');
			// 			// 跳转 {"backpage":"../write/write","backtype":"2"} 
			// 			if (pageOptions.backpage == '1') { // 约定的而已
			// 				uni.redirectTo({url: pageOptions.backpage})
			// 			} else {
			// 				uni.switchTab({url: pageOptions.backpage})
			// 			}
			// 		} else {
			// 			// 登录失败
			// 		}
			// 	},
			// 	fail: () => {
			// 	}
			// });
		}
	},
	// 当此页面被加载的时候
	onLoad: function(options) {
		// 复制一份options
		pageOptions = options;
		console.log(JSON.stringify(options));
		// 复制Vue实例
		_self = this;
		// 向服务器获取签名信息并记录在本地
		sign.sign(_self.apiServer);
		
		// 微信开放平台申请应用的appId等（第三方平台 开发接入）：https://open.weixin.qq.com
		/**
		 * 微信（小程序进入login页面时，uniapp封装的login方法就会向微信服务器发起请求，若没有在manifest.json正确的填写appId，
		 *      则获取不到正确的code值，这个code值的作用是：可以通过此code拿到用户的openId、sessionKey等信息，
		 *      即：页面一旦加载成功，我们也就将用户的openId等信息拿到手了）
		 */
		// #ifdef MP-WEIXIN
		uni.login({
			provider: 'weixin',
			success: (loginRes) => {
				console.log(loginRes);
				// {"errMsg":"login:ok","code":"the code is a mock one"}  --- code不正确，这个是因为微信小程序appId没有填写
				/**
				 * 小程序中若要使用微信登录，其过程与App端使用微信登录的流程不太一样，
				 * 1、小程序要通过一个open-type="getUserInfo"的按钮去选择微信登录，App不需要这样；
				 * 2、点击按钮可以获得用户的其它的信息
				 */
				uni.request({
					url: _self.apiServer+'member&m=codeToSession&code='+loginRes.code, // 疑问：为何前端不直接发起向微信的请求，需要让后台发起？
					method: 'GET',
					success: res => {
						console.log(res);
						// 后台返回的数据，由于code是非法数据，因为拿不到openid等信息，所以模拟一下数据
						// openid = res.data.openid;
						// session_key = res.data.session_key;
						openid = '1234567890';
						session_key = 'test666777888';
					}
				});
			},
			fail: (e) => {
				uni.showToast({title: "weixin >> 微信登录失败", icon:"none"});
			}
		})
		// #endif
		
		// app
		// #ifdef APP-PLUS
		uni.getProvider({ // 获取服务供应商
		    service: 'oauth',
		    success: function (res) {
		        console.log(res.provider);
		        if (res.provider.indexOf('weixin')) {
					uni.login({
						provider: 'weixin',  // 指定供应商
						/* {"errMsg":"getUserInfo:ok",
						    "userInfo":
								{"openId":"oRrdQtyf6FLDP0lERvP5E3cKJ3GY",
								"nickName":"风偏偏、雨渐渐","gender":1,"city":"Guangzhou",
								"province":"Guangdong","country":"China",
								"avatarUrl":"http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJWYXISZNM2z09LRMd3f03vR8kpOicichnGVrlYIdU0ic4iaP2tXxm33PiaGaMm5lPH4yX6oe49QYCakMA/132",
								"unionId":"oU5YytziXaNdT30t8IqfKADRfOzM"}
							}*/
						success: (loginRes) => {
							console.log(JSON.stringify(loginRes));
							uni.getUserInfo({
								success: (info) => {
									// 成功从微信拿到用户信息
									console.log(JSON.stringify(info));
									// 向本地获取签名信息
									var sign = uni.getStorageSync('sign');
									console.log("login >> app >> sign = "+sign);
									uni.request({
										url: _self.apiServer+'member&m=login',
										method: 'POST',
										header: {'content-type': 'application/x-www-form-urlencoded'},
										data: {
											openid: info.userInfo.openId,
											name:   info.userInfo.nickName,
											face:   info.userInfo.avatarUrl,
											sign:   sign
										},
										success: res => {
											console.log(JSON.stringify(res));
											var resp = res.data;
											if (resp.status == 'ok') {
												uni.showToast({title: "登录成功"});
												// 将后台返回的用户信息存到前端本地，我们采用同步写入前端本地
												uni.setStorageSync('SUID', resp.data.u_id + '');
												uni.setStorageSync('SRAND', resp.data.u_random + '');
												uni.setStorageSync('SNAME', resp.data.u_name + '');
												uni.setStorageSync('SFACE', resp.data.u_face + '');
												// 跳转 {"backpage":"../write/write","backtype":"2"} 
												if (options.backpage == '1') { // 约定的而已
													uni.redirectTo({url: options.backpage});
												} else {
													uni.switchTab({url: options.backpage});
												}
											} else {
												// 登录失败
												uni.showToast({title: "登录失败", icon:"none"});
											}
										},
										fail: (e) => {
											console.log(JSON.stringify(e));
										}
									});
								},
								fail: () => {
									uni.showToast({title: "2 >>微信登录获取用户信息失败", icon:"none"});
								}
							})
						},
						fail: () => {
							uni.showToast({title: "1 >> 微信登录授权失败", icon:"none"});
						}
					})
		        }
		    }
		});
		// #endif
	},
}
</script>

<style>

</style>
