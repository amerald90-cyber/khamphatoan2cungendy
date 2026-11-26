/* =========================================================================
   PHÒNG 05: THÀNH PHỐ DIỆN TÍCH 3D (NÂNG CẤP TỰ THẢ Ô + THỬA RUỘNG / VƯỜN HOA)
   - 3 Chế độ: Hình chữ nhật (a×b) • 🎨 Tự chạm thả từng ô 3D • So sánh 2 Hình
   - 4 Bối cảnh đa dạng: 🧱 Sân gạch • 🌾 Thửa ruộng • 🌸 Vườn hoa • 🏊 Hồ bơi
   - Tự động đếm Diện tích (S) và Chu vi (P) kể cả hình ghép chữ L, chữ T!
   ========================================================================= */
import { THREE } from './lab-engine.js';

const THEMES = {
  plaza: { vi: '🧱 Sân gạch', en: '🧱 Plaza', c1: 0x0ea5e9, c2: 0x38bdf8, deco: null },
  rice:  { vi: '🌾 Thửa ruộng', en: '🌾 Rice Field', c1: 0x65a30d, c2: 0x84cc16, deco: 'rice' },
  garden:{ vi: '🌸 Vườn hoa', en: '🌸 Flower Garden', c1: 0x78350f, c2: 0x92400e, deco: 'flower' },
  pool:  { vi: '🏊 Hồ bơi', en: '🏊 Pool', c1: 0x06b6d4, c2: 0x22d3ee, deco: null }
};

