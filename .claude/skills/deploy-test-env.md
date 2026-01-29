# Deploy Test Environment Skill

## Purpose
Automate the deployment of a complete test environment for NaviHive on Cloudflare Workers with D1 database.

## When to Use
- User requests to deploy a test/staging environment
- User wants to test new features before merging to production
- User needs a clean environment for testing search functionality or other features
- User says "deploy test environment", "create staging environment", "set up test instance"

## Prerequisites
- Cloudflare account is set up and active
- MCP Cloudflare bindings are available
- Project is built (dist/ directory exists)

## Workflow

### Step 1: Create D1 Database
```typescript
// Use MCP to create a new D1 database
const dbName = `navihive-test-${Date.now()}` // or user-specified name
const database = await mcp__cloudflare-bindings__d1_database_create({
  name: dbName
})
// Save database_id for later use
```

### Step 2: Initialize Database Schema
Execute the following SQL commands in order:

```sql
-- Create groups table with is_public field
CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    order_num INTEGER NOT NULL,
    is_public INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sites table with is_public field
CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    description TEXT,
    notes TEXT,
    order_num INTEGER NOT NULL,
    is_public INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Create configs table
CREATE TABLE IF NOT EXISTS configs (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_groups_is_public ON groups(is_public);
CREATE INDEX IF NOT EXISTS idx_sites_is_public ON sites(is_public);

-- Mark database as initialized
INSERT INTO configs (key, value) VALUES ('DB_INITIALIZED', 'true');
```

Use MCP `d1_database_query` for each SQL statement.

### Step 3: Insert Test Data
```sql
-- Insert test groups
INSERT INTO groups (name, order_num, is_public) VALUES
('常用工具', 0, 1),
('开发资源', 1, 1),
('社交媒体', 2, 1),
('私密收藏', 3, 0);

-- Insert test sites
INSERT INTO sites (group_id, name, url, description, order_num, is_public) VALUES
(1, 'Google', 'https://www.google.com', '全球最大的搜索引擎', 0, 1),
(1, 'GitHub', 'https://github.com', '全球最大的代码托管平台', 1, 1),
(1, 'Stack Overflow', 'https://stackoverflow.com', '程序员问答社区', 2, 1),
(2, 'MDN Web Docs', 'https://developer.mozilla.org', 'Web开发文档', 0, 1),
(2, 'React', 'https://react.dev', 'React官方文档', 1, 1),
(2, 'Cloudflare', 'https://cloudflare.com', 'Cloudflare官网', 2, 1),
(3, 'Twitter', 'https://twitter.com', '社交媒体平台', 0, 1),
(3, '微博', 'https://weibo.com', '中文社交平台', 1, 1),
(4, '内部文档', 'https://internal.example.com', '仅管理员可见', 0, 0);
```

### Step 4: Generate Password Hash
```bash
cd project_root
pnpm hash-password <test-password>
# Default password: test123456
# Save the generated hash for wrangler config
```

### Step 5: Create Wrangler Test Config
Create `wrangler.test.jsonc` with the following structure:

```jsonc
{
  "name": "navihive-test",  // or user-specified name
  "compatibility_date": "2025-01-01",
  "main": "dist/navihive/index.js",
  "assets": {
    "directory": "dist/client",
    "binding": "ASSETS"
  },
  "vars": {
    "AUTH_ENABLED": "true",
    "AUTH_REQUIRED_FOR_READ": "false",
    "AUTH_USERNAME": "admin",
    "AUTH_PASSWORD": "<generated-hash>",
    "AUTH_SECRET": "<random-secret>"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "<db-name>",
      "database_id": "<database-id>"
    }
  ]
}
```

### Step 6: Build Project (if needed)
```bash
cd project_root
pnpm build
# Ensure dist/ directory exists with built files
```

### Step 7: Deploy to Cloudflare Workers
```bash
cd project_root
npx wrangler deploy --config wrangler.test.jsonc
# Save the deployed URL from output
```

### Step 8: Verify Deployment
Test the deployed URL:
- Check if home page loads
- Verify guest mode shows public content only
- Test login with admin credentials
- Verify search functionality works

## Output Format

Present the results to the user in this format:

```
🎉 测试环境部署完成!

📋 测试环境信息

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

🎯 测试数据

数据库已预置以下测试数据:
- 4个分组 (3个公开, 1个私密)
- 9个站点 (8个公开, 1个私密)

✅ 功能配置
- ✅ 认证已启用
- ✅ 访客模式已启用
- ✅ 支持公开/私密内容
- ✅ 完整的搜索功能
```

## Error Handling

Common errors and solutions:

1. **Database creation fails**: Check Cloudflare account status and D1 limits
2. **SQL execution fails**: Verify SQL syntax, check for existing tables
3. **Build fails**: Run `pnpm install` and check for TypeScript errors
4. **Deployment fails**: Check wrangler authentication, verify config syntax
5. **MCP not available**: Use bash commands as fallback

## Parameters

Optional parameters users can specify:
- `environment_name`: Custom name for the test environment (default: "navihive-test")
- `password`: Custom admin password (default: "test123456")
- `include_sample_data`: Whether to include sample data (default: true)

## Example Usage

```
User: "Deploy a test environment for the search feature"
Assistant: [Executes this skill]

User: "Create a staging environment named 'search-feature-test' with password 'demo123'"
Assistant: [Executes this skill with custom parameters]
```

## Notes

- Always use TodoWrite to track deployment progress
- Clean up old test environments if there are too many
- Inform user about Cloudflare Workers free tier limits
- Suggest using different database names for different features
- Keep test credentials secure but accessible for testing

## Cleanup (Optional)

If user requests cleanup:
1. Delete the D1 database using MCP
2. Delete the Worker deployment
3. Remove the wrangler.test.jsonc file

## Related Skills

- `deploy-production`: Deploy to production environment
- `rollback-deployment`: Rollback a failed deployment
- `monitor-performance`: Monitor deployed environment performance
