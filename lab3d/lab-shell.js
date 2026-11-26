/* =========================================================================
   MATH DISCOVERY LAB 3D — MUSEUM HUB & ROOM SHELL
   Clean plugin overlay (#mdl-root) — Zero interference with existing app
   ========================================================================= */
import { Lab3DEngine } from './lab-engine.js';
import { Room01Numbers } from './room01-numbers.js';
import { Room02NumberLine } from './room02-numberline.js';
import { Room03AddSub } from './room03-addsub.js';
import { Room04MulDiv } from './room04-muldiv.js';

const ROOMS_META = [
  {
    id: 'room01', num: '01', live: true, icon: '🧱', color: 'linear-gradient(135deg,#0EA5E9,#2563EB)',
    titleVi: 'Khám phá Số tự nhiên', titleEn: 'Natural Numbers 3D',
    descVi: 'Biểu diễn số bằng khối 3D (Đơn vị, Chục, Trăm, Nghìn), gom 10 → 1 chục, so sánh 2 số trong không gian 3D.',
    descEn: 'Explore 3D Base-10 blocks (1, 10, 100, 1000), bundle 10 ones into 1 ten, and compare numbers side-by-side.',
    tags: ['1–1999', 'Base-10 3D', 'So sánh'], module: Room01Numbers
  },
  {
    id: 'room02', num: '02', live: true, icon: '📏', color: 'linear-gradient(135deg,#22C55E,#059669)',
    titleVi: 'Tia số & Trục số 3D', titleEn: '3D Number Line',
    descVi: 'Nhân vật Endy bật nhảy theo vòng cung 3D trên tia số, camera bám theo chuyển động, liền trước/liền sau.',
    descEn: 'Watch Endy leap in 3D parabolic arcs across the number track with live camera tracking and jump trails.',
    tags: ['Nhảy bước 3D', '+ / −', 'Liền trước/sau'], module: Room02NumberLine
  },
  {
    id: 'room03', num: '03', live: true, icon: '🧮', color: 'linear-gradient(135deg,#F97316,#DC2626)',
    titleVi: 'Bàn thí nghiệm Cộng & Trừ', titleEn: '3D Add & Subtract Bench',
    descVi: 'Ghép 2 nhóm khối 3D, đổi 10 đơn vị thành 1 chục (nhớ 1), tách 1 chục để trừ có nhớ, đồng bộ đặt tính 2D.',
    descEn: 'Merge 3D groups, exchange 10 ones into 1 golden ten-rod, borrow to subtract, and view live 2D columns.',
    tags: ['Có nhớ 3D', 'Mượn chục', 'Đặt tính 2D'], module: Room03AddSub
  },
  {
    id: 'room04', num: '04', live: true, icon: '✖️', color: 'linear-gradient(135deg,#8B5CF6,#6D28D9)',
    titleVi: 'Phép Nhân & Phép Chia 3D', titleEn: '3D Multiply & Divide',
    descVi: 'Xếp mảng khối 3D theo hàng × cột, xoay 90° chứng minh giao hoán, chia đều vào khay 3D & quan sát số dư.',
    descEn: 'Build 3D arrays, rotate 90° for commutativity, and share 3D spheres equally into trays with remainders.',
    tags: ['Mảng 3D', 'Giao hoán 90°', 'Chia có dư'], module: Room04MulDiv
  },
  {
    id: 'room05', num: '05', live: false, icon: '🏙️', color: 'linear-gradient(135deg,#14B8A6,#0F766E)',
    titleVi: 'Thành phố Diện tích', titleEn: 'Area & Perimeter City',
    descVi: 'Lát gạch ô vuông 3D, đếm diện tích S = a × b, phân biệt diện tích và chu vi (Giai đoạn 4).',
    descEn: 'Tile 3D square grids, explore area S = a × b, and compare area vs perimeter (Stage 4).',
    tags: ['Giai đoạn 4', 'Lát gạch 3D', 'S & P']
  },
  {
    id: 'room06', num: '06', live: false, icon: '🧊', color: 'linear-gradient(135deg,#EC4899,#BE185D)',
    titleVi: 'Bảo tàng Hình học 3D', titleEn: '3D Geometry Museum',
    descVi: '9 hình học 2D/3D, xoay 360°, đếm mặt–cạnh–đỉnh và mở/đóng hình khai triển 3D (Giai đoạn 4).',
    descEn: '9 geometric solids, 360° orbit, faces/edges/vertices inspector, and animated 3D Nets (Stage 4).',
    tags: ['Giai đoạn 4', '9 hình khối', 'Khai triển 3D']
  },
  {
    id: 'room07', num: '07', live: false, icon: '⚖️', color: 'linear-gradient(135deg,#F59E0B,#B45309)',
    titleVi: 'Đo lường & Đại lượng 3D', titleEn: '3D Measurement Lab',
    descVi: 'Thước đo, cân điện tử & cân đĩa 3D, bình chia vạch lít, đồng hồ kim/điện tử và lịch (Giai đoạn 4).',
    descEn: '3D ruler, balance & digital scales, liter beakers, clocks, and calendar (Stage 4).',
    tags: ['Giai đoạn 4', 'kg / lít', 'Đồng hồ 3D']
  },
  {
    id: 'room08', num: '08', live: false, icon: '🌆', color: 'linear-gradient(135deg,#6366F1,#4338CA)',
    titleVi: 'Thành phố Toán học 3D', titleEn: 'Math City 3D World',
    descVi: '6 khu vực thực tế: Siêu thị, Công viên, Nhà ga, Công trường, Nhà hàng, Khu dân cư (Giai đoạn 5).',
    descEn: '6 interactive 3D zones: Supermarket, Park, Station, Construction, Restaurant, Neighborhood (Stage 5).',
    tags: ['Giai đoạn 5', '6 Khu vực', 'Ứng dụng thực tế']
  }
];

