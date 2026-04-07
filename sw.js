/**
 * BeatTrack PWA - Service Worker
 * キャッシュの管理とオフライン動作の制御
 */

const CACHE_NAME = 'beattrack-cache-v1.2.2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './CHANGELOG.md',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Noto+Sans+JP:wght@400;700&display=swap'
];

// インストール時にリソースをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // 新しいサービスワーカーをすぐにアクティブにする
  self.skipWaiting();
});

// 古いキャッシュの削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // クライアントの制御を即座に開始
  self.clients.claim();
});

// リクエストのフェッチ（ネットワーク優先、失敗時にキャッシュ）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 正常なレスポンスがあればキャッシュを更新して返す
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // ネットワークエラー時にキャッシュから取得
        return caches.match(event.request);
      })
  );
});
