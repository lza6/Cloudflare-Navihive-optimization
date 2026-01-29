# Quick Start - Deploy Test Environment Skill

## 一键部署测试环境

只需对 Claude 说以下任意一句话:

```
帮我部署一个测试环境
deploy test environment
创建测试环境
set up test instance
```

Claude 会自动完成以下所有步骤:

## 自动执行流程 (30-60秒)

### 1️⃣ 创建数据库
- 创建新的 Cloudflare D1 数据库
- 命名: `navihive-test-[timestamp]`

### 2️⃣ 初始化表结构
- ✅ groups 表 (含 is_public 字段)
- ✅ sites 表 (含 is_public 字段)
- ✅ configs 表
- ✅ 性能索引

### 3️⃣ 插入测试数据
- 4 个分组 (3个公开, 1个私密)
- 9 个站点 (8个公开, 1个私密)

### 4️⃣ 配置认证
- 生成 bcrypt 密码哈希
- 默认账号: admin
- 默认密码: test123456

### 5️⃣ 部署到 Workers
- 构建项目
- 上传到 Cloudflare Workers
- 生成可访问的 URL

## 你会得到什么

部署完成后,Claude 会提供:

```
🎉 测试环境部署完成!

🌐 页面 URL:
https://navihive-test.xxxxx.workers.dev

👤 管理员账号:
- 用户名: admin
- 密码: test123456

💾 数据库信息:
- D1 数据库名: navihive-test-db
- Database ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

⚙️ Worker 信息:
- Worker 名称: navihive-test
- 配置文件: wrangler.test.jsonc
```

## 高级用法

### 自定义环境名称

```
创建一个名为 search-feature-test 的测试环境
```

### 自定义密码

```
部署测试环境,使用密码 demo123
```

### 不包含示例数据

```
部署一个空的测试环境,不要示例数据
```

## 测试内容

### 访客模式测试
1. 直接访问 URL (无需登录)
2. 应该看到 3 个公开分组
3. 应该看到 8 个公开站点

### 搜索功能测试

**站内搜索:**
- 搜索 "Google" - 应该找到常用工具中的 Google
- 搜索 "React" - 应该找到开发资源中的 React
- 搜索 "内部" - 访客模式下找不到,登录后能找到

**站外搜索:**
- 切换到站外搜索模式
- 测试 Google、百度、GitHub 等搜索引擎
- 测试 URL 直接访问功能

**快捷键:**
- 按 `Ctrl+K` (Windows) 或 `Cmd+K` (Mac)
- 搜索框应该获得焦点

### 登录后测试
1. 点击"管理员登录"
2. 输入 admin / test123456
3. 应该看到 4 个分组(包括私密分组)
4. 应该看到 9 个站点(包括内部文档)
5. 测试编辑、新增、删除功能

### 响应式测试
- 在桌面浏览器测试
- 在移动设备测试
- 测试不同屏幕尺寸

## 清理测试环境

如果需要删除测试环境:

```
删除 navihive-test 测试环境
cleanup test environment
```

Claude 会:
1. 删除 D1 数据库
2. 删除 Worker 部署
3. 清理配置文件

## 故障排除

### 部署失败

**可能原因:**
- Cloudflare 账号未登录
- D1 数据库配额已满
- 构建失败

**解决方法:**
```
检查 Cloudflare 账号状态
重新构建项目
查看错误日志
```

### 数据库初始化失败

**可能原因:**
- SQL 语法错误
- 数据库已存在同名表

**解决方法:**
```
删除现有数据库重新创建
检查 SQL 语句
```

### 无法访问部署的 URL

**可能原因:**
- DNS 传播延迟
- Worker 部署未完成
- 配置错误

**解决方法:**
```
等待 1-2 分钟后重试
检查 wrangler.test.jsonc 配置
重新部署
```

## 最佳实践

### 1. 为每个功能创建独立环境

```
创建搜索功能测试环境 search-test
创建用户认证测试环境 auth-test
创建导入导出测试环境 import-export-test
```

### 2. 定期清理旧环境

- 删除不再使用的测试环境
- 避免超出 Cloudflare 免费配额

### 3. 使用描述性的环境名称

```
❌ 不好: test1, test2, test-abc
✅ 好: search-feature-v2, mobile-responsive-test
```

### 4. 保护测试数据

- 不要在测试环境中使用真实用户数据
- 使用明显的测试数据(如 test@example.com)
- 测试完成后及时清理

## 相关命令

### 查看所有测试环境

```
列出所有测试环境
list test environments
```

### 更新测试环境

```
更新 navihive-test 环境
redeploy test environment
```

### 查看环境详情

```
显示 navihive-test 环境信息
show test environment details
```

## 快捷键参考

| 操作 | 快捷键 |
|------|--------|
| 聚焦搜索框 | `Ctrl+K` / `Cmd+K` |
| 关闭搜索结果 | `ESC` |
| 执行搜索 | `Enter` |
| 切换主题 | 点击主题切换按钮 |

## 下一步

测试环境部署成功后:

1. **功能测试**: 测试所有新功能是否正常工作
2. **性能测试**: 检查页面加载速度和响应时间
3. **安全测试**: 验证认证和授权是否正确
4. **兼容性测试**: 在不同浏览器和设备上测试
5. **准备合并**: 如果一切正常,准备合并到主分支

## 需要帮助?

遇到问题? 可以问 Claude:

```
部署失败,怎么办?
如何修改测试环境的密码?
测试环境和生产环境有什么区别?
如何备份测试数据?
```

---

💡 **提示**: 这个 skill 完全自动化,你只需要说一句话,剩下的交给 Claude!