class MathDiscoveryLabShell {
  constructor() {
    this.engine = null;
    this.activeRoom = null;
    this.activeRoomId = null;
    this.show2D = true;
    this.hudCollapsed = false;
    this.quality = 'high';
    this.mounted = false;
  }

  getLang() {
    return localStorage.getItem('endy_math_lang') || document.documentElement.lang || 'vi';
  }

  ensureDOM() {
    if (this.mounted) return;
    this.mounted = true;
    const root = document.createElement('div');
    root.id = 'mdl-root';
    root.className = 'mdl-hidden';
    root.innerHTML = `
      <div class="mdl-topbar">
        <div class="mdl-brand">
          <div class="mdl-logo-badge">🔬</div>
          <div>
            <div class="mdl-brand-title" id="mdl-top-title">MATH DISCOVERY LAB 3D</div>
            <div class="mdl-brand-sub" id="mdl-top-sub">Phòng Thí Nghiệm Toán Học Không Gian 3D (Three.js)</div>
          </div>
        </div>
        <div class="mdl-top-actions">
          <button class="mdl-btn mdl-hidden" id="mdl-btn-hub">🏛️ <span id="mdl-lbl-hub">Sảnh 8 Phòng</span></button>
          <button class="mdl-btn mdl-hidden active" id="mdl-btn-2d">📊 2D / 3D</button>
          <button class="mdl-btn mdl-hidden" id="mdl-btn-cam">🎥 <span id="mdl-lbl-cam">Góc nhìn</span></button>
          <button class="mdl-btn mdl-hidden" id="mdl-btn-reset">🔄 <span id="mdl-lbl-reset">Đặt lại</span></button>
          <button class="mdl-btn mdl-hidden" id="mdl-btn-qual">⚡ HD</button>
          <button class="mdl-btn mdl-btn-primary" id="mdl-btn-fullscreen">⛶ <span id="mdl-lbl-fs">Toàn màn hình</span></button>
          <button class="mdl-btn" id="mdl-btn-lang">🇻🇳 / 🇬🇧</button>
          <button class="mdl-btn mdl-btn-danger" id="mdl-btn-close">✖ <span id="mdl-lbl-close">Thoát Lab</span></button>
        </div>
      </div>

      <div id="mdl-hub-view">
        <div class="mdl-hub-hero">
          <h2 id="mdl-hub-heading">🏛️ MATH DISCOVERY LAB — PHÒNG THÍ NGHIỆM TOÁN HỌC 3D</h2>
          <p id="mdl-hub-desc">Chạm vào một phòng thí nghiệm bên dưới để trực tiếp xoay 360°, phóng to/thu nhỏ, ghép tách khối 3D và giải thử thách thực hành!</p>
        </div>
        <div class="mdl-room-grid" id="mdl-room-grid"></div>
      </div>

      <div id="mdl-stage-view" class="mdl-hidden">
        <div id="mdl-canvas-host"></div>
        <button class="mdl-btn mdl-hud-toggle mdl-hidden" id="mdl-btn-show-hud">🎛️ Mở điều khiển</button>
        <div class="mdl-hud-left" id="mdl-hud-left"></div>
        <div class="mdl-hud-right" id="mdl-hud-right"></div>
        <div class="mdl-bottom-bar">
          <div class="mdl-live-formula" id="mdl-live-formula">3D Ready</div>
          <div class="mdl-live-note" id="mdl-live-note"></div>
          <button class="mdl-btn" id="mdl-btn-collapse-hud" style="padding:4px 10px;font-size:0.82rem;">👁️ 100% 3D</button>
        </div>
      </div>
    `;
    document.body.appendChild(root);

    this.root = root;
    this.hubView = document.getElementById('mdl-hub-view');
    this.stageView = document.getElementById('mdl-stage-view');
    this.canvasHost = document.getElementById('mdl-canvas-host');
    this.leftHud = document.getElementById('mdl-hud-left');
    this.rightHud = document.getElementById('mdl-hud-right');
    this.formulaEl = document.getElementById('mdl-live-formula');
    this.noteEl = document.getElementById('mdl-live-note');

    document.getElementById('mdl-btn-close').onclick = () => this.close();
    document.getElementById('mdl-btn-hub').onclick = () => this.showHub();
    document.getElementById('mdl-btn-cam').onclick = () => { if (this.engine) this.engine.resetCamera(); };
    document.getElementById('mdl-btn-reset').onclick = () => { if (this.activeRoom && this.activeRoom.reset) this.activeRoom.reset(); };
    document.getElementById('mdl-btn-2d').onclick = (e) => {
      this.show2D = !this.show2D;
      e.currentTarget.classList.toggle('active', this.show2D);
      this.rightHud.classList.toggle('mdl-hidden', !this.show2D);
    };
    document.getElementById('mdl-btn-qual').onclick = (e) => {
      this.quality = this.quality === 'high' ? 'smooth' : 'high';
      e.currentTarget.textContent = this.quality === 'high' ? '⚡ HD' : '⚡ Smooth';
      if (this.engine) this.engine.setQuality(this.quality);
    };
    document.getElementById('mdl-btn-collapse-hud').onclick = () => this.toggleFull3D();
    document.getElementById('mdl-btn-show-hud').onclick = () => this.toggleFull3D();
    document.getElementById('mdl-btn-fullscreen').onclick = () => this.toggleFullscreen();
    document.addEventListener('fullscreenchange', () => {
      const isFs = !!document.fullscreenElement;
      const fsLbl = document.getElementById('mdl-lbl-fs');
      if (fsLbl) {
        const isEn = this.getLang() === 'en';
        fsLbl.textContent = isFs ? (isEn ? 'Exit Full' : 'Thu nhỏ') : (isEn ? 'Fullscreen' : 'Toàn màn hình');
      }
      setTimeout(() => { if (this.engine) this.engine.resize(); }, 80);
    });
    document.getElementById('mdl-btn-lang').onclick = () => {
      const next = this.getLang() === 'vi' ? 'en' : 'vi';
      if (typeof window.setLanguage === 'function') window.setLanguage(next);
      else localStorage.setItem('endy_math_lang', next);
      this.refreshLang();
    };
  }

