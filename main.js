import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
// Vue扩展方法
Vue.prototype.checkLogin = function(backpage, backtype) {
	// backpage: 登录后要返回的页面; backtype: 打开页面的类型[1: redirectTo, 2: switchTab]
	var SUID  = uni.getStorageSync('SUID');
	var SRAND = uni.getStorageSync('SRAND');
	var SNAME = uni.getStorageSync('SNAME');
	var SFACE = uni.getStorageSync('SFACE');
	if (SUID == '' || SRAND == '' || SFACE == '') {
		// 未登录则重定向到登录页面
		uni.redirectTo({
			url: '../login/login?backpage='+backpage+'&backtype='+backtype
		})
		return false;
	}
	// 登录成功 返回用户信息后续操作会用到 http://296883fh32.wicp.vip/index.php?token=api2018&c=member
	return [SUID, SRAND, SNAME, SFACE];
}
//
var APITOKEN = 'api2018';
Vue.prototype.apiServer = 'http://296883fh32.wicp.vip/index.php?token='+APITOKEN+'&c=';
//

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
