const autoplayPages = [8, 11, 12, 14, 16, 17, 22];
const excludedPages = new Set([13, 24]);
const horizontalPages = [1, 2, 3, 4, 5, 6];
const reportPages = Array.from({ length: 19 }, (_, i) => i + 7).filter(p => !excludedPages.has(p));

const horizontalTrack = document.getElementById('horizontalTrack');
const reportFlow = document.getElementById('reportFlow');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const closeLightbox = document.getElementById('closeLightbox');
const autoplayImage = document.getElementById('autoplayImage');
const autoplayPage = document.getElementById('autoplayPage');
const autoplayProgress = document.getElementById('autoplayProgress');

function imagePath(page) {
  return `images/page-${String(page).padStart(2, '0')}.jpg`;
}

function openLightbox(img) {
  lightboxImage.src = img.src;
  lightboxImage.alt = img.alt;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
}

function addImageClick(img) {
  img.addEventListener('click', () => openLightbox(img));
}

// 1〜6：自分で左右にスクロールできるギャラリー
horizontalPages.forEach(page => {
  const card = document.createElement('article');
  card.className = 'horizontal-card';

  const img = document.createElement('img');
  img.src = imagePath(page);
  img.alt = `諏訪ノ湖芸術祭2025 実施報告書 ${page}ページ目`;
  img.loading = 'lazy';
  addImageClick(img);

  const number = document.createElement('div');
  number.className = 'card-number';
  number.textContent = `PAGE ${String(page).padStart(2, '0')}`;

  card.append(img, number);
  horizontalTrack.appendChild(card);
});

// 7〜25：13・24を除外。ここはすべて通常スクロール。
reportPages.forEach(page => {
  const article = document.createElement('article');
  article.className = 'normal-page';
  article.dataset.page = page;

  const img = document.createElement('img');
  img.src = imagePath(page);
  img.alt = `諏訪ノ湖芸術祭2025 実施報告書 ${page}ページ目`;
  img.loading = 'lazy';
  addImageClick(img);

  const number = document.createElement('div');
  number.className = 'card-number';
  number.textContent = `PAGE ${String(page).padStart(2, '0')}`;

  article.append(img, number);
  reportFlow.appendChild(article);
});

// 8 / 11 / 12 / 14 / 16 / 17 / 22：自動切り替えハイライト
let autoplayIndex = 0;
let autoplayTimer = null;
const DISPLAY_TIME = 3200;
const TRANSITION_TIME = 900;

function showAutoplayPage(index, first = false) {
  autoplayIndex = (index + autoplayPages.length) % autoplayPages.length;
  const page = autoplayPages[autoplayIndex];

  autoplayImage.classList.remove('is-showing', 'is-leaving');

  if (!first) {
    // 現在の画像を左へフェードアウト
    autoplayImage.classList.add('is-leaving');
  }

  window.setTimeout(() => {
    autoplayImage.src = imagePath(page);
    autoplayImage.alt = `諏訪ノ湖芸術祭2025 実施報告書 ${page}ページ目`;
    autoplayPage.textContent = `PAGE ${String(page).padStart(2, '0')}`;

    autoplayProgress.style.transition = 'none';
    autoplayProgress.style.width = '0%';

    // 新しい画像を右からフェードイン
    requestAnimationFrame(() => {
      autoplayImage.classList.remove('is-leaving');
      autoplayImage.classList.add('is-showing');

      autoplayProgress.style.transition = `width ${DISPLAY_TIME}ms linear`;
      autoplayProgress.style.width = '100%';
    });
  }, first ? 0 : TRANSITION_TIME);
}


// 自動切り替えを開始
function startAutoplay() {
  if (autoplayTimer) {
    window.clearTimeout(autoplayTimer);
  }

  autoplayTimer = window.setTimeout(() => {
    showAutoplayPage(autoplayIndex + 1);
    startAutoplay();
  }, DISPLAY_TIME + TRANSITION_TIME);
}


// 手動操作したとき
function manualAutoplayControl(direction) {
  // 現在の自動切り替えをリセット
  if (autoplayTimer) {
    window.clearTimeout(autoplayTimer);
    autoplayTimer = null;
  }

  // 前後の画像へ移動
  showAutoplayPage(autoplayIndex + direction);

  // 手動操作後、もう一度自動切り替えを開始
  startAutoplay();
}


// 左右ボタン
const autoplayPrev = document.getElementById('autoplayPrev');
const autoplayNext = document.getElementById('autoplayNext');

if (autoplayPrev) {
  autoplayPrev.addEventListener('click', () => {
    manualAutoplayControl(-1);
  });
}

if (autoplayNext) {
  autoplayNext.addEventListener('click', () => {
    manualAutoplayControl(1);
  });
}


// キーボードの左右キーでも操作可能
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') {
    manualAutoplayControl(-1);
  }

  if (e.key === 'ArrowRight') {
    manualAutoplayControl(1);
  }
});


// 画像クリックで拡大
addImageClick(autoplayImage);


// 最初の画像を表示
showAutoplayPage(0, true);
startAutoplay();


// タブを離れている間は自動切り替えを止める
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (autoplayTimer) {
      window.clearTimeout(autoplayTimer);
    }

    autoplayTimer = null;
  } else {
    startAutoplay();
  }
});

function closeModal() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
}
closeLightbox.addEventListener('click', closeModal);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// 1〜6の横スクロールをマウスドラッグでも操作可能にする
let dragging = false;
let startX = 0;
let startScroll = 0;
horizontalTrack.addEventListener('mousedown', e => {
  dragging = true;
  startX = e.pageX;
  startScroll = horizontalTrack.scrollLeft;
});
window.addEventListener('mouseup', () => dragging = false);
horizontalTrack.addEventListener('mousemove', e => {
  if (!dragging) return;
  e.preventDefault();
  horizontalTrack.scrollLeft = startScroll - (e.pageX - startX);
});

// 1〜6では縦ホイールを横方向へ送る
horizontalTrack.addEventListener('wheel', e => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault();
    horizontalTrack.scrollLeft += e.deltaY;
  }
}, { passive: false });
