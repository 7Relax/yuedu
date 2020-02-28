var md5 = require('./md5.js');
module.exports = {
	sign : function(apiServer){
		// 环境判断非uni环境不支持
		if(!uni){return '...';}
		console.log('开始签名');
		// 连接服务器获取一个临时的accessToken
		uni.request({
			url: apiServer+'token&m=getAccessToken',
			method: 'GET',
			success: res => {
				/**
				 * 签名的作用:防止非法请求,提升后台接口安全(往往是执行一些敏感性的操作时要进行签名验证,通过则让执行,一般是在登录的时候就去获取签名)
				 * 此案例的签名过程:
				 * 	  客户端获取签名: 
				 * 		1 客户端向服务端获取随机的 明文token及time(时间戳)
				 * 		2 客户端执行md5(明文token + time)哈希特征值计算(要和后台用同样的计算策略),得到特征码A
				 * 		3 再将特征码A 与 明文token进行字符串连接得到签名B
				 * 		4 将此签名保存到本地Storage
				 * 	  签名验证
				 *      5 客户端从本地Storage中取出签名B,将其发送给服务端
				 *      6 服务端按照约定的规则将签名B截取出 特征码A + 明文token
				 *      7 服务端去数据库或者Redis缓存中查找是否有这个 明文token, 若有则拿出此明文token对应的time, 进行md5(明文token + time)得到特征码C
				 *      8 比对特征码A 与 特征码C,一致则签名验证通过 并将数据库或Redis中的这条记录删除,继续执行原来程序要执行的操作,否则拒绝操作
				 */
				console.log(res);
				if(res.data.status != 'ok'){return ;}
				var data = res.data.data;
				// 对 accessToken 进行md5加密
				var accessToken = md5.hex_md5(data.token + data.time);
				// 签名 = md5(accessToekn + time) + '-' + 'accessToekn';
				var sign = accessToken + '-' + data.token;
				//console.log(sign);
				// 记录在本地
				uni.setStorage({
					key:"sign",
					data:sign
				});
				console.log('sign.js >> 签名完成');
			},
			fail:function(e){
				console.log(JSON.stringify(e));
			}
		});
	}
}