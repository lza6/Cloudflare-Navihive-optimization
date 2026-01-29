// Service Worker for PWA functionality

const CACHE_NAME = 'navihive-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/static/css/main.*.css',
  '/static/js/main.*.js',
  '/static/js/*.chunk.js'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  console.log('SW: Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('SW: Failed to cache app shell', error);
      })
  );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  console.log('SW: Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 不拦截 API 请求，让它们直接通过
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 对于导航请求（HTML页面），尝试网络优先，然后回退到缓存
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 如果请求成功，更新缓存
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 如果网络请求失败，尝试从缓存中获取
          return caches.match(event.request).then((response) => {
            if (response) {
              return response;
            }
            // 返回默认页面
            return caches.match('/');
          });
        })
    );
  } else {
    // 对于资源请求（CSS、JS、图片等），使用缓存优先策略
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // 如果缓存中有资源，则返回缓存的资源
          if (response) {
            return response;
          }

          // 如果缓存中没有，则发起网络请求
          return fetch(event.request).then((response) => {
            // 检查请求是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 响应有效，将其副本添加到缓存中
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          });
        })
    );
  }
});

// 后台同步（如果支持）
if ('sync' in self) {
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
      event.waitUntil(syncData());
    }
  });
}

// 推送通知（如果支持）
self.addEventListener('push', (event) => {
  const title = 'NaviHive 更新';
  const options = {
    body: event.data ? event.data.text() : '您收到了新消息',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// 后台同步函数
function syncData() {
  // 这里可以实现后台数据同步逻辑
  console.log('Syncing data in background...');
}