<template>
	<view>
		index ...
	</view>
</template>

<script>
export default {
	data() {
		
	},
	onLoad() {
		uni.request({
			// http://10.211.55.12/index.php?token=...&c=member&m=index
			url: this.apiServer+'member', // 若是调用index方法，则可以不写
			method: 'GET',
			data: {},
			success: res => {
				console.log("index >> success ...");
				// console.log(JSON.stringify(res));
			},
			fail: (e) => {
				console.log("index >> fail ...");
				console.log(JSON.stringify(e));
			}
		});
	}
}
</script>

<style>
	
</style>
