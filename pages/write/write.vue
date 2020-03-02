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
		signModel.sign(this.apiServer);
		// 加载文章分类
		uni.request({
			url: this.apiServer + 'category&m=index',
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
		// 临时添加图片（准备数据），非提交到后台
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
			// 数据验证
			if(this.title.length < 2){uni.showToast({title:'请输入标题', icon:"none"}); return;}
			if(this.artList.length < 1){uni.showToast({title:'请填写文章内容', icon:"none"}); return;}
			if(this.sedCateIndex < 1){uni.showToast({title:'请选择分类', icon:"none"}); return;}
			// 上传图片 一次一个多次上传 [ 递归函数 ]
			// 上传完成后整体提交数据
			// 首先整理一下需要上传的图片
			// this.needUploadImg = [{tmpurl : 临时地址, index : 数据索引}]
			this.needUploadImg = [];
			for (var i = 0; i < this.artList.length; i++) {
				if(this.artList[i].type == 'image'){
					this.needUploadImg.push({"tmpurl" : this.artList[i].content , "indexID" : i});
				}
			}
			console.log(JSON.stringify(this.needUploadImg));
			this.uploadImg();
		},
		uploadImg() {
			// 如果没有图片 或者已经上传完成 则执行提交
			if (this.needUploadImg.length < 1 || this.uploadIndex >= this.needUploadImg.length) {
				uni.showLoading({title:"正在提交"});
				// 获取签名
				var sign = uni.getStorageSync('sign');
				uni.request({
					url: this.apiServer + 'art&m=add',
					method: 'POST',
					header: {'content-type' : "application/x-www-form-urlencoded"},
					data:{
						title   : this.title,
						content : JSON.stringify(this.artList), // 转成String
						uid     : loginRes[0], // 用户的登录信息，main.js 中 return [SUID, SRAND, SNAME, SFACE];
						random  : loginRes[1], // 随机码
						cate    : this.sedCateIndex, // 分类信息
						sign    : sign // 签名，后台需要验证签名 和 用户合法性（通过随机码）
					},
					success: (res) => {
						if(res.data.status == 'ok'){
							uni.showToast({title:"提交成功", icon:"none"});
							this.artList = [];
							// 清空数据
							signModel.sign(this.apiServer); // 重新签名
							// 防止数据缓存
							this.currentCateIndex = 0;
							this.sedCateIndex     = 0;
							this.needUploadImg    = [];
							this.title            = '';
							setTimeout(function(){
								uni.switchTab({
									url:'../my/my'
								})
							}, 1000);
						} else {
							uni.showToast({title:res.data.data, icon:"none"});
						}
					}
				});
			} else {
				// 上传图片
				uni.showLoading({title: "上传图片"});
				var uploader = uni.uploadFile({
					url      : this.apiServer + 'uploadImg',
					filePath : this.needUploadImg[this.uploadIndex].tmpurl,
					name     : 'file',
					success: (uploadFileRes) => {
						console.log(uploadFileRes);
						uploadFileRes = JSON.parse(uploadFileRes.data);
						if (uploadFileRes.status != 'ok') {
							uni.showToast({title:"图片上传失败,请重试!", icon:"none"});
							return false;
						}
						// 将已经上传的文件地址赋值给文章数据（把临时图片地址替换掉）
						var index = this.needUploadImg[this.uploadIndex].indexID;
						// 由于服务器返回的图片地址是相对路径，所以前端需要拼接一个静态文件服务器地址（可以采用第三方的静态云存储）
						this.artList[index].content = this.staticServer + uploadFileRes.data;
						this.uploadIndex ++; // 已经上传图片的个数
						// 递归上传
						setTimeout( () => {
							this.uploadImg();
						}, 1000);// 隔一秒递归：为了让 uploader 销毁
					},
					fail: (e) => {
						console.log(e);
						uni.showToast({title:"上传图片失败,请重试!", icon:"none"});
					}
				})
			}
		}
	},
}
</script>

<style>

</style>
