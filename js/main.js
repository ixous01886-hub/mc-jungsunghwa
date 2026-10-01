/* =========================================================
   MC 정성화 — main.js
   ========================================================= */

/* ---------- 행사 사진 목록 ----------
   [파일명, 크기]  크기: "t" = 세로로 긴 사진, "w" = 가로로 넓게
   사진 추가: images/gallery/ 에 "분류-번호.jpg"(원본)와 "분류-번호-s.jpg"(썸네일)를 넣고 여기에 한 줄 추가 */
const PHOTOS = [
  ["sports-01", ""], ["sports-02", ""], ["sports-03", ""], ["sports-04", ""], ["sports-05", ""],
  ["sports-06", "w"], ["sports-07", ""], ["sports-08", ""], ["sports-09", ""], ["sports-10", ""],
  ["sports-11", ""], ["sports-12", ""], ["sports-13", "w"], ["sports-14", ""], ["sports-15", ""],
  ["sports-16", ""], ["sports-17", ""], ["sports-18", ""], ["sports-19", ""],
  ["festival-01", ""], ["festival-02", "t"], ["festival-03", ""], ["festival-04", ""], ["festival-05", ""],
  ["festival-06", ""], ["festival-07", ""], ["festival-08", ""], ["festival-09", "w"], ["festival-10", "t"],
  ["party-01", ""], ["party-02", ""], ["party-03", ""], ["party-04", ""], ["party-05", ""],
  ["party-06", ""], ["party-07", "w"], ["party-08", ""], ["party-09", ""],
  ["welfare-01", ""], ["welfare-02", ""], ["welfare-03", ""], ["welfare-04", ""], ["welfare-05", ""],
  ["welfare-06", "w"], ["welfare-07", ""], ["welfare-08", ""],
  ["teambuilding-01", ""], ["teambuilding-02", ""], ["teambuilding-03", ""], ["teambuilding-04", ""], ["teambuilding-05", ""],
  ["ceremony-01", "w"], ["ceremony-02", ""],
];

const CATEGORY_NAMES = {
  sports: "체육대회", festival: "축제", party: "송년회·기업행사",
  teambuilding: "팀빌딩", welfare: "복지·공공", ceremony: "준공식",
};

/* 상단 띠에 흐르는 행사명 */
const TICKER = [
  "서울고속버스터미널 송년회", "현대자동차 블루핸즈 송년의 밤", "안양중앙인정시장 100주년",
  "평택소방서 의용소방대 워크숍", "수서 함께하게 FESTA", "세곡동 한마음축제",
  "메타리치 시그널그룹 체육대회", "경서 골목형상가 물놀이 축제", "서울시립대 동문회",
  "하남시 사회복지협의회", "내곡느티나무쉼터 예술발표회", "어깨동무 한마음 축제",
];

const PAGE_SIZE = 12;

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- 헤더 & 모바일 메뉴 ---------- */
  const header = document.getElementById("header");
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("nav");
  const fab = document.querySelector(".fab");

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    fab.classList.toggle("is-show", y > window.innerHeight * 0.6);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    document.body.style.overflow = open ? "hidden" : "";
  };
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- 티커 (끊김 없이 돌도록 두 번 반복) ---------- */
  const ticker = document.getElementById("ticker");
  ticker.innerHTML = [...TICKER, ...TICKER].map((t) => `<span>${t}</span>`).join("");

  /* ---------- 스크롤 등장 애니메이션 ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  const observeReveals = (root = document) => root.querySelectorAll(".reveal:not(.is-in)").forEach((el) => io.observe(el));
  observeReveals();

  /* ---------- 숫자 카운트업 ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = Number(el.dataset.count);
      const start = performance.now();
      const dur = 1600;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-count]").forEach((el) => countIO.observe(el));

  /* ---------- 갤러리 ---------- */
  const grid = document.getElementById("galleryGrid");
  const moreBtn = document.getElementById("moreBtn");
  const tabs = document.querySelectorAll(".tab");
  let filter = "all";
  let shown = PAGE_SIZE;
  let current = [];

  // "전체"에서는 분류를 번갈아 섞어서 보여줌
  const interleaved = () => {
    const groups = Object.keys(CATEGORY_NAMES).map((c) => PHOTOS.filter((p) => p[0].startsWith(c + "-")));
    const out = [];
    for (let i = 0; out.length < PHOTOS.length; i++) groups.forEach((g) => g[i] && out.push(g[i]));
    return out;
  };

  const render = () => {
    current = filter === "all" ? interleaved() : PHOTOS.filter((p) => p[0].startsWith(filter + "-"));
    grid.innerHTML = current.slice(0, shown).map(([f, size], i) => {
      const cat = CATEGORY_NAMES[f.split("-")[0]];
      const cls = size === "t" ? " is-tall" : size === "w" ? " is-wide" : "";
      return `<button class="grid__item${cls}" data-index="${i}" aria-label="${cat} 사진 크게 보기">
        <img src="images/gallery/${f}-s.jpg" alt="${cat} 행사 진행 사진" loading="lazy">
      </button>`;
    }).join("");
    moreBtn.parentElement.hidden = shown >= current.length;
  };

  const setFilter = (f) => {
    filter = f;
    shown = PAGE_SIZE;
    tabs.forEach((t) => {
      const on = t.dataset.filter === f;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    render();
  };

  tabs.forEach((t) => t.addEventListener("click", () => setFilter(t.dataset.filter)));
  moreBtn.addEventListener("click", () => { shown += PAGE_SIZE; render(); });

  // 활동분야 카드 클릭 → 해당 분류 사진으로 이동
  document.querySelectorAll(".field[data-filter]").forEach((card) =>
    card.addEventListener("click", () => setFilter(card.dataset.filter))
  );

  render();

  /* ---------- 라이트박스 ---------- */
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbCount = document.getElementById("lbCount");
  let lbIndex = 0;
  let lastFocus = null;

  const show = (i) => {
    lbIndex = (i + current.length) % current.length;
    const f = current[lbIndex][0];
    lbImg.src = `images/gallery/${f}.jpg`;
    lbImg.alt = `${CATEGORY_NAMES[f.split("-")[0]]} 행사 사진`;
    lbCount.textContent = `${lbIndex + 1} / ${current.length}`;
  };
  const open = (i) => {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("lbClose").focus();
  };
  const close = () => {
    lb.hidden = true;
    document.body.style.overflow = "";
    lastFocus && lastFocus.focus();
  };

  grid.addEventListener("click", (e) => {
    const item = e.target.closest(".grid__item");
    if (item) open(Number(item.dataset.index));
  });
  document.getElementById("lbClose").addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", () => show(lbIndex - 1));
  document.getElementById("lbNext").addEventListener("click", () => show(lbIndex + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(lbIndex - 1);
    if (e.key === "ArrowRight") show(lbIndex + 1);
  });

  // 모바일 스와이프
  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- 영상: 하나 재생하면 나머지는 일시정지 ---------- */
  const videos = document.querySelectorAll(".vcard video");
  videos.forEach((v) => v.addEventListener("play", () => videos.forEach((o) => o !== v && o.pause())));

  document.getElementById("year").textContent = new Date().getFullYear();
});