export const Room05Area = {
  id: 'room05',
  mount(engine, ctx) {
    const GRID_W = 8, GRID_H = 6;
    const state = {
      mode: 'free', // 'free' | 'single' | 'compare'
      theme: 'garden',
      len: 5,
      wid: 3,
      lenB: 4,
      widB: 4,
      showPerimeter: true,
      grid: new Set(['2,2','3,2','4,2','2,3','3,3','4,3']), // interactive cells "c,r"
      challenge: null,
      challengeMsg: ''
    };

    const addTileMesh = (parent, x, z, isAlt, themeKey, userData = null) => {
      const th = THEMES[themeKey];
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.26, 0.95),
        new THREE.MeshStandardMaterial({ color: isAlt ? th.c1 : th.c2, roughness: 0.35, metalness: 0.1 })
      );
      tile.position.set(x, 0.36, z);
      tile.castShadow = true; tile.receiveShadow = true;
      if (userData) { tile.userData = userData; engine.registerInteractive(tile); }
      parent.add(tile);

      if (th.deco === 'flower') {
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
        stem.position.set(x, 0.6, z);
        const fCol = isAlt ? 0xec4899 : 0xfacc15;
        const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), new THREE.MeshStandardMaterial({ color: fCol }));
        blossom.position.set(x, 0.74, z);
        parent.add(stem, blossom);
      } else if (th.deco === 'rice') {
        for (let k = -1; k <= 1; k += 2) {
          const stalk = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.42, 6), new THREE.MeshStandardMaterial({ color: 0xeab308 }));
          stalk.position.set(x + k * 0.18, 0.68, z + k * 0.12);
          parent.add(stalk);
        }
      }
    };

    const computeFreeStats = () => {
      const area = state.grid.size;
      let peri = 0;
      state.grid.forEach(key => {
        const [c, r] = key.split(',').map(Number);
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dc, dr]) => {
          if (!state.grid.has(`${c + dc},${r + dr}`)) peri++;
        });
      });
      return { area, peri };
    };

    const buildTiledRect = (parent, w, h, xOff, themeKey, labelPrefix) => {
      const step = 1.05;
      const startX = xOff - ((w - 1) * step) / 2;
      const startZ = -((h - 1) * step) / 2;

      const base = new THREE.Mesh(
        new THREE.BoxGeometry(w * step + 0.5, 0.22, h * step + 0.5),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 })
      );
      base.position.set(xOff, 0.11, 0);
      base.receiveShadow = true;
      parent.add(base);

      for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
          addTileMesh(parent, startX + c * step, startZ + r * step, (r + c) % 2 === 0, themeKey);
        }
      }

      if (state.showPerimeter) {
        const fenceMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.4 });
        const fullW = w * step + 0.12, fullH = h * step + 0.12;
        const barTop = new THREE.Mesh(new THREE.BoxGeometry(fullW, 0.18, 0.14), fenceMat); barTop.position.set(xOff, 0.58, -fullH / 2);
        const barBot = barTop.clone(); barBot.position.z = fullH / 2;
        const barL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, fullH), fenceMat); barL.position.set(xOff - fullW / 2, 0.58, 0);
        const barR = barL.clone(); barR.position.x = xOff + fullW / 2;
        parent.add(barTop, barBot, barL, barR);
      }

      const lbl = engine.createLabelSprite(`${labelPrefix}: ${w} × ${h} = ${w * h}`, '#0284C7', '#FFFFFF', 0.95);
      lbl.position.set(xOff, 2.5, -(h * step) / 2 - 1.0);
      parent.add(lbl);
    };

    const rebuild3D = () => {
      engine.clearRoom();
      const step = 1.05;

      if (state.mode === 'free') {
        engine.setCameraPreset([0, 10.5, 10.2], [0, 0.2, 0]);
        const startX = -((GRID_W - 1) * step) / 2;
        const startZ = -((GRID_H - 1) * step) / 2;

        // Interactive Clickable 8×6 Base Grid (Click any slot to place/remove a 3D tile!)
        const slotGeo = new THREE.BoxGeometry(0.96, 0.16, 0.96);
        for (let r = 0; r < GRID_H; r++) {
          for (let c = 0; c < GRID_W; c++) {
            const x = startX + c * step, z = startZ + r * step;
            const key = `${c},${r}`;
            const slot = new THREE.Mesh(
              slotGeo,
              new THREE.MeshStandardMaterial({ color: (r + c) % 2 === 0 ? 0xcbd5e1 : 0xe2e8f0, roughness: 0.8 })
            );
            slot.position.set(x, 0.1, z);
            slot.receiveShadow = true;
            slot.userData = { cellKey: key };
            engine.roomGroup.add(slot);
            engine.registerInteractive(slot);

            if (state.grid.has(key)) {
              addTileMesh(engine.roomGroup, x, z, (r + c) % 2 === 0, state.theme, { cellKey: key });
            }
          }
        }

        const { area } = computeFreeStats();
        const lbl = engine.createLabelSprite(`S = ${area} ô vuông`, '#16A34A', '#FFFFFF', 1.05);
        lbl.position.set(0, 2.7, -(GRID_H * step) / 2 - 0.9);
        engine.roomGroup.add(lbl);

        engine.onClick((hit) => {
          const key = hit.object?.userData?.cellKey;
          if (!key) return;
          if (state.grid.has(key)) { state.grid.delete(key); ctx.playTone(460); }
          else { state.grid.add(key); ctx.playTone(760); }
          rebuild3D();
        });
      } else if (state.mode === 'single') {
        engine.setCameraPreset([0, 9.5, 11.5], [0, 0.4, 0]);
        buildTiledRect(engine.roomGroup, state.len, state.wid, 0, state.theme, 'S');
      } else {
        engine.setCameraPreset([0, 12.0, 16.5], [0, 0.4, 0]);
        buildTiledRect(engine.roomGroup, state.len, state.wid, -4.8, state.theme, 'S(A)');
        buildTiledRect(engine.roomGroup, state.lenB, state.widB, 4.8, state.theme === 'plaza' ? 'garden' : 'plaza', 'S(B)');
        const sA = state.len * state.wid, sB = state.lenB * state.widB;
        const sym = sA > sB ? '>' : (sA < sB ? '<' : '=');
        const cmpLbl = engine.createLabelSprite(`${sA}  ${sym}  ${sB}`, '#EA580C', '#FFFFFF', 1.15);
        cmpLbl.position.set(0, 3.2, 0);
        engine.roomGroup.add(cmpLbl);
      }
      updateUI();
    };

    const updateUI = () => {
      const isEn = ctx.getLang() === 'en';
      const stats = state.mode === 'free' ? computeFreeStats() : { area: state.len * state.wid, peri: (state.len + state.wid) * 2 };

      ctx.setFormula(`S = ${stats.area} ${isEn ? 'sq units' : 'ô vuông'}  |  P = ${stats.peri}`);
      ctx.setBottomNote(
        state.mode === 'free'
          ? (isEn ? 'Click any square on the 3D board to place or remove a tile!' : 'Chạm trực tiếp vào từng ô trên sân 3D để TỰ THẢ hoặc XÓA ô đất/vườn hoa!')
          : (isEn ? 'Adjust Length & Width or pick Rice Field / Flower Garden / Pool!' : 'Chỉnh dài × rộng hoặc đổi bối cảnh Thửa ruộng, Vườn hoa, Hồ bơi!')
      );

      ctx.leftHud.innerHTML = `
        <div class="mdl-section-title">🏙️ ${isEn ? 'Mode' : 'Chế độ khám phá'}</div>
        <div class="mdl-control-row">
          <button class="mdl-btn ${state.mode === 'free' ? 'active' : ''}" id="r5-m-free" style="font-size:0.82rem;">🎨 ${isEn ? 'Click to Tile' : 'Tự thả ô 3D'}</button>
          <button class="mdl-btn ${state.mode === 'single' ? 'active' : ''}" id="r5-m-1" style="font-size:0.82rem;">📐 ${isEn ? 'a × b' : 'Chữ nhật'}</button>
          <button class="mdl-btn ${state.mode === 'compare' ? 'active' : ''}" id="r5-m-2" style="font-size:0.82rem;">⚖️ ${isEn ? 'Compare' : 'So sánh'}</button>
        </div>

        <div class="mdl-section-title">🌍 ${isEn ? '3D Landscape Theme' : 'Chọn bối cảnh 3D'}</div>
        <div class="mdl-control-row">
          ${Object.keys(THEMES).map(k =>
            `<button class="mdl-btn ${state.theme === k ? 'active' : ''}" id="r5-th-${k}" style="font-size:0.78rem;">${isEn ? THEMES[k].en : THEMES[k].vi}</button>`
          ).join('')}
        </div>

        ${state.mode === 'free' ? `
          <div class="mdl-control-row" style="margin-top:6px;">
            <button class="mdl-btn mdl-btn-danger" style="width:100%;" id="r5-clear-grid">🧹 ${isEn ? 'Clear All Tiles' : 'Xóa trắng sân (Tự thả lại)'}</button>
          </div>
        ` : `
          <div class="mdl-section-title">${isEn ? 'Length (a)' : 'Chiều dài (a)'}: <strong style="color:#FEF08A;">${state.len}</strong></div>
          <input type="range" class="mdl-slider" id="r5-len" min="1" max="8" value="${state.len}">
          <div class="mdl-section-title">${isEn ? 'Width (b)' : 'Chiều rộng (b)'}: <strong style="color:#FEF08A;">${state.wid}</strong></div>
          <input type="range" class="mdl-slider" id="r5-wid" min="1" max="6" value="${state.wid}">
          <button class="mdl-btn ${state.showPerimeter ? 'mdl-btn-warn' : ''}" style="width:100%;margin-top:6px;" id="r5-toggle-p">
            🚧 ${state.showPerimeter ? (isEn ? 'Perimeter Fence: ON' : 'Hàng rào Chu vi: BẬT') : (isEn ? 'Perimeter Fence: OFF' : 'Hàng rào Chu vi: TẮT')}
          </button>
        `}

        <div class="mdl-challenge-box">
          <div class="mdl-section-title" style="margin-top:0;color:#FEF08A;">🎯 ${isEn ? 'Area Challenge' : 'Thử thách tạo Diện tích'}</div>
          ${!state.challenge
            ? `<button class="mdl-btn mdl-btn-warn" style="width:100%;" id="r5-new-ch">${isEn ? 'Start Challenge!' : 'Nhận nhiệm vụ!'}</button>`
            : `<div class="mdl-challenge-q">${state.challenge.text}</div>
               <div class="mdl-control-row">
                 <button class="mdl-btn mdl-btn-success" id="r5-check-ch">${isEn ? 'Check' : 'Kiểm tra'}</button>
                 <button class="mdl-btn" id="r5-new-ch">${isEn ? 'Next' : 'Đề mới'}</button>
               </div>
               ${state.challengeMsg}`}
        </div>
      `;

      ctx.rightHud.innerHTML = `
        <div class="mdl-section-title">📐 ${isEn ? 'Area & Perimeter (2D)' : 'Kết quả Diện tích & Chu vi (2D)'}</div>
        <div class="mdl-2d-card">
          <div style="font-family:'Baloo 2',cursive;font-weight:800;font-size:1.2rem;color:#0284C7;">
            🟩 ${isEn ? 'Area' : 'Diện tích'}: S = ${stats.area} ${isEn ? 'sq units' : 'ô vuông'}
          </div>
          <div style="font-family:'Baloo 2',cursive;font-weight:800;font-size:1.15rem;color:#D97706;margin-top:6px;">
            🚧 ${isEn ? 'Perimeter' : 'Chu vi'}: P = ${stats.peri}
          </div>
          <div style="margin-top:8px;font-size:0.86rem;color:#475569;font-weight:700;">
            ${state.mode === 'free'
              ? (isEn ? '✨ Tip: Click any square on the 3D field to build rectangles, L-shapes, or flower beds!' : '✨ Mẹo dạy học: Giáo viên/học sinh bấm trực tiếp lên sân 3D để tạo hình vuông, hình chữ nhật hay thửa ruộng chữ L!')
              : `S = ${state.len} × ${state.wid} = ${state.len * state.wid}`}
          </div>
        </div>
      `;

      const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
      bind('r5-m-free', () => { state.mode = 'free'; rebuild3D(); });
      bind('r5-m-1', () => { state.mode = 'single'; rebuild3D(); });
      bind('r5-m-2', () => { state.mode = 'compare'; rebuild3D(); });
      Object.keys(THEMES).forEach(k => bind(`r5-th-${k}`, () => { state.theme = k; ctx.playTone(720); rebuild3D(); }));
      bind('r5-clear-grid', () => { state.grid.clear(); rebuild3D(); });
      const lEl = document.getElementById('r5-len'); if (lEl) lEl.oninput = (e) => { state.len = parseInt(e.target.value); rebuild3D(); };
      const wEl = document.getElementById('r5-wid'); if (wEl) wEl.oninput = (e) => { state.wid = parseInt(e.target.value); rebuild3D(); };
      bind('r5-toggle-p', () => { state.showPerimeter = !state.showPerimeter; rebuild3D(); });

      bind('r5-new-ch', () => {
        const targets = [8, 10, 12, 15, 16];
        const target = targets[Math.floor(Math.random() * targets.length)];
        state.challenge = { target, text: isEn ? `Create a field/garden with Area S = <b>${target}</b> squares!` : `Hãy tự thả ô vuông (hoặc kéo thanh) để tạo mảnh vườn có Diện tích S = <b>${target} ô vuông</b>!` };
        state.challengeMsg = '';
        updateUI();
      });
      bind('r5-check-ch', () => {
        const curS = state.mode === 'free' ? state.grid.size : (state.len * state.wid);
        if (curS === state.challenge.target) {
          ctx.playSuccess();
          state.challengeMsg = `<div class="mdl-feedback-pill ok">🎉 ${isEn ? 'Spot on! Exact area!' : 'Chính xác tuyệt đối!'}</div>`;
        } else {
          ctx.playError();
          state.challengeMsg = `<div class="mdl-feedback-pill err">💡 ${isEn ? `Current S = ${curS}. Add/remove tiles!` : `Hiện tại S = ${curS} ô, con thêm/bớt ô nhé!`}</div>`;
        }
        updateUI();
      });
    };

    rebuild3D();
    return {
      reset: () => { state.mode = 'free'; state.theme = 'garden'; state.grid = new Set(['2,2','3,2','4,2','2,3','3,3','4,3']); state.challenge = null; state.challengeMsg = ''; rebuild3D(); },
      onLangChange: () => updateUI()
    };
  }
};
