/* =========================================================================
   PHÒNG 05: THÀNH PHỐ DIỆN TÍCH 3D
   - Xây dựng hình vuông / hình chữ nhật lát gạch ô vuông đơn vị 3D (1×1)
   - Nút bật Hàng rào Chu vi 3D để phân biệt rõ Diện tích (bên trong) vs Chu vi (đường viền)
   - Chế độ So sánh diện tích 2 hình A & B song song trong 3D
   - Công thức trực quan S = a × b, P = (a + b) × 2 + Thử thách thực hành
   ========================================================================= */
import { THREE } from './lab-engine.js';

export const Room05Area = {
  id: 'room05',
  mount(engine, ctx) {
    const state = {
      mode: 'single', // 'single' | 'compare'
      len: 5,
      wid: 3,
      lenB: 4,
      widB: 4,
      showPerimeter: true,
      challenge: null,
      challengeMsg: ''
    };

    const buildTiledRect = (parent, w, h, xOff, colorA, colorB, labelPrefix) => {
      const tileSize = 1.05;
      const startX = xOff - ((w - 1) * tileSize) / 2;
      const startZ = -((h - 1) * tileSize) / 2;

      // Base foundation
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(w * tileSize + 0.5, 0.22, h * tileSize + 0.5),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 })
      );
      base.position.set(xOff, 0.11, 0);
      base.receiveShadow = true;
      parent.add(base);

      const tileGeo = new THREE.BoxGeometry(0.94, 0.24, 0.94);
      const mat1 = new THREE.MeshStandardMaterial({ color: colorA, roughness: 0.3, metalness: 0.12 });
      const mat2 = new THREE.MeshStandardMaterial({ color: colorB, roughness: 0.3, metalness: 0.12 });

      for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
          const tile = new THREE.Mesh(tileGeo, (r + c) % 2 === 0 ? mat1 : mat2);
          tile.position.set(startX + c * tileSize, 0.34, startZ + r * tileSize);
          tile.castShadow = true; tile.receiveShadow = true;
          parent.add(tile);
        }
      }

      // Glowing Perimeter Fence (Chu vi)
      if (state.showPerimeter) {
        const fenceMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.4 });
        const fullW = w * tileSize + 0.12, fullH = h * tileSize + 0.12;
        const barTop = new THREE.Mesh(new THREE.BoxGeometry(fullW, 0.16, 0.14), fenceMat);
        barTop.position.set(xOff, 0.56, -(fullH / 2));
        const barBot = barTop.clone(); barBot.position.z = fullH / 2;
        const barL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, fullH), fenceMat);
        barL.position.set(xOff - fullW / 2, 0.56, 0);
        const barR = barL.clone(); barR.position.x = xOff + fullW / 2;
        parent.add(barTop, barBot, barL, barR);
      }

      const lbl = engine.createLabelSprite(`${labelPrefix}: ${w} × ${h} = ${w * h}`, colorA === 0x0ea5e9 ? '#0284C7' : '#7C3AED', '#FFFFFF', 1.0);
      lbl.position.set(xOff, 2.5, -(h * tileSize) / 2 - 1.0);
      parent.add(lbl);
    };

    const rebuild3D = () => {
      engine.clearRoom();
      if (state.mode === 'single') {
        engine.setCameraPreset([0, 9.5, 11.5], [0, 0.4, 0]);
        buildTiledRect(engine.roomGroup, state.len, state.wid, 0, 0x0ea5e9, 0x38bdf8, 'S');
      } else {
        engine.setCameraPreset([0, 12.0, 16.5], [0, 0.4, 0]);
        buildTiledRect(engine.roomGroup, state.len, state.wid, -4.8, 0x0ea5e9, 0x38bdf8, 'S(A)');
        buildTiledRect(engine.roomGroup, state.lenB, state.widB, 4.8, 0x8b5cf6, 0xa78bfa, 'S(B)');
        const sA = state.len * state.wid, sB = state.lenB * state.widB;
        const sym = sA > sB ? '>' : (sA < sB ? '<' : '=');
        const cmpLbl = engine.createLabelSprite(`${sA}  ${sym}  ${sB}`, '#EA580C', '#FFFFFF', 1.25);
        cmpLbl.position.set(0, 3.2, 0);
        engine.roomGroup.add(cmpLbl);
      }
      updateUI();
    };

    const updateUI = () => {
      const isEn = ctx.getLang() === 'en';
      const area = state.len * state.wid;
      const peri = (state.len + state.wid) * 2;

      ctx.setFormula(`S = ${state.len} × ${state.wid} = ${area}  |  P = ${peri}`);
      ctx.setBottomNote(
        isEn
          ? 'Blue tiles inside = Area (S). Golden fence around the edge = Perimeter (P)!'
          : 'Các ô gạch xanh bên trong = Diện tích (S). Hàng rào vàng bao quanh = Chu vi (P)!'
      );

      ctx.leftHud.innerHTML = `
        <div class="mdl-section-title">🏙️ ${isEn ? '3D Area & Perimeter Plaza' : 'Thành phố Diện tích 3D'}</div>
        <div class="mdl-control-row">
          <button class="mdl-btn ${state.mode === 'single' ? 'active' : ''}" id="r5-m-1">${isEn ? '1 Shape' : '1 Hình'}</button>
          <button class="mdl-btn ${state.mode === 'compare' ? 'active' : ''}" id="r5-m-2">${isEn ? 'Compare 2 Shapes' : 'So sánh 2 Hình'}</button>
        </div>

        <div class="mdl-section-title">${isEn ? 'Length (a)' : 'Chiều dài (a)'}: <strong style="color:#FEF08A;">${state.len}</strong></div>
        <input type="range" class="mdl-slider" id="r5-len" min="1" max="8" value="${state.len}">
        <div class="mdl-section-title">${isEn ? 'Width (b)' : 'Chiều rộng (b)'}: <strong style="color:#FEF08A;">${state.wid}</strong></div>
        <input type="range" class="mdl-slider" id="r5-wid" min="1" max="6" value="${state.wid}">

        ${state.mode === 'compare' ? `
          <div class="mdl-section-title">${isEn ? 'Shape B (a × b)' : 'Hình B (dài × rộng)'}: ${state.lenB} × ${state.widB}</div>
          <div class="mdl-control-row">
            <input type="number" class="mdl-input" id="r5-lb" value="${state.lenB}" min="1" max="6" style="width:64px;">
            <input type="number" class="mdl-input" id="r5-wb" value="${state.widB}" min="1" max="6" style="width:64px;">
            <button class="mdl-btn mdl-btn-primary" id="r5-set-b">OK</button>
          </div>` : ''}

        <button class="mdl-btn ${state.showPerimeter ? 'mdl-btn-warn' : ''}" style="width:100%;margin-top:8px;" id="r5-toggle-p">
          🚧 ${state.showPerimeter ? (isEn ? 'Perimeter Fence: ON' : 'Hàng rào Chu vi: ĐANG BẬT') : (isEn ? 'Perimeter Fence: OFF' : 'Hàng rào Chu vi: TẮT')}
        </button>

        <div class="mdl-challenge-box">
          <div class="mdl-section-title" style="margin-top:0;color:#FEF08A;">🎯 ${isEn ? 'Area Challenge' : 'Thử thách lát gạch'}</div>
          ${!state.challenge
            ? `<button class="mdl-btn mdl-btn-warn" style="width:100%;" id="r5-new-ch">${isEn ? 'Start Challenge!' : 'Nhận nhiệm vụ lát gạch!'}</button>`
            : `<div class="mdl-challenge-q">${state.challenge.text}</div>
               <div class="mdl-control-row">
                 <button class="mdl-btn mdl-btn-success" id="r5-check-ch">${isEn ? 'Check' : 'Kiểm tra'}</button>
                 <button class="mdl-btn" id="r5-new-ch">${isEn ? 'Next' : 'Đề mới'}</button>
               </div>
               ${state.challengeMsg}`}
        </div>
      `;

      ctx.rightHud.innerHTML = `
        <div class="mdl-section-title">📐 ${isEn ? 'Area vs Perimeter (2D)' : 'Phân biệt Diện tích & Chu vi (2D)'}</div>
        <div class="mdl-2d-card">
          <div style="font-family:'Baloo 2',cursive;font-weight:800;font-size:1.15rem;color:#0284C7;">
            🟦 ${isEn ? 'Area' : 'Diện tích'}: S = ${state.len} × ${state.wid} = ${area} (${isEn ? 'sq units' : 'ô vuông'})
          </div>
          <div style="font-family:'Baloo 2',cursive;font-weight:800;font-size:1.15rem;color:#D97706;margin-top:6px;">
            🚧 ${isEn ? 'Perimeter' : 'Chu vi'}: P = (${state.len} + ${state.wid}) × 2 = ${peri}
          </div>
          <div style="margin-top:8px;font-size:0.86rem;color:#475569;font-weight:700;">
            ${state.len === state.wid
              ? (isEn ? '✨ This is a SQUARE (all 4 sides equal)!' : '✨ Đây là HÌNH VUÔNG (4 cạnh bằng nhau)!')
              : (isEn ? '✨ This is a RECTANGLE!' : '✨ Đây là HÌNH CHỮ NHẬT!')}
          </div>
        </div>
      `;

      const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
      bind('r5-m-1', () => { state.mode = 'single'; rebuild3D(); });
      bind('r5-m-2', () => { state.mode = 'compare'; rebuild3D(); });
      document.getElementById('r5-len').oninput = (e) => { state.len = parseInt(e.target.value); rebuild3D(); };
      document.getElementById('r5-wid').oninput = (e) => { state.wid = parseInt(e.target.value); rebuild3D(); };
      bind('r5-set-b', () => {
        state.lenB = Math.max(1, Math.min(6, parseInt(document.getElementById('r5-lb').value) || 4));
        state.widB = Math.max(1, Math.min(6, parseInt(document.getElementById('r5-wb').value) || 4));
        rebuild3D();
      });
      bind('r5-toggle-p', () => { state.showPerimeter = !state.showPerimeter; ctx.playTone(700); rebuild3D(); });

      bind('r5-new-ch', () => {
        const targets = [12, 15, 16, 18, 20, 24];
        const target = targets[Math.floor(Math.random() * targets.length)];
        state.mode = 'single';
        state.challenge = { target, text: isEn ? `Build a rectangle with Area S = <b>${target}</b> square units!` : `Hãy kéo chiều dài & rộng để xây mảnh sân có Diện tích S = <b>${target} ô vuông</b>!` };
        state.challengeMsg = '';
        rebuild3D();
      });
      bind('r5-check-ch', () => {
        if (state.len * state.wid === state.challenge.target) {
          ctx.playSuccess();
          state.challengeMsg = `<div class="mdl-feedback-pill ok">🎉 ${isEn ? 'Spot on! Exact area!' : 'Chính xác tuyệt đối!'}</div>`;
        } else {
          ctx.playError();
          state.challengeMsg = `<div class="mdl-feedback-pill err">💡 ${isEn ? `Current S = ${state.len * state.wid}. Adjust Length/Width!` : `Hiện tại S = ${state.len * state.wid} ô, con chỉnh lại dài/rộng nhé!`}</div>`;
        }
        updateUI();
      });
    };

    rebuild3D();
    return {
      reset: () => { state.mode = 'single'; state.len = 5; state.wid = 3; state.showPerimeter = true; state.challenge = null; state.challengeMsg = ''; rebuild3D(); },
      onLangChange: () => updateUI()
    };
  }
};
