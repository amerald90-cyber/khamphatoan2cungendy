/* =========================================================================
   PHÒNG 01: KHÁM PHÁ SỐ TỰ NHIÊN (3D PLACE VALUE: 1, 10, 100, 1000)
   - Real 3D Base-10 models with gridded textures & soft shadows
   - Direct add/remove (+1, +10, +100, +1000), type any number (e.g. 235)
   - Regroup 10 ones -> 1 ten & 10 tens -> 1 hundred
   - Compare Mode (Two numbers side-by-side in 3D with >, <, =)
   - 2D Place-Value Table + Expanded Form + Interactive Challenge
   ========================================================================= */
import { THREE } from './lab-engine.js';

export const Room01Numbers = {
  id: 'room01',
  mount(engine, ctx) {
    engine.setCameraPreset([0, 9.5, 14.5], [0, 1.2, 0]);

    const state = {
      mode: 'explore', // 'explore' | 'compare'
      thousands: 0,
      hundreds: 2,
      tens: 3,
      ones: 5,
      compareB: 158,
      challengeTarget: null,
      challengeMsg: ''
    };

    const tex1000 = engine.createGridTexture('#EAB308', '#FFFFFF', 10, 10);
    const tex100 = engine.createGridTexture('#10B981', '#FFFFFF', 10, 10);
    const tex10 = engine.createGridTexture('#0EA5E9', '#FFFFFF', 10, 1);

    const mat1000 = new THREE.MeshStandardMaterial({ map: tex1000, roughness: 0.35, metalness: 0.2 });
    const mat100 = new THREE.MeshStandardMaterial({ map: tex100, roughness: 0.35, metalness: 0.15 });
    const mat10 = new THREE.MeshStandardMaterial({ map: tex10, roughness: 0.3, metalness: 0.15 });
    const mat1 = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3, metalness: 0.1 });

    const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65, metalness: 0.25 });

    const getValue = () => state.thousands * 1000 + state.hundreds * 100 + state.tens * 10 + state.ones;

    const setNumber = (n) => {
      const clamped = Math.max(0, Math.min(1999, parseInt(n) || 0));
      state.thousands = Math.floor(clamped / 1000);
      state.hundreds = Math.floor((clamped % 1000) / 100);
      state.tens = Math.floor((clamped % 100) / 10);
      state.ones = clamped % 10;
      rebuild3D();
    };

    const buildBase10Cluster = (group, nObj, offsetX, labelText, accentHex) => {
      const { th, h, t, o } = nObj;
      // Pedestal platform
      const plat = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.35, 6.2), tableMat);
      plat.position.set(offsetX, 0.18, 0);
      plat.receiveShadow = true;
      group.add(plat);

      const border = new THREE.Mesh(
        new THREE.BoxGeometry(10.7, 0.08, 6.4),
        new THREE.MeshBasicMaterial({ color: accentHex, transparent: true, opacity: 0.45 })
      );
      border.position.set(offsetX, 0.04, 0);
      group.add(border);

      const lbl = engine.createLabelSprite(labelText, accentHex, '#FFFFFF', 1.15);
      lbl.position.set(offsetX, 4.4, -2.5);
      group.add(lbl);

      // 1000-Cubes (Left)
      for (let i = 0; i < th; i++) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), mat1000);
        mesh.position.set(offsetX - 3.8, 1.48 + i * 2.35, -0.5);
        mesh.castShadow = true; mesh.receiveShadow = true;
        mesh.userData = { unitValue: 1000 };
        group.add(mesh);
        engine.registerInteractive(mesh);
      }

      // 100-Slabs (Center-Left)
      for (let i = 0; i < h; i++) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.1, 0.28), mat100);
        const col = i % 3, row = Math.floor(i / 3);
        mesh.position.set(offsetX - 1.5 + col * 0.52, 1.42 + row * 2.25, -1.6 + col * 0.48);
        mesh.castShadow = true; mesh.receiveShadow = true;
        mesh.userData = { unitValue: 100 };
        group.add(mesh);
        engine.registerInteractive(mesh);
      }

      // 10-Rods (Center-Right)
      for (let i = 0; i < t; i++) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 2.1, 0.32), mat10);
        const col = i % 5, row = Math.floor(i / 5);
        mesh.position.set(offsetX + 0.65 + col * 0.5, 1.42, -1.2 + row * 0.85);
        mesh.castShadow = true; mesh.receiveShadow = true;
        mesh.userData = { unitValue: 10 };
        group.add(mesh);
        engine.registerInteractive(mesh);
      }

      // 1-Unit Cubes (Right)
      for (let i = 0; i < o; i++) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), mat1);
        const col = i % 5, layer = Math.floor(i / 5);
        mesh.position.set(offsetX + 3.2 + (col % 3) * 0.5, 0.56 + Math.floor(col / 3) * 0.44 + (layer >= 2 ? 0.88 : 0), -1.0 + (layer % 2) * 0.65);
        mesh.castShadow = true; mesh.receiveShadow = true;
        mesh.userData = { unitValue: 1 };
        group.add(mesh);
        engine.registerInteractive(mesh);
      }
    };

    const rebuild3D = () => {
      engine.clearRoom();
      const valA = getValue();
      const isEn = ctx.getLang() === 'en';

      if (state.mode === 'explore') {
        engine.setCameraPreset([0, 8.8, 13.5], [0, 1.3, 0]);
        buildBase10Cluster(
          engine.roomGroup,
          { th: state.thousands, h: state.hundreds, t: state.tens, o: state.ones },
          0,
          `${valA}`,
          '#0284C7'
        );
      } else {
        engine.setCameraPreset([0, 11.5, 20.5], [0, 1.2, 0]);
        const b = state.compareB;
        buildBase10Cluster(
          engine.roomGroup,
          { th: state.thousands, h: state.hundreds, t: state.tens, o: state.ones },
          -6.2,
          `A = ${valA}`,
          '#0284C7'
        );
        buildBase10Cluster(
          engine.roomGroup,
          { th: Math.floor(b / 1000), h: Math.floor((b % 1000) / 100), t: Math.floor((b % 100) / 10), o: b % 10 },
          6.2,
          `B = ${b}`,
          '#8B5CF6'
        );
        const sym = valA > b ? '>' : (valA < b ? '<' : '=');
        const badge = engine.createLabelSprite(`${valA}  ${sym}  ${b}`, '#EA580C', '#FFFFFF', 1.5);
        badge.position.set(0, 3.8, 0);
        engine.roomGroup.add(badge);
      }

      // Click on any 3D block to hear/see its place value!
      engine.onClick((hit) => {
        const uv = hit.object?.userData?.unitValue;
        if (uv) {
          ctx.playTone(uv === 1 ? 740 : uv === 10 ? 600 : uv === 100 ? 480 : 380);
          ctx.setBottomNote(
            isEn ? `Selected a ${uv}-block! Drag to orbit 360°.` : `Con vừa chạm vào khối giá trị ${uv}! Kéo chuột để xoay 360°.`
          );
        }
      });

      // Gentle float for label sprites
      engine.onUpdate((_, elapsed) => {
        engine.roomGroup.children.forEach(ch => {
          if (ch.isSprite) ch.position.y += Math.sin(elapsed * 2.5) * 0.002;
        });
      });

      updateUI();
    };

    const updateUI = () => {
      const isEn = ctx.getLang() === 'en';
      const val = getValue();
      const parts = [];
      if (state.thousands) parts.push(state.thousands * 1000);
      if (state.hundreds) parts.push(state.hundreds * 100);
      if (state.tens) parts.push(state.tens * 10);
      if (state.ones || parts.length === 0) parts.push(state.ones);

      ctx.setFormula(`${val} = ${parts.join(' + ')}`);
      ctx.setBottomNote(
        isEn
          ? `${state.thousands} Th • ${state.hundreds} H • ${state.tens} T • ${state.ones} O`
          : `${state.thousands} nghìn • ${state.hundreds} trăm • ${state.tens} chục • ${state.ones} đơn vị`
      );

      // Left Controls HUD
      ctx.leftHud.innerHTML = `
        <div class="mdl-section-title">${isEn ? '🔢 Natural Number Builder' : '🔢 Dựng số tự nhiên 3D'}</div>
        <div class="mdl-control-row">
          <button class="mdl-btn ${state.mode === 'explore' ? 'active' : ''}" id="r1-m-exp">${isEn ? 'Explore' : 'Khám phá'}</button>
          <button class="mdl-btn ${state.mode === 'compare' ? 'active' : ''}" id="r1-m-cmp">${isEn ? 'Compare A & B' : 'So sánh 2 số'}</button>
        </div>

        <div class="mdl-section-title">${isEn ? 'Enter Number (0–1999)' : 'Nhập nhanh một số (0–1999)'}</div>
        <div class="mdl-control-row">
          <input type="number" class="mdl-input" id="r1-num-in" value="${val}" min="0" max="1999">
          <button class="mdl-btn mdl-btn-primary" id="r1-apply-num">${isEn ? 'Build 3D' : 'Dựng 3D'}</button>
        </div>

        ${state.mode === 'compare' ? `
          <div class="mdl-section-title">${isEn ? 'Second Number (B)' : 'Số thứ hai (B)'}</div>
          <div class="mdl-control-row">
            <input type="number" class="mdl-input" id="r1-cmp-in" value="${state.compareB}" min="0" max="1999">
            <button class="mdl-btn mdl-btn-primary" id="r1-apply-cmp">OK</button>
          </div>` : ''}

        <div class="mdl-section-title">${isEn ? 'Add / Remove 3D Blocks' : 'Thêm / Bớt khối 3D trực tiếp'}</div>
        <div class="mdl-control-row">
          <button class="mdl-btn" id="r1-add-1">+1</button>
          <button class="mdl-btn" id="r1-add-10">+10</button>
          <button class="mdl-btn" id="r1-add-100">+100</button>
          <button class="mdl-btn" id="r1-add-1000">+1000</button>
        </div>
        <div class="mdl-control-row">
          <button class="mdl-btn mdl-btn-danger" id="r1-sub-1">−1</button>
          <button class="mdl-btn mdl-btn-danger" id="r1-sub-10">−10</button>
          <button class="mdl-btn mdl-btn-danger" id="r1-sub-100">−100</button>
        </div>

        ${state.ones >= 10 ? `<button class="mdl-btn mdl-btn-warn" style="width:100%;margin-top:6px;" id="r1-regroup-10">✨ ${isEn ? 'Bundle 10 Ones → 1 Ten' : 'Gom 10 đơn vị → 1 chục'}</button>` : ''}
        ${state.tens >= 10 ? `<button class="mdl-btn mdl-btn-success" style="width:100%;margin-top:6px;" id="r1-regroup-100">✨ ${isEn ? 'Bundle 10 Tens → 1 Hundred' : 'Gom 10 chục → 1 trăm'}</button>` : ''}

        <div class="mdl-section-title">📚 ${isEn ? 'Guided Practice Presets' : 'Chọn nhanh bài mẫu thực hành'}</div>
        <div class="mdl-control-row">
          <button class="mdl-btn" id="r1-ex-1" style="font-size:0.78rem;">${isEn ? 'Build 235' : 'Dựng 235'}</button>
          <button class="mdl-btn" id="r1-ex-2" style="font-size:0.78rem;">${isEn ? '14 Ones → 1T 4O' : 'Gom 14 lẻ'}</button>
          <button class="mdl-btn" id="r1-ex-3" style="font-size:0.78rem;">${isEn ? 'Compare 145 & 154' : 'So sánh 145 & 154'}</button>
        </div>

        <div class="mdl-challenge-box">
          <div class="mdl-section-title" style="margin-top:0;color:#FEF08A;">🎯 ${isEn ? 'Practice Challenge' : 'Thử thách thực hành'}</div>
          ${state.challengeTarget === null
            ? `<button class="mdl-btn mdl-btn-warn" style="width:100%;" id="r1-new-ch">${isEn ? 'Start Challenge!' : 'Nhận nhiệm vụ dựng số!'}</button>`
            : `<div class="mdl-challenge-q">${isEn ? `Build the number <b>${state.challengeTarget}</b> using 3D blocks!` : `Hãy dựng đúng số <b>${state.challengeTarget}</b> bằng các khối 3D!`}</div>
               <div class="mdl-control-row">
                 <button class="mdl-btn mdl-btn-success" id="r1-check-ch">${isEn ? 'Check' : 'Kiểm tra'}</button>
                 <button class="mdl-btn" id="r1-new-ch">${isEn ? 'Next' : 'Đề mới'}</button>
               </div>
               ${state.challengeMsg}`}
        </div>
      `;

      // Right 2D Math Representation HUD
      ctx.rightHud.innerHTML = `
        <div class="mdl-section-title">📊 ${isEn ? '2D Place-Value Board' : 'Bảng Cấu tạo số (2D)'}</div>
        <div class="mdl-2d-card">
          <table class="mdl-2d-table">
            <tr>
              <th>${isEn ? '1000s' : 'Nghìn'}</th>
              <th>${isEn ? '100s' : 'Trăm'}</th>
              <th>${isEn ? '10s' : 'Chục'}</th>
              <th>${isEn ? '1s' : 'Đơn vị'}</th>
            </tr>
            <tr>
              <td style="color:#CA8A04;">${state.thousands}</td>
              <td style="color:#059669;">${state.hundreds}</td>
              <td style="color:#0284C7;">${state.tens}</td>
              <td style="color:#EA580C;">${state.ones}</td>
            </tr>
          </table>
          <div style="margin-top:10px;text-align:center;font-family:'Baloo 2',cursive;font-weight:800;font-size:1.15rem;color:#0F172A;">
            ${val} = ${parts.join(' + ')}
          </div>
        </div>
        <div style="margin-top:12px;font-size:0.88rem;color:#CBD5E1;line-height:1.5;">
          <strong>💡 ${isEn ? 'Pedagogical Goal' : 'Mục tiêu khám phá'}:</strong><br>
          ${isEn
            ? '10 unit cubes = 1 ten-rod; 10 ten-rods = 1 hundred-slab. Click any 3D block or add more than 10 ones to practice regrouping!'
            : '10 khối đơn vị ghép thành 1 thanh chục; 10 thanh chục ghép thành 1 tấm trăm. Hãy thử bấm +1 nhiều lần để thấy nút Gom 10 đơn vị xuất hiện!'}
        </div>
      `;

      // Bindings
      const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
      bind('r1-m-exp', () => { state.mode = 'explore'; rebuild3D(); });
      bind('r1-m-cmp', () => { state.mode = 'compare'; rebuild3D(); });
      bind('r1-apply-num', () => setNumber(document.getElementById('r1-num-in').value));
      bind('r1-apply-cmp', () => { state.compareB = Math.max(0, Math.min(1999, parseInt(document.getElementById('r1-cmp-in').value) || 0)); rebuild3D(); });

      bind('r1-add-1', () => { if (state.ones < 15) { state.ones++; ctx.playTone(760); rebuild3D(); } });
      bind('r1-add-10', () => { if (state.tens < 15) { state.tens++; ctx.playTone(620); rebuild3D(); } });
      bind('r1-add-100', () => { if (state.hundreds < 9) { state.hundreds++; ctx.playTone(500); rebuild3D(); } });
      bind('r1-add-1000', () => { if (state.thousands < 2) { state.thousands++; ctx.playTone(400); rebuild3D(); } });
      bind('r1-sub-1', () => { if (state.ones > 0) { state.ones--; rebuild3D(); } });
      bind('r1-sub-10', () => { if (state.tens > 0) { state.tens--; rebuild3D(); } });
      bind('r1-sub-100', () => { if (state.hundreds > 0) { state.hundreds--; rebuild3D(); } });

      bind('r1-regroup-10', () => {
        if (state.ones >= 10) { state.ones -= 10; state.tens += 1; ctx.playTone(880); rebuild3D(); }
      });
      bind('r1-regroup-100', () => {
        if (state.tens >= 10) { state.tens -= 10; state.hundreds += 1; ctx.playTone(920); rebuild3D(); }
      });

      bind('r1-ex-1', () => { state.mode = 'explore'; setNumber(235); });
      bind('r1-ex-2', () => { state.mode = 'explore'; state.thousands = 0; state.hundreds = 0; state.tens = 1; state.ones = 14; rebuild3D(); });
      bind('r1-ex-3', () => { state.mode = 'compare'; state.compareB = 154; setNumber(145); });

      bind('r1-new-ch', () => {
        state.challengeTarget = Math.floor(Math.random() * 450) + 112;
        state.challengeMsg = '';
        setNumber(0);
      });
      bind('r1-check-ch', () => {
        if (getValue() === state.challengeTarget) {
          ctx.playSuccess();
          state.challengeMsg = `<div class="mdl-feedback-pill ok">🎉 ${isEn ? 'Spot on! Exact 3D model!' : 'Chính xác tuyệt đối! Giỏi quá!'}</div>`;
        } else {
          ctx.playError();
          state.challengeMsg = `<div class="mdl-feedback-pill err">💡 ${isEn ? `Current is ${getValue()}, try adjusting!` : `Hiện tại là ${getValue()}, con điều chỉnh thêm nhé!`}</div>`;
        }
        updateUI();
      });
    };

    rebuild3D();
    return {
      reset: () => { state.mode = 'explore'; state.challengeTarget = null; state.challengeMsg = ''; setNumber(235); },
      onLangChange: () => rebuild3D()
    };
  }
};
