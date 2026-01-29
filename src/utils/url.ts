/**
 * URL 安全验证和处理工具
 */

/**
 * 验证 URL 是否安全，防止 SSRF 攻击
 */
export function isSecureUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  try {
    const parsed = new URL(url);

    // 只允许 https 和 data 协议
    if (!['https:', 'data:'].includes(parsed.protocol)) {
      console.warn(`不安全的协议: ${parsed.protocol}`);
      return false;
    }

    // 对于 data URLs，只允许图片
    if (parsed.protocol === 'data:') {
      if (!parsed.href.startsWith('data:image/')) {
        console.warn('Data URL 必须是图片类型');
        return false;
      }
      return true;
    }

    // 对于 https URLs，检查主机名
    const hostname = parsed.hostname.toLowerCase();

    // 禁止访问本地地址
    const BLOCKED_HOSTNAMES = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];

    if (BLOCKED_HOSTNAMES.includes(hostname)) {
      console.warn(`禁止访问本地地址: ${hostname}`);
      return false;
    }

    // 禁止访问私有 IP 范围
    const PRIVATE_IP_PATTERNS = [
      /^10\./, // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
      /^192\.168\./, // 192.168.0.0/16
      /^169\.254\./, // 169.254.0.0/16 (Link-local)
      /^fe80:/i, // IPv6 link-local
      /^fc00:/i, // IPv6 unique local
    ];

    if (PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(hostname))) {
      console.warn(`禁止访问私有 IP 地址: ${hostname}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('URL 验证失败:', error);
    return false;
  }
}

/**
 * 验证图标 URL（支持更多来源）
 */
export function isSecureIconUrl(url: string): boolean {
  if (!url) return true; // 空图标是允许的

  // 图标可以是相对路径
  if (url.startsWith('/')) {
    return true;
  }

  return isSecureUrl(url);
}

/**
 * 从 URL 中提取域名
 */
export function extractDomain(url: string): string | null {
  if (!url) return null;

  try {
    let fullUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      fullUrl = 'http://' + url;
    }
    const parsedUrl = new URL(fullUrl);
    return parsedUrl.hostname;
  } catch {
    const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/im);
    return match && match[1] ? match[1] : url;
  }
}

/**
 * 清理 CSS，防止 XSS 攻击
 */
export function sanitizeCSS(css: string): string {
  if (!css || typeof css !== 'string') return '';

  // 1. 移除所有注释
  let sanitized = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // 2. 移除危险的 CSS 值
  const DANGEROUS_PATTERNS = [
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /@import/gi,
    /expression\s*\(/gi,
    /-moz-binding/gi,
    /behavior\s*:/gi,
    /<\s*script/gi,
    /<\s*iframe/gi,
    /on\w+\s*=/gi, // 移除事件处理器
  ];

  DANGEROUS_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  // 3. 清理 url() 中的危险内容
  sanitized = sanitized.replace(/url\s*\(\s*(['"]?)(.*?)\1\s*\)/gi, (_match, quote, url) => {
    // 移除空格
    const trimmedUrl = url.trim();

    // 只允许 https:, data:image/, 相对路径
    if (
      trimmedUrl.startsWith('https://') ||
      trimmedUrl.startsWith('data:image/') ||
      trimmedUrl.startsWith('/')
    ) {
      return `url(${quote}${trimmedUrl}${quote})`;
    }
    return ''; // 移除不安全的 URL
  });

  // 4. 限制 CSS 长度
  const MAX_CSS_LENGTH = 50000; // 50KB
  if (sanitized.length > MAX_CSS_LENGTH) {
    console.warn('自定义 CSS 超过长度限制，已截断');
    sanitized = sanitized.substring(0, MAX_CSS_LENGTH);
  }

  return sanitized;
}
