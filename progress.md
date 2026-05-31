# 得聊 · 开发进度

## 已完成

### 品牌换新
- [x] 瓜田 → **得聊** 更名
- [x] 配色从绿色系 → 黑篮配色（黑底 + 蓝光）
- [x] 重新设计登录页：暗色渐变 + 蓝青按钮 + 磨砂卡片
- [x] 移除旧字体（Ma Shan Zheng）、吉祥物、旧品牌色

### 无限画布
- [x] Canvas 组件：缩放、拖拽、三种排列模式
- [x] 话题卡片在概览中展示
- [x] 点击话题进入详情（便签墙）
- [x] 便签组件 StickyNote：文字、颜色、大小、字体设置
- [x] 图片上传 & 展示（Supabase Storage）
- [x] 实时输入预览（Supabase Realtime Broadcast）

### 数据 & 内容
- [x] 7 个话题，各 55 条预设便签（共 385 条）
- [x] 奶蛙话题（🐸 表情包大赏），8 张实图上传至 Storage
- [x] 话题模型：topics → notes（x/y 坐标定位）
- [x] 去掉旧功能：限时、复活、打赏、互动标签、反应

### UI 组件
- [x] BottomNav 重构：输入框 + 创建按钮
- [x] 排列方式切换：排列 / 螺旋 / 词云
- [x] FormatSendInput：文字颜色、字体大小、卡片大小、图片上传
- [x] 创建话题弹窗 CreateTopicModal

### 已删除旧文件
- AvatarStack, CellInteractionModal, TipModal, MelonCard
- CreateMelon, DeadPage, MelonPage
- melonStore（→ topicStore）

## 进行中 / 待办
- 话题详情内无限滚动 / 分页
- 本人便签编辑 / 删除
- 话题搜索
- 社区公约页面
