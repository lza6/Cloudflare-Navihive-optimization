/**
 * 安全工具库
 * 提供各种安全相关的工具函数
 */

/**
 * 验证密码强度
 * @param password 密码
 * @returns 验证结果
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('密码长度至少8位');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含大写字母');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含小写字母');
  }
  
  if (!/\d/.test(password)) {
    errors.push('密码必须包含数字');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密码必须包含特殊字符');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证用户名格式
 * @param username 用户名
 * @returns 是否有效
 */
export const validateUsername = (username: string): boolean => {
  // 用户名只能包含字母、数字、下划线和连字符，长度3-20
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * 验证URL格式
 * @param url URL地址
 * @returns 是否有效
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 清理和验证HTML内容，防止XSS
 * @param html HTML内容
 * @returns 清理后的HTML
 */
export const sanitizeHtml = (html: string): string => {
  // 使用DOMPurify或手动清理HTML
  // 这里提供一个简化版本，实际应用中应该使用专门的库
  if (typeof window !== 'undefined') {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }
  // 服务端渲染时的处理
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * 生成CSRF令牌
 * @returns CSRF令牌
 */
export const generateCsrfToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * 验证CSRF令牌
 * @param token 提交的令牌
 * @param expected 预期的令牌
 * @returns 是否有效
 */
export const validateCsrfToken = (token: string, expected: string): boolean => {
  return token === expected;
};

/**
 * 生成安全的哈希值
 * @param data 要哈希的数据
 * @returns 哈希值
 */
export const generateHash = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * 验证输入长度
 * @param input 输入内容
 * @param maxLength 最大长度
 * @returns 是否有效
 */
export const validateInputLength = (input: string, maxLength: number): boolean => {
  return input.length <= maxLength;
};

/**
 * 检查是否包含恶意内容
 * @param content 内容
 * @returns 是否安全
 */
export const checkForMaliciousContent = (content: string): boolean => {
  // 检查是否包含常见的恶意模式
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /<link/i,
  ];

  return !maliciousPatterns.some(pattern => pattern.test(content));
};

/**
 * 生成安全的随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
export const generateSecureRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
};

/**
 * 验证JWT令牌格式
 * @param token JWT令牌
 * @returns 是否有效格式
 */
export const validateJwtFormat = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // 检查JWT格式: header.payload.signature
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  try {
    // 解码payload部分（不验证签名）
    const payloadPart = parts[1];
    if (!payloadPart) {
      return false;
    }
    
    // Base64解码
    let payload: string;
    try {
      // 处理Base64 URL安全编码
      const paddedPayload = payloadPart.padEnd(
        payloadPart.length + (4 - payloadPart.length % 4) % 4,
        '='
      );
      payload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return false;
    }
    
    const parsed = JSON.parse(payload);
    
    // 检查是否已过期
    if (parsed.exp && typeof parsed.exp === 'number' && Date.now() >= parsed.exp * 1000) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * 清理用户输入
 * @param input 用户输入
 * @returns 清理后的输入
 */
export const sanitizeUserInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // 移除危险字符
  return input
    .trim()
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '') // 移除控制字符
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // 移除script标签
    .replace(/javascript:/gi, '') // 移除javascript协议
    .replace(/on\w+\s*=/gi, ''); // 移除事件处理器
};

export default {
  validatePasswordStrength,
  validateEmail,
  validateUsername,
  validateUrl,
  sanitizeHtml,
  generateCsrfToken,
  validateCsrfToken,
  generateHash,
  validateInputLength,
  checkForMaliciousContent,
  generateSecureRandomString,
  validateJwtFormat,
  sanitizeUserInput,
};