  toggleFull3D() {
    this.hudCollapsed = !this.hudCollapsed;
    this.leftHud.classList.toggle('collapsed', this.hudCollapsed);
    document.getElementById('mdl-btn-show-hud').classList.toggle('mdl-hidden', !this.hudCollapsed);
    if (this.hudCollapsed) {
      this.rightHud.classList.add('mdl-hidden');
      this.show2D = false;
      document.getElementById('mdl-btn-2d').classList.remove('active');
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      const target = this.root || document.documentElement;
      if (target.requestFullscreen) target.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }

  playTone(freq = 680) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(freq, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(freq * 1.25, ctx.currentTime + 0.12);
      g.gain.setValueAtTime(0.11, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.22);
    } catch (e) {}
  }
  playSuccess() { this.playTone(784); setTimeout(() => this.playTone(1046), 120); if (typeof window.fireConfetti === 'function') window.fireConfetti(); }
  playError() { this.playTone(230); }

  renderHubCards() {
    const isEn = this.getLang() === 'en';
    const grid = document.getElementById('mdl-room-grid');
    grid.innerHTML = '';
    ROOMS_META.forEach(r => {
      const card = document.createElement('div');
      card.className = 'mdl-room-card' + (r.live ? '' : ' coming-soon');
      card.innerHTML = `
        <div class="mdl-room-top">
          <div class="mdl-room-icon" style="background:${r.color};">${r.icon}</div>
          <span class="mdl-room-num ${r.live ? 'live' : 'soon'}">${isEn ? 'ROOM' : 'PHÒNG'} ${r.num} • ${r.live ? '3D LIVE' : (isEn ? 'NEXT' : 'SẮP MỞ')}</span>
        </div>
        <h3>${isEn ? r.titleEn : r.titleVi}</h3>
        <p>${isEn ? r.descEn : r.descVi}</p>
        <div class="mdl-room-tags">${r.tags.map(t => `<span class="mdl-tag">${t}</span>`).join('')}</div>
      `;
      card.onclick = () => {
        if (r.live) this.enterRoom(r.id);
        else if (typeof window.showToast === 'function') {
          window.showToast(isEn ? `Room ${r.num} is scheduled for the next stage!` : `Phòng ${r.num} sẽ mở ở Giai đoạn tiếp theo nhé!`);
        }
      };
      grid.appendChild(card);
    });
  }

