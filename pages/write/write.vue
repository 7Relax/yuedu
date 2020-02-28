<template>
	<view>
		<view class="write_title">
			<input type="text" v-model="title" placeholder="请输入标题" />
		</view>
		<!-- 内容展示区 -->
		<view class="artList">
			<block v-for="(item, index) in artList" :key="index">
				<view class="item" v-if="item.type == 'image'">
					<image :src="item.content" :data-index="index" mode="widthFix" @tap="removeImg" />
				</view>
				<view class="item" v-if="item.type == 'text'">
					<textarea placeholder="" v-model="artList[index].content" />
					<view :data-index="index" class="deleteText" @tap="deleteText">删除</view>
				</view>
			</block>
		</view>
		<!-- 输入区 -->
		<form @submit="submit">
			<view class="inputArea">
				<view class="addImg" @tap="addImg">+图片</view>
				<view class="addText">
					<textarea name="artText" maxlength="-1" v-model="inputContent" placeholder="请输入文本" />
					<button type="primary" form-type="submit">添加</button>
				</view>
			</view>
		</form>
		<!-- 选择分类 -->
		<view class="art-cate">
			<view>文章分类</view>
			<view class="">
				<picker mode="selector" :range="caties" @change="cateChange">
					<view>{{caties[currentCateIndex]}}</view>
				</picker>
			</view>
		</view>
		<!-- 提交按钮 -->
		<view class="submitNow" v-if="artList.length > 0" @tap="submitNow">发布文章</view>
	</view>
</template>

<script>
var loginRes;
var signModel = require('../../commons/sign.js');
export default {
	data() {
		return {
			title : '',
			artList : [],
			inputContent : "",
			needUploadImg : [],
			uploadIndex : 0,
			//分类
			caties : ['点击选择'],
			currentCateIndex : 0,
			catiesFromApi : [],
			// 记录真实选择的api接口数据的分类id
			sedCateIndex  : 0
		}
	},
	onLoad: function() {
		// 检查是否登录
		loginRes = this.checkLogin('../write/write', 2);
		if (!loginRes) {return;}
		// 签名
		// signModel.sign(this.apiServer);
		// 加载文章分类
		uni.request({
			url: this.apiServer+'category&m=index',
			method: 'GET',
			success: res => {
				console.log("res = ", JSON.stringify(res));
				if(res.data.status == 'ok'){
					// 把数据格式整理为 picker 支持的格式 ['分类名', ...]
					var categories = res.data.data;
					for(var k in categories){
						this.caties.push(categories[k]);
					}
					// 记录分类信息
					this.catiesFromApi = categories;
				}
			}
		});
	},
	methods: {
		// picker发生改变时触发
		cateChange(e) {
			var sedIndex = e.detail.value;
			this.currentCateIndex = sedIndex;
			// 获取选择的分类名称
			if (sedIndex < 1) {
				return;
			}
			var cateName = this.caties[sedIndex];
			for (var k in this.catiesFromApi) {
				if(cateName == this.catiesFromApi[k]){
					this.sedCateIndex = k;
					break;
				}
			}
			this.currentCateIndex = sedIndex;
		},
		// 临时添加图片，非提交到后台
		addImg() {
			uni.chooseImage({
				count: 1,                 // 一次选择一张图片
				sizeType: ['compressed'], // 压缩形式的图片
				success: (res) => {
					// 将选择好的图片地址存到数组中
					this.artList.push({"type": "image", "content": res.tempFilePaths[0]})
				}
			})
		},
		removeImg(e) {
			var index = e.currentTarget.dataset.index;
			uni.showModal({
				content:"确定要删除此图片吗",
				title:'提示',
				success: (e) => {
					if (e.confirm) {
						this.artList.splice(index, 1);
					}
				}
			});
		},
		// 完成文字的提交
		submit(res) {
			var content = res.detail.value.artText;
			if (content.length < 1) {
				uni.showToast({title: "请输入内容", icon: 'none'}); 
				return;
			}
			this.artList.push({"type": "text", "content": content}); // 添加type为文本类型的数据到artList
			this.inputContent = '';
		},
		// 删除文本
		deleteText(e) {
			var index = e.currentTarget.dataset.index;
			uni.showModal({
				content:"确定要删除吗",
				title:'提示',
				success: (e) => {
					if (e.confirm) {
						this.artList.splice(index, 1);
					}
				}
			});
		},
		submitNow() {
			
		}
	},
}
</script>

<style>

</style>
