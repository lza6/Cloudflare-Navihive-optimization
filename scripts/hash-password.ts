#!/usr/bin/env node
/**
 * 密码哈希生成脚本
 * 用于生成 bcrypt 哈希，以便在环境变量中使用
 *
 * 使用方法:
 *   pnpm hash-password <密码>
 *
 * 示例:
 *   pnpm hash-password mySecurePassword123
 */

import { hashSync } from 'bcrypt-edge';

const SALT_ROUNDS = 10;

function hashPassword(password: string): string {
  return hashSync(password, SALT_ROUNDS);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('错误: 请提供要哈希的密码');
    console.error('使用方法: pnpm hash-password <密码>');
    process.exit(1);
  }

  const password = args[0];

  if (password.length < 8) {
    console.error('警告: 密码长度应至少为 8 个字符');
  }

  try {
    console.log('正在生成密码哈希...');
    const hash = hashPassword(password);
    console.log('\n生成的密码哈希:');
    console.log(hash);
    console.log('\n请将此哈希值设置为 AUTH_PASSWORD 环境变量');
    console.log('在 wrangler.jsonc 中添加:');
    console.log(`  "AUTH_PASSWORD": "${hash}"`);
  } catch (error) {
    console.error('生成哈希时出错:', error);
    process.exit(1);
  }
}

main();
