// 注册Service Worker并处理PWA功能

let deferredPrompt: Event | null = null;

// 监听beforeinstallprompt事件，以便稍后触发安装
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('BeforeInstallPrompt event fired');
  // 阻止默认的迷你安装横幅
  e.preventDefault();
  // 保存事件以便稍后使用
  deferredPrompt = e;
});

// 检查PWA安装状态
export const checkPWAInstallationStatus = () => {
  // 检查是否处于独立模式（PWA安装后运行）
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true; // Safari iOS 支持
};

// 触发PWA安装
export const triggerPWAInstall = async () => {
  if (!deferredPrompt) {
    console.log('No install prompt available');
    return false;
  }

  // 显示安装横幅
  (deferredPrompt as any).prompt();

  // 等待用户响应
  const { outcome } = await (deferredPrompt as any).userChoice;

  // 重置事件
  deferredPrompt = null;

  return outcome === 'accepted';
};

// 注册Service Worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // 注册service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      console.log('SW registered: ', registration);
      
      // 监听更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 有新版本可用
              console.log('New content is available and will be used when all tabs for this page are closed.');
              
              // 显示更新提示
              showUpdateNotification();
            }
          });
        }
      });

      // 检查是否有可用的更新
      if (registration.waiting) {
        showUpdateNotification();
      }
    } catch (error) {
      console.error('SW registration failed: ', error);
    }
  }
};

// 显示更新通知
const showUpdateNotification = () => {
  // 创建自定义更新提示
  const updateEvent = new CustomEvent('pwaUpdateAvailable', {
    detail: {
      message: '应用有新版本可用，是否重新加载？',
      reload: () => {
        // 立即跳转到控制器更新
        if (navigator.serviceWorker.controller) {
          window.location.reload();
        }
      }
    }
  });
  window.dispatchEvent(updateEvent);
};

// 检查网络连接状态
export const checkNetworkStatus = () => {
  return navigator.onLine;
};

// 监听网络状态变化
export const setupNetworkListener = (callback: (online: boolean) => void) => {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
};

// 初始化PWA功能
export const initializePWA = async () => {
  // 注册Service Worker
  await registerServiceWorker();
  
  // 检查安装状态
  const isInstalled = checkPWAInstallationStatus();
  console.log('PWA Installation Status:', isInstalled);
  
  // 检查网络状态
  const isOnline = checkNetworkStatus();
  console.log('Network Status:', isOnline ? 'Online' : 'Offline');
  
  // 设置网络监听器
  setupNetworkListener((online) => {
    console.log('Network status changed:', online ? 'Online' : 'Offline');
    
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('networkStatusChange', {
      detail: { online }
    }));
  });
};

// 立即初始化PWA功能
initializePWA();

export default {
  checkPWAInstallationStatus,
  triggerPWAInstall,
  registerServiceWorker,
  checkNetworkStatus,
  setupNetworkListener,
  initializePWA
};