/* =========================================================================
   PHÒNG 04: PHÉP NHÂN & PHÉP CHIA 3D
   - Multiplication: 3D color-coded Array (Rows × Cols) + 90° Commutative Swap
   - Division: 3D Trays + Equal Sharing + Remainder Zone (Chia hết & Chia có dư)
   - Live 2D Formula + Repeated Addition + Practice Challenge
   ========================================================================= */
import { THREE } from './lab-engine.js';

export const Room04MulDiv = {
  id: 'room04',
  mount(engine, ctx) {
    engine.setCameraPreset([0, 10.5, 13.5], [0, 0.8, 0]);

    const state = {
      mode: 'mul', // 'mul' | 'div'
      rows: 3,
      cols: 4,
      total: 14,
      groups: 4,
      distributed: false,
      targetRotY: 0,
      challenge: null,
      challengeMsg: ''
    };

    const rowColors = [0x38bdf8, 0x22c55e, 0xf59e0b, 0xf43f5e, 0xa855f7, 0x14b8a6];
    let arrayPivot = null;

    const rebuild3D = () => {
      engine.clearRoom();
      const isEn = ctx.getLang() === 'en';

      if (state.mode === 'mul') {
        engine.setCameraPreset([0, 9.5, 12.5], [0, 0.6, 0]);
        arrayPivot = new THREE.Group();
        engine.roomGroup.add(arrayPivot);

        const gap = 1.25;
        const startX = -((state.cols - 1) * gap) / 2;
        const startZ = -((state.rows - 1) * gap) / 2;

        // Glowing base mat
        const matBoard = new THREE.Mesh(
          new THREE.BoxGeometry(state.cols * gap + 1.1, 0.25, state.rows * gap + 1.1),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
        );
        matBoard.position.y = 0.12;
        matBoard.receiveShadow = true;
        arrayPivot.add(matBoard);

        const cubeGeo = new THREE.BoxGeometry(0.82, 0.82, 0.82);
        for (let r = 0; r < state.rows; r++) {
          const cMat = new THREE.MeshStandardMaterial({ color: rowColors[r % rowColors.length], roughness: 0.25, metalness: 0.18 });
          for (let c = 0; c < state.cols; c++) {
            const box = new THREE.Mesh(cubeGeo, cMat);
            box.position.set(startX + c * gap, 0.68, startZ + r * gap);
            box.castShadow = true; box.receiveShadow = true;
            arrayPivot.add(box);
          }
        }

        const lbl = engine.createLabelSprite(`${state.rows} × ${state.cols} = ${state.rows * state.cols}`, '#0284C7', '#FFFFFF', 1.2);
        lbl.position.set(0, 3.0, -((state.rows * gap) / 2) - 1.2);
        engine.roomGroup.add(lbl);

        engine.onUpdate(() => {
          if (arrayPivot) {
            arrayPivot.rotation.y = THREE.MathUtils.lerp(arrayPivot.rotation.y, state.targetRotY, 0.1);
          }
        });
      } else {
        // Division Mode: Trays + Remainder Pad
        engine.setCameraPreset([0, 11.2, 15.2], [0, 0.6, 0]);
        const q = Math.floor(state.total / state.groups);
        const rem = state.total % state.groups;

        const trayGap = 3.2;
        const startX = -((state.groups - 1) * trayGap) / 2;
        const sphereGeo = new THREE.SphereGeometry(0.32, 18, 18);

        for (let g = 0; g < state.groups; g++) {
          const tx = startX + g * trayGap;
          const tray = new THREE.Mesh(
            new THREE.CylinderGeometry(1.25, 1.35, 0.24, 28),
            new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.3 })
          );
          tray.position.set(tx, 0.14, -1.0);
          tray.receiveShadow = true;
          engine.roomGroup.add(tray);

          const gLbl = engine.createLabelSprite(`${isEn ? 'Group' : 'Nhóm'} ${g + 1}`, '#0284C7', '#FFFFFF', 0.65);
          gLbl.position.set(tx, 1.85, -2.5);
          engine.roomGroup.add(gLbl);

          if (state.distributed) {
            const sMat = new THREE.MeshStandardMaterial({ color: rowColors[g % rowColors.length], roughness: 0.2, metalness: 0.25 });
            for (let i = 0; i < q; i++) {
              const ang = (i / Math.max(1, q)) * Math.PI * 2;
              const rad = q === 1 ? 0 : 0.62;
              const sp = new THREE.Mesh(sphereGeo, sMat);
              sp.position.set(tx + Math.cos(ang) * rad, 0.56 + Math.floor(i / 6) * 0.55, -1.0 + Math.sin(ang) * rad);
              sp.castShadow = true;
              engine.roomGroup.add(sp);
            }
          }
        }

        if (!state.distributed) {
          // Show all spheres clustered in front before sharing
          const sMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25 });
          for (let i = 0; i < state.total; i++) {
            const col = i % 8, row = Math.floor(i / 8);
            const sp = new THREE.Mesh(sphereGeo, sMat);
            sp.position.set(-2.8 + col * 0.8, 0.42, 2.4 + row * 0.8);
            sp.castShadow = true;
            engine.roomGroup.add(sp);
          }
        } else if (rem > 0) {
          // Remainder glowing pad
          const pad = new THREE.Mesh(
            new THREE.BoxGeometry(3.6, 0.22, 1.8),
            new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.5 })
          );
          pad.position.set(0, 0.12, 2.8);
          engine.roomGroup.add(pad);

          const rMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.35 });
          for (let i = 0; i < rem; i++) {
            const sp = new THREE.Mesh(sphereGeo, rMat);
            sp.position.set(-((rem - 1) * 0.8) / 2 + i * 0.8, 0.54, 2.8);
            sp.castShadow = true;
            engine.roomGroup.add(sp);
          }
          const rLbl = engine.createLabelSprite(`${isEn ? 'Remainder' : 'Số dư'}: ${rem}`, '#EA580C', '#FFFFFF', 0.8);
          rLbl.position.set(0, 1.65, 3.8);
          engine.roomGroup.add(rLbl);
        }
      }

      updateUI();
    };

    const updateUI = () => {
      const isEn = ctx.getLang() === 'en';
      if (state.mode === 'mul') {
        const rep = Array(state.rows).fill(state.cols).join(' + ');
        ctx.setFormula(`${state.rows} × ${state.cols} = ${state.rows * state.cols}`);
        ctx.setBottomNote(`${isEn ? 'Repeated addition' : 'Phép cộng lặp lại'}: ${rep} = ${state.rows * state.cols}`);
      } else {
        const q = Math.floor(state.total / state.groups), rem = state.total % state.groups;
        ctx.setFormula(rem > 0 ? `${state.total} ÷ ${state.groups} = ${q} (${isEn ? 'rem' : 'dư'} ${rem})` : `${state.total} ÷ ${state.groups} = ${q}`);
        ctx.setBottomNote(
          state.distributed
            ? (isEn ? `Each group gets ${q}${rem > 0 ? `, with ${rem} left over!` : ' equally!'}` : `Mỗi nhóm nhận đều ${q} viên${rem > 0 ? `, còn dư ${rem} viên!` : '!'}`)
            : (isEn ? 'Click "Share Equally in 3D" to distribute the spheres!' : 'Bấm "Chia đều 3D" để chia các quả cầu vào từng khay!')
        );
      }

      ctx.leftHud.innerHTML = `
        <div class="mdl-section-title">✖️ ${isEn ? 'Multiply & Divide 3D' : 'Phép Nhân & Phép Chia 3D'}</div>
        <div class="mdl-control-row">
          <button class="mdl-btn ${state.mode === 'mul' ? 'mdl-btn-primary' : ''}" id="r4-m-mul">✖️ ${isEn ? 'Multiplication' : 'Phép Nhân'}</button>
          <button class="mdl-btn ${state.mode === 'div' ? 'mdl-btn-primary' : ''}" id="r4-m-div">➗ ${isEn ? 'Division' : 'Phép Chia'}</button>
        </div>

        ${state.mode === 'mul' ? `
          <div class="mdl-section-title">${isEn ? 'Rows × Columns' : 'Số hàng × Số cột'}</div>
          <div class="mdl-control-row" style="align-items:center;">
            <input type="number" class="mdl-input" id="r4-rows" value="${state.rows}" min="1" max="6" style="width:68px;">
            <strong>×</strong>
            <input type="number" class="mdl-input" id="r4-cols" value="${state.cols}" min="1" max="10" style="width:68px;">
            <button class="mdl-btn mdl-btn-primary" id="r4-apply-mul">OK</button>
          </div>
          <button class="mdl-btn mdl-btn-warn" style="width:100%;" id="r4-swap">🔀 ${isEn ? 'Rotate 90° (Commutative)' : 'Xoay 90° (Đổi hàng ↔ cột)'}</button>
        ` : `
          <div class="mdl-section-title">${isEn ? 'Total Spheres ÷ Groups' : 'Tổng số viên ÷ Số nhóm'}</div>
          <div class="mdl-control-row" style="align-items:center;">
            <input type="number" class="mdl-input" id="r4-tot" value="${state.total}" min="4" max="24" style="width:68px;">
            <strong>÷</strong>
            <input type="number" class="mdl-input" id="r4-grp" value="${state.groups}" min="2" max="5" style="width:68px;">
            <button class="mdl-btn mdl-btn-primary" id="r4-apply-div">OK</button>
          </div>
          <button class="mdl-btn mdl-btn-success" style="width:100%;" id="r4-share">✨ ${isEn ? 'Share Equally in 3D!' : 'Chia đều vào các khay 3D!'}</button>
        `}

        <div class="mdl-challenge-box">
          <div class="mdl-section-title" style="margin-top:0;color:#FEF08A;">🎯 ${isEn ? 'Practice Challenge' : 'Thử thách thực hành'}</div>
          ${!state.challenge
            ? `<button class="mdl-btn mdl-btn-warn" style="width:100%;" id="r4-new-ch">${isEn ? 'Start Challenge!' : 'Nhận nhiệm vụ!'}</button>`
            : `<div class="mdl-challenge-q">${state.challenge.text}</div>
               <div class="mdl-control-row">
                 <input type="number" class="mdl-input" id="r4-ch-ans" placeholder="?" style="width:76px;">
                 <button class="mdl-btn mdl-btn-success" id="r4-check-ch">${isEn ? 'Check' : 'Kiểm tra'}</button>
                 <button class="mdl-btn" id="r4-new-ch">${isEn ? 'Next' : 'Đề mới'}</button>
               </div>
               ${state.challengeMsg}`}
        </div>
      `;

      ctx.rightHud.innerHTML = `
        <div class="mdl-section-title">📊 ${isEn ? '2D Mathematical Model' : 'Biểu diễn Toán học 2D'}</div>
        <div class="mdl-2d-card" style="text-align:center;">
          ${state.mode === 'mul'
            ? `<div style="font-size:1.5rem;font-family:'Baloo 2',cursive;font-weight:800;color:#0284C7;">${state.rows} × ${state.cols} = ${state.rows * state.cols}</div>
               <div style="font-size:0.95rem;color:#475569;margin-top:6px;">${Array(state.rows).fill(state.cols).join(' + ')} = ${state.rows * state.cols}</div>`
            : `<div style="font-size:1.45rem;font-family:'Baloo 2',cursive;font-weight:800;color:#7C3AED;">${state.total} : ${state.groups} = ${Math.floor(state.total / state.groups)}${state.total % state.groups ? ` (${isEn ? 'rem' : 'dư'} ${state.total % state.groups})` : ''}</div>
               <div style="font-size:0.9rem;color:#475569;margin-top:6px;">${Math.floor(state.total / state.groups)} × ${state.groups} + ${state.total % state.groups} = ${state.total}</div>`}
        </div>
      `;

      const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
      bind('r4-m-mul', () => { state.mode = 'mul'; state.targetRotY = 0; rebuild3D(); });
      bind('r4-m-div', () => { state.mode = 'div'; state.distributed = false; rebuild3D(); });
      bind('r4-apply-mul', () => {
        state.rows = Math.max(1, Math.min(6, parseInt(document.getElementById('r4-rows').value) || 3));
        state.cols = Math.max(1, Math.min(10, parseInt(document.getElementById('r4-cols').value) || 4));
        state.targetRotY = 0;
        rebuild3D();
      });
      bind('r4-swap', () => {
        state.targetRotY = state.targetRotY === 0 ? Math.PI / 2 : 0;
        ctx.playTone(760);
      });
      bind('r4-apply-div', () => {
        state.total = Math.max(4, Math.min(24, parseInt(document.getElementById('r4-tot').value) || 14));
        state.groups = Math.max(2, Math.min(5, parseInt(document.getElementById('r4-grp').value) || 4));
        state.distributed = false;
        rebuild3D();
      });
      bind('r4-share', () => { state.distributed = true; ctx.playTone(840); rebuild3D(); });

      bind('r4-new-ch', () => {
        if (state.mode === 'mul') {
          state.rows = Math.floor(Math.random() * 4) + 2;
          state.cols = Math.floor(Math.random() * 6) + 2;
          state.challenge = { ans: state.rows * state.cols, text: isEn ? `Count the 3D array: <b>${state.rows} × ${state.cols} = ?</b>` : `Quan sát mảng 3D và tính: <b>${state.rows} × ${state.cols} = ?</b>` };
        } else {
          state.groups = Math.floor(Math.random() * 3) + 2;
          const q = Math.floor(Math.random() * 4) + 2;
          state.total = state.groups * q;
          state.distributed = false;
          state.challenge = { ans: q, text: isEn ? `Share <b>${state.total}</b> spheres equally into <b>${state.groups}</b> trays. How many per tray?` : `Chia đều <b>${state.total}</b> quả cầu vào <b>${state.groups}</b> khay. Mỗi khay có mấy quả?` };
        }
        state.challengeMsg = '';
        rebuild3D();
      });
      bind('r4-check-ch', () => {
        const val = parseInt(document.getElementById('r4-ch-ans').value);
        if (val === state.challenge.ans) {
          ctx.playSuccess();
          state.challengeMsg = `<div class="mdl-feedback-pill ok">🎉 ${isEn ? 'Awesome! Exact answer!' : 'Chính xác! Siêu giỏi!'}</div>`;
        } else {
          ctx.playError();
          state.challengeMsg = `<div class="mdl-feedback-pill err">💡 ${isEn ? 'Count carefully on the 3D model!' : 'Con đếm lại trên mô hình 3D nhé!'}</div>`;
        }
        updateUI();
      });
    };

    rebuild3D();
    return {
      reset: () => { state.mode = 'mul'; state.rows = 3; state.cols = 4; state.total = 14; state.groups = 4; state.distributed = false; state.challenge = null; state.challengeMsg = ''; rebuild3D(); },
      onLangChange: () => updateUI()
    };
  }
};