  refreshLang() {
    const isEn = this.getLang() === 'en';
    document.getElementById('mdl-top-sub').textContent = isEn ? 'Interactive 3D Science & Math Museum (Three.js)' : 'Phòng Thí Nghiệm Toán Học Không Gian 3D (Three.js)';
    document.getElementById('mdl-lbl-hub').textContent = isEn ? '8 Rooms Hub' : 'Sảnh 8 Phòng';
    document.getElementById('mdl-lbl-cam').textContent = isEn ? 'Reset View' : 'Góc nhìn';
    document.getElementById('mdl-lbl-reset').textContent = isEn ? 'Reset' : 'Đặt lại';
    document.getElementById('mdl-lbl-fs').textContent = document.fullscreenElement ? (isEn ? 'Exit Full' : 'Thu nhỏ') : (isEn ? 'Fullscreen' : 'Toàn màn hình');
    document.getElementById('mdl-lbl-close').textContent = isEn ? 'Exit Lab' : 'Thoát Lab';
    document.getElementById('mdl-hub-heading').textContent = isEn ? '🏛️ MATH DISCOVERY LAB — 3D INTERACTIVE MUSEUM' : '🏛️ MATH DISCOVERY LAB — PHÒNG THÍ NGHIỆM TOÁN HỌC 3D';
    document.getElementById('mdl-hub-desc').textContent = isEn
      ? 'Select a 3D lab below to orbit 360°, zoom, manipulate 3D mathematical models, and complete live challenges!'
      : 'Chạm vào một phòng thí nghiệm bên dưới để trực tiếp xoay 360°, phóng to/thu nhỏ, ghép tách khối 3D và giải thử thách thực hành!';
    this.renderHubCards();
    if (this.activeRoom && this.activeRoom.onLangChange) this.activeRoom.onLangChange();
  }

  setStageButtonsVisible(vis) {
    ['mdl-btn-hub', 'mdl-btn-2d', 'mdl-btn-cam', 'mdl-btn-reset', 'mdl-btn-qual'].forEach(id => {
      document.getElementById(id).classList.toggle('mdl-hidden', !vis);
    });
  }

  showHub() {
    this.activeRoom = null;
    this.activeRoomId = null;
    if (this.engine) this.engine.clearRoom();
    this.stageView.classList.add('mdl-hidden');
    this.hubView.classList.remove('mdl-hidden');
    this.setStageButtonsVisible(false);
    this.renderHubCards();
  }

  enterRoom(roomId) {
    const meta = ROOMS_META.find(r => r.id === roomId && r.live);
    if (!meta) return this.showHub();

    this.hubView.classList.add('mdl-hidden');
    this.stageView.classList.remove('mdl-hidden');
    this.setStageButtonsVisible(true);

    if (!this.engine) {
      this.engine = new Lab3DEngine(this.canvasHost);
    } else {
      this.engine.resize();
    }

    this.activeRoomId = roomId;
    const isEn = this.getLang() === 'en';
    document.getElementById('mdl-top-title').textContent = `${meta.icon} ${isEn ? `ROOM ${meta.num}: ${meta.titleEn}` : `PHÒNG ${meta.num}: ${meta.titleVi}`}`;

    const ctx = {
      leftHud: this.leftHud,
      rightHud: this.rightHud,
      getLang: () => this.getLang(),
      setFormula: (txt) => { this.formulaEl.textContent = txt; },
      setBottomNote: (txt) => { this.noteEl.textContent = txt; },
      playTone: (f) => this.playTone(f),
      playSuccess: () => this.playSuccess(),
      playError: () => this.playError()
    };

    this.activeRoom = meta.module.mount(this.engine, ctx);
    setTimeout(() => { if (this.engine) this.engine.resize(); }, 60);
  }

  open(roomId = null) {
    this.ensureDOM();
    this.root.classList.remove('mdl-hidden');
    this.refreshLang();
    if (roomId) this.enterRoom(roomId);
    else this.showHub();
  }

  close() {
    if (this.engine) {
      this.engine.dispose();
      this.engine = null;
    }
    this.activeRoom = null;
    this.root.classList.add('mdl-hidden');
    document.getElementById('mdl-top-title').textContent = 'MATH DISCOVERY LAB 3D';
  }
}

const labShell = new MathDiscoveryLabShell();
window.openMathDiscoveryLab = (roomId = null) => labShell.open(roomId);
