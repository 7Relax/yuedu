<template>
	<view class="grace-padding">
		<view class="myface"><image :src="myFace" mode="widthFix"></image></view>
		<view style="text-align:center; margin:10px 0;">
			{{user.u_name}} <text style="color: #888888;" @tap="logoff"> 注销</text>
		</view>
		<view class="grace-box-banner" style="margin:10rpx 0;">
			<view class="garce-items">
				<view class="line1">{{user.artCount}}</text></view>
				<view class="line2">文章</view>
			</view>
			<view class="garce-items">
				<view class="line1">{{user.u_integral}}</text></view>
				<view class="line2">积分</view>
			</view>
			<view class="garce-items">
				<view class="line1">{{user.u_remainder}}</text></view>
				<view class="line2">余额</view>
			</view>
			<view class="garce-items">
				<view class="line1">0</text></view>
				<view class="line2">消息</view>
			</view>
		</view>
		<view class="grace-title grace-nowrap grace-space-between">
			<view class="grace-h5 grace-blod">我的文章</view>
		</view>
		<view class="myart-list" v-for="(item, index) in arts" :key="index">
			<view class="title">{{item.art_title}}</view>
			<view class="btns">
				<view :data-artid="item.art_id"  @tap="editArt">编辑</view>
				<view :data-artid="item.art_id" :data-index="index" @tap="removeArt">删除</view>
			</view>
		</view>
		<view class="loadMore" @tap="getArtList">{{loadMore}}</view>
	</view>
</template>

<script>
var loginRes;
export default {
	data() {
		return {
			myFace: '',
			user: {},
			arts: [],
			loadMore: '点击加载更多',
			page: 1, // 默认加载第一页的文章，每页多少数量是后台写的
		}
	},
	onLoad: function() {
		loginRes = this.checkLogin('../my/my', 2);
		if (!loginRes) {return;}
		// 页面加载后记录头像
		this.myFace = loginRes[3]; // return [SUID, SRAND, SNAME, SFACE];
	},
	onShow : function() {
		loginRes = this.checkLogin('../my/my', 2);
		if (!loginRes) {return false;}
		// 加载会员信息
		this.loadUserInfo();
		// 重置数据
		this.arts = [];
		this.page = 1;
		this.loadMore = '点击加载更多';
		this.getArtList();
	},
	methods: {
		loadUserInfo() {
			// 加载会员信息
			uni.request({
				url: this.apiServer + 'my&m=info',
				method: 'POST',
				header: {'content-type' : "application/x-www-form-urlencoded"},
				data: {
					uid    : loginRes[0],
					random : loginRes[1]
				},
				success: res => {
					console.log(JSON.stringify(res));
					if (res.data.status == 'ok') {
						this.user = res.data.data;
						console.log(JSON.stringify(this.user));
					}
				}
			});
		},
		getArtList: function() {
			if (this.loadMore != '点击加载更多') {return;}
			this.loadMore = '加载中...';
			uni.request({
				url: this.apiServer + 'my&m=arts&page=' + this.page,
				method: 'POST',
				header: {'content-type' : "application/x-www-form-urlencoded"},
				data: {
					uid : loginRes[0],
					random : loginRes[1]
				},
				success: res => {
					if (res.data.status == 'ok') {
						this.arts = this.arts.concat(res.data.data);
						this.page ++;
						this.loadMore = '点击加载更多';
					} else if (res.data.status == 'empty') {
						this.loadMore = '已经加载全部';
					} else {
						this.loadMore = '点击加载更多';
					}
				}
			});
		},
		editArt(e) {
			// 注意 :data-artid 中的 artid 不能写能 artId，否则读取不到
			var artId = e.currentTarget.dataset.artid;
			console.log(artId);
			uni.navigateTo({
				url: "../editArt/editArt?artId=" + artId
			});
		},
		removeArt(e) {
			var artId = e.currentTarget.dataset.artId;
			var index = e.currentTarget.dataset.index;
			uni.showModal({
				title:"提示",
				content:"确定要删除吗?",
				success: (e) => {
					if (e.confirm) {
						uni.request({
							url: this.apiServer + 'my&m=removeArt',
							method: 'POST',
							header: {'content-type' : "application/x-www-form-urlencoded"},
							data: {
								uid : loginRes[0],
								random : loginRes[1],
								artId : artId
							},
							success: (res) => {
								if (res.data.status == 'ok') {
									uni.showToast({title: "已删除", icon:"none"});
									this.arts.splice(index, 1);
									// 刷新积分，通过加载会员信息
									this.loadUserInfo();
								} else {
									uni.showToast({title: "删除失败", icon:"none"});
								}
							}
						});
					}
				}
			});
		},
		logoff() {
			
		}
	}
}
</script>

<style>
.myface{width:88px; height:88px; border:5px solid #F1F2F3; border-radius:100%; margin:15px auto;}
.myface image{width:100%; border-radius:100%;}
.myart-list{width:100%; margin:8px 0; overflow:hidden; border-bottom:1px dashed #D7D8D9;}
.myart-list .title{line-height:2em; width:100%;}
.myart-list .btns{line-height:2em; width:100%;}
.myart-list .btns view{float:right; padding:0 6px; margin:0 5px; color:#00B26A;}
.myart-list .btns view:last-child{color:#F76260;}
.loadMore{width:100%; padding:8px 0; text-align:center; color:#CCCCCC;}
</style>
