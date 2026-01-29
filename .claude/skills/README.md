# NaviHive Skills

这个目录包含 Claude Code 的自定义 skills,用于自动化常见的开发和部署任务。

## 可用 Skills

### 1. deploy-test-env

**功能**: 自动部署完整的测试环境到 Cloudflare Workers

**使用场景**:
- 测试新功能前需要独立的测试环境
- 为特定功能创建隔离的测试实例
- 演示项目给他人查看
- 在不影响生产环境的情况下进行实验

**触发方式**:
```
deploy test environment
create test environment
deploy staging
set up test instance
```

**自动执行的步骤**:
1. ✅ 创建新的 D1 数据库
2. ✅ 初始化数据库表结构 (包含 is_public 字段)
3. ✅ 插入测试数据 (4个分组, 9个站点)
4. ✅ 生成管理员密码哈希
5. ✅ 创建 wrangler.test.jsonc 配置文件
6. ✅ 构建项目 (如需要)
7. ✅ 部署到 Cloudflare Workers
8. ✅ 验证部署结果

**输出内容**:
- 🌐 测试环境 URL
- 👤 管理员账号密码
- 💾 数据库信息
- ⚙️ Worker 配置信息

**可选参数**:
- `environment_name`: 自定义环境名称 (默认: navihive-test)
- `password`: 自定义管理员密码 (默认: test123456)
- `include_sample_data`: 是否包含示例数据 (默认: true)

**示例用法**:
```
用户: "帮我部署一个测试环境"
→ Claude 自动执行完整的部署流程

用户: "创建一个名为 search-feature-test 的测试环境,密码设为 demo123"
→ Claude 使用自定义参数部署
```

## 如何创建新的 Skill

1. 在 `.claude/skills/` 目录下创建新的 markdown 文件
2. 按照以下模板编写 skill:

```markdown
# Skill Name

## Purpose
[描述 skill 的目的]

## When to Use
[列出使用场景]

## Prerequisites
[列出前置条件]

## Workflow
[详细的执行步骤]

## Output Format
[输出格式]

## Error Handling
[错误处理方案]

## Parameters
[可选参数]

## Example Usage
[使用示例]
```

3. 在 `skills.json` 中注册新的 skill:

```json
{
  "name": "skill-name",
  "description": "简短描述",
  "file": "skill-name.md",
  "triggers": ["trigger phrase 1", "trigger phrase 2"],
  "category": "category-name",
  "version": "1.0.0"
}
```

## 最佳实践

1. **清晰的触发词**: 使用自然语言的触发词,让用户容易调用
2. **详细的步骤**: 每个步骤都要清晰明确,包含具体的命令和代码
3. **错误处理**: 预见可能的错误,提供解决方案
4. **进度追踪**: 使用 TodoWrite 工具追踪执行进度
5. **用户友好**: 输出格式要清晰,包含所有必要信息

## Skill 类别

- **deployment**: 部署相关 (deploy-test-env)
- **testing**: 测试相关
- **database**: 数据库操作相关
- **monitoring**: 监控相关
- **maintenance**: 维护相关

## 技术栈

NaviHive skills 使用以下技术:
- Cloudflare Workers & D1
- MCP (Model Context Protocol) Cloudflare Bindings
- Wrangler CLI
- pnpm
- TypeScript

## 贡献

欢迎添加新的 skills! 请确保:
- 遵循现有的 skill 模板
- 测试 skill 在实际场景中的可用性
- 更新 skills.json 注册信息
- 更新此 README 文档

## 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Claude Code 文档](https://docs.claude.com/claude-code)
- [MCP 文档](https://modelcontextprotocol.io/)
