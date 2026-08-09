/**
 * Luxury Gold Wedding Invitation
 * Korean Mobile 청첩장 - Script
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     Utility Helpers
     ═══════════════════════════════════════════ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function formatDate(dateStr, timeStr) {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const day = days[d.getDay()];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const h12 = hours % 12 || 12;
    const minuteStr = minutes > 0 ? ` ${minutes}분` : '';
    return `${year}년 ${month}월 ${date}일 ${day}요일 ${period} ${h12}시${minuteStr}`;
  }

  function formatDateShort(dateStr) {
    const d = new Date(`${dateStr}T00:00:00`);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${date}`;
  }

  function getWeddingDateTime() {
    return new Date(`${CONFIG.wedding.date}T${CONFIG.wedding.time}:00`);
  }

  /* ═══════════════════════════════════════════
     Image Auto-Detection
     ═══════════════════════════════════════════ */

  function loadImagesFromFolder(folder, maxAttempts = 50) {
    return new Promise(resolve => {
        const images = [];
        let current = 1;
        let consecutiveFails = 0;

        function tryNext() {
            if (current > maxAttempts || consecutiveFails >= 3) {
                resolve(images);
                return;
            }
            const img = new Image();
            const path = `images/${folder}/${current}.jpg`;
            img.onload = function() {
                images.push(path);
                consecutiveFails = 0;
                current++;
                tryNext();
            };
            img.onerror = function() {
                consecutiveFails++;
                current++;
                tryNext();
            };
            img.src = path;
        }

        tryNext();
    });
  }

  /* ═══════════════════════════════════════════
     Toast
     ═══════════════════════════════════════════ */

  let toastTimer = null;
  function showToast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2500);
  }

  /* ═══════════════════════════════════════════
     Clipboard
     ═══════════════════════════════════════════ */

  async function copyToClipboard(text, successMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast(successMsg || '복사되었습니다');
    } catch {
      showToast('복사에 실패했습니다');
    }
  }

  /* ═══════════════════════════════════════════
     OG Meta Tags
     ═══════════════════════════════════════════ */

  function setMetaTags() {
    const m = CONFIG.meta;
    document.title = m.title;
    const setMeta = (attr, val, content) => {
      const el = document.querySelector(`meta[${attr}="${val}"]`);
      if (el) el.setAttribute('content', content);
    };
    setMeta('property', 'og:title', m.title);
    setMeta('property', 'og:description', m.description);
    setMeta('property', 'og:image', 'images/og/1.jpg');
    setMeta('name', 'description', m.description);
  }

  /* ═══════════════════════════════════════════
     Curtain
     ═══════════════════════════════════════════ */

  function initCurtain() {
    const curtain = $('#curtain');
    const btn = $('#curtainBtn');
    const namesEl = $('#curtainNames');
    const dateEl = $('#curtainDate');

    // If useCurtain is false, skip the curtain entirely
    if (CONFIG.useCurtain === false) {
      curtain.style.display = 'none';
      return;
    }

    namesEl.textContent = `${CONFIG.groom.name}  &  ${CONFIG.bride.name}`;
    dateEl.textContent = formatDateShort(CONFIG.wedding.date);

    btn.addEventListener('click', () => {
      startBgm();  // 사용자 클릭 직후 → 소리 있는 재생 허용
      curtain.classList.add('is-open');
      document.body.classList.remove('no-scroll');
      setTimeout(() => {
        curtain.classList.add('is-hidden');
      }, 1400);
    });

    document.body.classList.add('no-scroll');
  }

  /* ═══════════════════════════════════════════
     Hero Section
     ═══════════════════════════════════════════ */

  function initHero() {
    $('#heroPhoto').src = 'images/hero/1.jpg';
    $('#heroNames').textContent = `${CONFIG.groom.name}  ·  ${CONFIG.bride.name}`;
    $('#heroDate').textContent = formatDate(CONFIG.wedding.date, CONFIG.wedding.time);
    $('#heroVenue').textContent = CONFIG.wedding.venue;
  }

  /* ═══════════════════════════════════════════
     Countdown
     ═══════════════════════════════════════════ */

  function initCountdown() {
    const target = getWeddingDateTime();

    function update() {
      const now = new Date();
      const diff = target - now;

      const labelEl = $('#countdownLabel');

      if (diff <= 0) {
        $('#countDays').textContent = '0';
        $('#countHours').textContent = '0';
        $('#countMinutes').textContent = '0';
        $('#countSeconds').textContent = '0';
        labelEl.textContent = '결혼식이 시작되었습니다';
        return;
      }

      const totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      labelEl.textContent = `결혼식까지 D-${totalDays}`;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      $('#countDays').textContent = days;
      $('#countHours').textContent = String(hours).padStart(2, '0');
      $('#countMinutes').textContent = String(minutes).padStart(2, '0');
      $('#countSeconds').textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /* ═══════════════════════════════════════════
     Greeting Section
     ═══════════════════════════════════════════ */

  function initGreeting() {
    $('#greetingTitle').textContent = CONFIG.greeting.title;
    $('#greetingContent').textContent = CONFIG.greeting.content;

    const g = CONFIG.groom;
    const b = CONFIG.bride;

    function parentLine(father, mother, fatherDeceased, motherDeceased) {
      const fd = fatherDeceased ? ' deceased' : '';
      const md = motherDeceased ? ' deceased' : '';
      return `<span class="${fd}">${father}</span> · <span class="${md}">${mother}</span>`;
    }

    const parentsHTML = `
      <div class="parent-row">
        ${parentLine(g.father, g.mother, g.fatherDeceased, g.motherDeceased)}
        <span class="parent-dot">&#9670;</span>
        의 아들 <span class="child-name">${g.name}</span>
      </div>
      <div class="parent-row">
        ${parentLine(b.father, b.mother, b.fatherDeceased, b.motherDeceased)}
        <span class="parent-dot">&#9670;</span>
        의 딸 <span class="child-name">${b.name}</span>
      </div>
    `;

    $('#greetingParents').innerHTML = parentsHTML;
  }

  /* ═══════════════════════════════════════════
     Calendar Section
     ═══════════════════════════════════════════ */

  function initCalendar() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = dt.getMonth();
    const weddingDay = dt.getDate();

    const grid = $('#calendarGrid');

    // Header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    grid.innerHTML = `<div class="calendar__header">${monthNames[month]} ${year}</div>`;

    // Weekdays
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const wdRow = document.createElement('div');
    wdRow.className = 'calendar__weekdays';
    weekdays.forEach(wd => {
      const el = document.createElement('span');
      el.className = 'calendar__weekday';
      el.textContent = wd;
      wdRow.appendChild(el);
    });
    grid.appendChild(wdRow);

    // Days
    const daysContainer = document.createElement('div');
    daysContainer.className = 'calendar__days';

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('span');
      empty.className = 'calendar__day is-empty';
      daysContainer.appendChild(empty);
    }

    for (let d = 1; d <= lastDate; d++) {
      const dayEl = document.createElement('span');
      dayEl.className = 'calendar__day';
      if (d === weddingDay) dayEl.classList.add('is-today');
      dayEl.textContent = d;
      daysContainer.appendChild(dayEl);
    }

    grid.appendChild(daysContainer);

    // Google Calendar link
    const startDate = dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDt = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
    const endDate = endDt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CONFIG.groom.name + ' ♥ ' + CONFIG.bride.name + ' 결혼식')}&dates=${startDate}/${endDate}&location=${encodeURIComponent(CONFIG.wedding.venue + ' ' + CONFIG.wedding.address)}&details=${encodeURIComponent('결혼식에 초대합니다.')}`;
    $('#googleCalBtn').href = gcalUrl;

    // ICS download (Apple Calendar)
    $('#icsDownloadBtn').addEventListener('click', () => {
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Wedding//Invitation//KO',
        'BEGIN:VEVENT',
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${CONFIG.groom.name} ♥ ${CONFIG.bride.name} 결혼식`,
        `LOCATION:${CONFIG.wedding.venue} ${CONFIG.wedding.address}`,
        'DESCRIPTION:결혼식에 초대합니다.',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wedding.ics';
      a.click();
      URL.revokeObjectURL(url);
      showToast('캘린더 파일이 다운로드됩니다');
    });
  }

  /* ═══════════════════════════════════════════
     Story Section
     ═══════════════════════════════════════════ */

  function initStory(storyImages) {
    $('#storyTitle').textContent = CONFIG.story.title;
    $('#storyContent').textContent = CONFIG.story.content;

    const container = $('#storyPhotos');
    const placeholder = container.querySelector('.loading-placeholder');
    if (placeholder) placeholder.remove();

    if (storyImages.length === 0) return;

    storyImages.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'story__photo-item animate-item';
      div.setAttribute('data-animate', 'fade-up');
      div.innerHTML = `<img src="${src}" alt="스토리 사진 ${i + 1}" loading="lazy">`;
      div.addEventListener('click', () => openPhotoModal(storyImages, i));
      container.appendChild(div);
    });
  }

  /* ═══════════════════════════════════════════
     Gallery Section
     ═══════════════════════════════════════════ */

  const GALLERY_PAGE_SIZE = 9;  // 한 페이지에 보여줄 장수 (3×3)

  function initGallery(galleryImages) {
    const grid = $('#galleryGrid');
    const dots = $('#galleryDots');
    const hint = $('#galleryHint');
    const placeholder = grid.querySelector('.loading-placeholder');
    if (placeholder) placeholder.remove();

    if (galleryImages.length === 0) {
      const gallerySection = $('#gallery');
      if (gallerySection) gallerySection.style.display = 'none';
      return;
    }

    const pageCount = Math.ceil(galleryImages.length / GALLERY_PAGE_SIZE);

    for (let p = 0; p < pageCount; p++) {
      const page = document.createElement('div');
      page.className = 'gallery__page';

      galleryImages
        .slice(p * GALLERY_PAGE_SIZE, (p + 1) * GALLERY_PAGE_SIZE)
        .forEach((src, i) => {
          const realIndex = p * GALLERY_PAGE_SIZE + i;
          const div = document.createElement('div');
          div.className = 'gallery__item animate-item';
          div.setAttribute('data-animate', 'scale-in');
          div.innerHTML = `<img src="${src}" alt="갤러리 사진 ${realIndex + 1}" loading="lazy">`;
          div.addEventListener('click', () => openPhotoModal(galleryImages, realIndex));
          page.appendChild(div);
        });

      grid.appendChild(page);
    }

    // 9장 이하면 넘길 페이지가 없으므로 점·안내문 숨김
    if (pageCount < 2) return;

    dots.hidden = false;
    hint.hidden = false;

    for (let p = 0; p < pageCount; p++) {
      const dot = document.createElement('span');
      dot.className = 'gallery__dot' + (p === 0 ? ' is-active' : '');
      dots.appendChild(dot);
    }

    let dotTimer = null;
    grid.addEventListener('scroll', () => {
      clearTimeout(dotTimer);
      dotTimer = setTimeout(() => {
        const active = Math.round(grid.scrollLeft / grid.clientWidth);
        [...dots.children].forEach((d, i) => {
          d.classList.toggle('is-active', i === active);
        });
      }, 80);
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════
     Photo Modal (with swipe)
     ═══════════════════════════════════════════ */

  let modalImages = [];
  let modalIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  let savedScrollY = 0;
  let modalPushedState = false;

  function openPhotoModal(images, index) {
    modalImages = images;
    modalIndex = index;
    showModalImage();

    // 현재 스크롤 위치 저장 (body가 position:fixed가 되며 위치를 잃기 때문)
    savedScrollY = window.scrollY || window.pageYOffset || 0;

    $('#photoModal').classList.add('is-open');
    document.body.style.top = `-${savedScrollY}px`;
    document.body.classList.add('no-scroll');

    // 휴대폰 뒤로가기로 페이지를 벗어나지 않고 모달만 닫히도록
    if (!modalPushedState) {
      history.pushState({ photoModal: true }, '');
      modalPushedState = true;
    }
  }

  function closePhotoModal(fromPopstate) {
    $('#photoModal').classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    document.body.style.top = '';

    // 저장해둔 위치로 복원 (맨 위로 튀는 현상 방지)
    window.scrollTo(0, savedScrollY);

    if (modalPushedState && !fromPopstate) {
      modalPushedState = false;
      history.back();
    } else {
      modalPushedState = false;
    }
  }

  function showModalImage() {
    const img = $('#modalImg');
    img.src = modalImages[modalIndex];
    $('#modalCounter').textContent = `${modalIndex + 1} / ${modalImages.length}`;

    $('#modalPrev').style.display = modalIndex > 0 ? '' : 'none';
    $('#modalNext').style.display = modalIndex < modalImages.length - 1 ? '' : 'none';
  }

  function modalNavigate(dir) {
    const newIndex = modalIndex + dir;
    if (newIndex >= 0 && newIndex < modalImages.length) {
      modalIndex = newIndex;
      showModalImage();
    }
  }

  function initPhotoModal() {
    $('#modalClose').addEventListener('click', () => closePhotoModal());
    $('#modalPrev').addEventListener('click', () => modalNavigate(-1));
    $('#modalNext').addEventListener('click', () => modalNavigate(1));

    const modal = $('#photoModal');

    // 뒤로가기(브라우저/휴대폰) → 모달만 닫기
    window.addEventListener('popstate', () => {
      if (modal.classList.contains('is-open')) {
        closePhotoModal(true);
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.id === 'modalContainer') {
        closePhotoModal();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closePhotoModal();
      if (e.key === 'ArrowLeft') modalNavigate(-1);
      if (e.key === 'ArrowRight') modalNavigate(1);
    });

    // Swipe support
    const container = $('#modalContainer');

    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const minSwipe = 50;

    if (Math.abs(diffX) < minSwipe || Math.abs(diffX) < Math.abs(diffY)) return;

    if (diffX > 0) {
      modalNavigate(1);  // swipe left -> next
    } else {
      modalNavigate(-1); // swipe right -> prev
    }
  }

  /* ═══════════════════════════════════════════
     Location Section
     ═══════════════════════════════════════════ */

  function initLocation() {
    const w = CONFIG.wedding;
    $('#locationVenue').textContent = w.venue;
    $('#locationHall').textContent = w.hall;
    $('#locationAddress').textContent = w.address;
    if (w.tel) {
      $('#locationTel').innerHTML = `<a href="tel:${w.tel.replace(/[^0-9+]/g, '')}" class="location__tel-link">Tel. ${w.tel}</a>`;
    } else {
      $('#locationTel').textContent = '';
    }
    $('#locationMapImg').src = 'images/location/1.jpg';
    $('#kakaoMapBtn').href = w.mapLinks.kakao || '#';
    $('#naverMapBtn').href = w.mapLinks.naver || '#';

    $('#copyAddressBtn').addEventListener('click', () => {
      copyToClipboard(w.address, '주소가 복사되었습니다');
    });

    renderTransport();
  }

  /* ─── 교통 안내 ─── */

  const TRANSPORT_ICONS = {
    subway: '<circle cx="12" cy="12" r="9"/><path d="M8 10h8M8 14h8"/>',
    bus: '<rect x="4" y="4" width="16" height="13" rx="2"/><path d="M4 11h16M7 21v-2M17 21v-2"/><circle cx="8" cy="14.5" r="0.6" fill="currentColor"/><circle cx="16" cy="14.5" r="0.6" fill="currentColor"/>',
    car: '<path d="M5 13l1.5-4.5A2 2 0 018.4 7h7.2a2 2 0 011.9 1.5L19 13"/><path d="M4 13h16v4H4z"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>',
    parking: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M10 16V9h2.5a2.5 2.5 0 010 5H10"/>',
    shuttle: '<rect x="3" y="6" width="18" height="10" rx="2"/><path d="M3 11h18M7 20v-2M17 20v-2"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
  };

  function renderTransport() {
    const container = $('#transportList');
    if (!container) return;

    const list = Array.isArray(CONFIG.transport) ? CONFIG.transport : [];
    if (list.length === 0) {
      container.remove();
      return;
    }

    list.forEach((item) => {
      const icon = TRANSPORT_ICONS[item.icon] || TRANSPORT_ICONS.info;
      const row = document.createElement('div');
      row.className = 'transport__item animate-item';
      row.setAttribute('data-animate', 'fade-up');
      row.innerHTML = `
        <div class="transport__icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>
        </div>
        <div class="transport__body">
          <div class="transport__title">${item.title || ''}</div>
          <div class="transport__desc">${item.desc || ''}</div>
        </div>
      `;
      container.appendChild(row);
    });
  }

  /* ═══════════════════════════════════════════
     Account Section (축의금)
     ═══════════════════════════════════════════ */

  function renderAccounts(accounts, containerId) {
    const container = $(`#${containerId}`);
    accounts.forEach((acc) => {
      const item = document.createElement('div');
      item.className = 'account-item';
      item.innerHTML = `
        <div class="account-item__info">
          <div class="account-item__role">${acc.role}</div>
          <div class="account-item__detail">
            <span class="account-item__name">${acc.name || ''}</span>
            ${acc.bank} ${acc.number}
          </div>
        </div>
        <button class="account-item__copy" data-account="${acc.bank} ${acc.number} ${acc.name || ''}">
          복사
        </button>
      `;
      container.appendChild(item);
    });
  }

  function initAccordion(triggerId, panelId) {
    const trigger = $(`#${triggerId}`);
    const panel = $(`#${panelId}`);

    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', !expanded);

      if (!expanded) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = '0';
      }
    });
  }

  function initAccounts() {
    renderAccounts(CONFIG.accounts.groom, 'groomAccountList');
    renderAccounts(CONFIG.accounts.bride, 'brideAccountList');

    initAccordion('groomAccordion', 'groomAccordionPanel');
    initAccordion('brideAccordion', 'brideAccordionPanel');

    // Copy account delegates
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.account-item__copy');
      if (!btn) return;
      const text = btn.dataset.account;
      copyToClipboard(text, '계좌번호가 복사되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     Background Music (YouTube IFrame API)
     ═══════════════════════════════════════════ */

  let ytPlayer = null;
  let bgmStarted = false;
  let bgmPending = false;
  let bgmFadeTimer = null;

  function initMusic() {
    const wrap = $('#bgm');
    if (!wrap) return;

    const cfg = CONFIG.music;
    const id = cfg && typeof cfg.youtubeId === 'string' ? cfg.youtubeId.trim() : '';

    if (!cfg || cfg.enabled === false || !id) {
      wrap.remove();
      return;
    }

    wrap.hidden = false;
    const toggle = $('#bgmToggle');

    // 유튜브 IFrame API 로드
    window.onYouTubeIframeAPIReady = function () {
      ytPlayer = new YT.Player('bgmFrame', {
        height: '1',
        width: '1',
        videoId: id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          start: cfg.startAt || 0,
          loop: cfg.loop === false ? 0 : 1,
          playlist: cfg.loop === false ? undefined : id
        },
        events: {
          onReady: () => {
            ytPlayer.setVolume(typeof cfg.volume === 'number' ? cfg.volume : 35);
            toggle.classList.add('is-visible');
            if (bgmPending) {
              bgmPending = false;
              startBgm();
            }
          },
          onStateChange: (e) => {
            const playing = e.data === YT.PlayerState.PLAYING;
            toggle.classList.toggle('is-playing', playing);
            toggle.setAttribute('aria-pressed', playing ? 'true' : 'false');

            // 유튜브가 재생 시작 시 볼륨을 되돌리는 경우가 있어 다시 적용
            if (playing && !bgmFadeTimer) {
              ytPlayer.setVolume(bgmTargetVolume());
            }
          },
          onError: (e) => {
            // 1/5=영상ID 오류, 100=영상 없음/비공개, 101·150=임베드 차단
            console.warn('[BGM] YouTube 오류 코드:', e.data);
            const msg = (e.data === 101 || e.data === 150)
              ? '이 영상은 외부 재생이 차단되어 있습니다'
              : '음악 영상을 불러오지 못했습니다 (코드 ' + e.data + ')';
            showToast(msg);
          }
        }
      });
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    // 토글 버튼
    toggle.addEventListener('click', () => {
      if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function') return;
      if (ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
      } else {
        ytPlayer.unMute();
        ytPlayer.playVideo();
        bgmStarted = true;
      }
    });

    // 커튼을 안 쓰는 경우: 화면 첫 터치/클릭 시 재생
    if (CONFIG.useCurtain === false) {
      const startOnce = () => {
        startBgm();
        document.removeEventListener('click', startOnce);
        document.removeEventListener('touchstart', startOnce);
      };
      document.addEventListener('click', startOnce, { once: true });
      document.addEventListener('touchstart', startOnce, { once: true });
    }
  }

  // '초대장 열기' 클릭처럼 사용자 동작 직후에만 호출해야 소리가 납니다.
  function startBgm() {
    if (bgmStarted) return;
    if (!ytPlayer || typeof ytPlayer.playVideo !== 'function') {
      // API 로딩이 늦은 경우: 준비되면 자동으로 재생 시도
      bgmPending = true;
      return;
    }
    bgmStarted = true;

    // 0에서 시작해 목표 볼륨까지 서서히 올림 (첫 소리가 크게 터지는 것 방지)
    ytPlayer.setVolume(0);
    ytPlayer.unMute();
    ytPlayer.playVideo();
    fadeInBgm();

    // 재생이 막힌 경우 1.2초 뒤 무음으로라도 시작 (버튼으로 소리를 켤 수 있게)
    setTimeout(() => {
      if (ytPlayer.getPlayerState && ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
        console.warn('[BGM] 자동 재생이 차단되어 무음으로 시작합니다');
        ytPlayer.mute();
        ytPlayer.playVideo();
      }
    }, 1200);
  }

  // 약 2초에 걸쳐 목표 볼륨까지 페이드인
  function fadeInBgm() {
    const target = bgmTargetVolume();
    let v = 0;
    clearInterval(bgmFadeTimer);
    bgmFadeTimer = setInterval(() => {
      if (!ytPlayer || typeof ytPlayer.setVolume !== 'function') {
        clearInterval(bgmFadeTimer);
        bgmFadeTimer = null;
        return;
      }
      v += Math.max(1, Math.round(target / 20));
      if (v >= target) {
        v = target;
        clearInterval(bgmFadeTimer);
        bgmFadeTimer = null;
      }
      ytPlayer.setVolume(v);
    }, 100);
  }

  function bgmTargetVolume() {
    const v = CONFIG.music && CONFIG.music.volume;
    return typeof v === 'number' ? Math.max(0, Math.min(100, v)) : 35;
  }

  /* ═══════════════════════════════════════════
     Photo Share Section (하객 사진 업로드)
     ═══════════════════════════════════════════ */

  function initPhotoShare() {
    const section = $('#photoShare');
    if (!section) return;

    const cfg = CONFIG.photoShare;
    const url = cfg && typeof cfg.url === 'string' ? cfg.url.trim() : '';

    // enabled=false 이거나 url이 비어 있으면 섹션 자체를 제거
    if (!cfg || cfg.enabled === false || !/^https?:\/\//i.test(url)) {
      section.remove();
      return;
    }

    section.hidden = false;
    $('#photoShareTitle').textContent = cfg.title || '사진 보내주세요';
    $('#photoShareDesc').textContent = cfg.desc || '';
    $('#photoShareNote').textContent = cfg.note || '';
    $('#photoShareBtnText').textContent = cfg.buttonText || '사진 올리기';
    $('#photoShareBtn').href = url;

    $('#photoShareCopyBtn').addEventListener('click', () => {
      copyToClipboard(url, '업로드 링크가 복사되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     Footer
     ═══════════════════════════════════════════ */

  function initFooter() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    $('#footerText').textContent = `${CONFIG.groom.name} & ${CONFIG.bride.name} — ${year}.${month}.${day}`;
  }

  /* ═══════════════════════════════════════════
     Loading Placeholders
     ═══════════════════════════════════════════ */

  function showLoadingPlaceholders() {
    const storyPhotos = $('#storyPhotos');
    const galleryGrid = $('#galleryGrid');

    const placeholderHTML = '<div class="loading-placeholder"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>';

    if (storyPhotos) storyPhotos.innerHTML = placeholderHTML;
    if (galleryGrid) galleryGrid.innerHTML = placeholderHTML;
  }

  /* ═══════════════════════════════════════════
     Scroll Animations (IntersectionObserver)
     ═══════════════════════════════════════════ */

  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    // Observe initial static items
    $$('.animate-item').forEach((el) => observer.observe(el));

    // Re-observe after dynamic content is added (MutationObserver)
    const mutObs = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.classList && node.classList.contains('animate-item')) {
            observer.observe(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('.animate-item').forEach((el) => observer.observe(el));
          }
        });
      });
    });

    mutObs.observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════
     Init
     ═══════════════════════════════════════════ */

  async function init() {
    setMetaTags();
    initMusic();
    initCurtain();
    initHero();
    initCountdown();
    initGreeting();
    initCalendar();

    // Show loading placeholders while detecting images
    showLoadingPlaceholders();

    // Init sections that don't depend on image detection
    initPhotoModal();
    initLocation();
    initAccounts();
    initPhotoShare();
    initFooter();
    initScrollAnimations();

    // Set story text immediately (photos load async)
    $('#storyTitle').textContent = CONFIG.story.title;
    $('#storyContent').textContent = CONFIG.story.content;

    // Auto-detect story and gallery images in parallel
    const [storyImages, galleryImages] = await Promise.all([
      loadImagesFromFolder('story'),
      loadImagesFromFolder('gallery')
    ]);

    // Render sections with discovered images
    initStory(storyImages);
    initGallery(galleryImages);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
