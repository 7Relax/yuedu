<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide');
			// console.log('App Hide >> start ... ');
			// // 测试，清空
			// uni.setStorageSync('SUID', '');
			// uni.setStorageSync('SRAND', '');
			// uni.setStorageSync('SNAME', '');
			// uni.setStorageSync('SFACE', '');
			// console.log('App Hide >> end ... ');
		}
	}
</script>

<style>
	/*每个页面公共css*/
	@import url("graceUI/graceUI.css");
</style>
