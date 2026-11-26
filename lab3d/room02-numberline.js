/* =========================================================================
   PHÒNG 02: TIA SỐ VÀ TRỤC SỐ 3D (NÂNG CẤP RÕ TỪNG BƯỚC NHẢY)
   - Nút bật nhảy từng ô: ⬅ Lùi 1 ô (−1) và Tiến 1 ô (+1) ➡ cực dễ hiểu
   - Chế độ tự động nhảy từng bước chậm rõ kèm nhãn +1 / −1 trên từng cung nhảy
   - Cờ đánh dấu Điểm Bắt đầu (Start) & Điểm Kết thúc (End)
   - Lịch sử từng bước nhảy hiển thị trực quan bên bảng 2D
   ========================================================================= */
import { THREE } from './lab-engine.js';

export const Room02NumberLine = {
  id: 'room02',
  mount(engine, ctx) {
    const MAX_N = 24;
    const STEP_X = 1.75;
    const xOf = (n) => (n - 8) * STEP_X;

    const state = {
      startPos: 5,
      pos: 5,
      op: '+',
      steps: 3,
      stepsTaken: 0,
      trail: [5],
      animating: false,
      jumpQueue: [],
      jumpProgress: 0,
      jumpFrom: 5,
      jumpTo: 5,
      challenge: null,
      challengeMsg: ''
    };

    engine.setCameraPreset([xOf(6), 6.2, 12.2], [xOf(6), 1.2, 0]);

    const buildEndy3D = () => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.9, 0.72),
        new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.25, metalness: 0.2 })
      );
      body.position.y = 0.75;
      body.castShadow = true;
      g.add(body);

      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.36, 0.1), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      visor.position.set(0, 0.84, 0.35);
      g.add(visor);

      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const eL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), eyeMat);
      eL.position.set(-0.16, 0.85, 0.41);
      const eR = eL.clone(); eR.position.x = 0.16;
      g.add(eL, eR);

      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35), new THREE.MeshStandardMaterial({ color: 0xf97316 }));
      ant.position.y = 1.35;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xf59e0b, emissiveIntensity: 0.7 }));
      bulb.position.y = 1.56;
      g.add(ant, bulb);
      return g;
    };

    const pillars = [];
    let endyObj = null;
    let archGroup = null;

    const buildScene = () => {
      engine.clearRoom();
      pillars.length = 0;

      const rail = new THREE.Mesh(
        new THREE.BoxGeometry((MAX_N + 2) * STEP_X, 0.24, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.4 })
      );
      rail.position.set(xOf(MAX_N / 2), 0.14, 0);
      rail.receiveShadow = true;
      engine.roomGroup.add(rail);

      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(0.45, 1.0, 16),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.45 })
      );
      cone.rotation.z = -Math.PI / 2;
      cone.position.set(xOf(MAX_N) + 1.5, 0.22, 0);
      engine.roomGroup.add(cone);

      for (let i = 0; i <= MAX_N; i++) {
        const isTen = (i % 10 === 0);
        const pMat = new THREE.MeshStandardMaterial({ color: isTen ? 0x0284c7 : 0x475569, roughness: 0.35, metalness: 0.25 });
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.65, 0.42, 24), pMat);
        p.position.set(xOf(i), 0.28, 0);
        p.castShadow = true; p.receiveShadow = true;
        p.userData = { num: i };
        engine.roomGroup.add(p);
        engine.registerInteractive(p);
        pillars.push(p);

        const lbl = engine.createLabelSprite(i, isTen ? '#0284C7' : '#1E293B', '#FFFFFF', 0.72);
        lbl.position.set(xOf(i), 0.65, 1.15);
        engine.roomGroup.add(lbl);
      }

      archGroup = new THREE.Group();
      engine.roomGroup.add(archGroup);

      endyObj = buildEndy3D();
      endyObj.position.set(xOf(state.pos), 0.48, 0);
      engine.roomGroup.add(endyObj);

      updatePillarHighlights();

      // Click any pillar to place Endy directly as a new starting point
      engine.onClick((hit) => {
        const target = hit.object?.userData?.num;
        if (typeof target === 'number' && !state.animating) {
          setStartPos(target);
          ctx.playTone(620 + target * 14);
        }
      });

      // Clear, steady 3D jump animation (1.45 jumps/sec so kids clearly see each hop)
      engine.onUpdate((dt, elapsed) => {
        if (!endyObj) return;
        if (state.animating) {
          state.jumpProgress += dt * 1.55;
          const t = Math.min(1, state.jumpProgress);
          const curX = THREE.MathUtils.lerp(xOf(state.jumpFrom), xOf(state.jumpTo), t);
          const arcY = 0.48 + Math.sin(t * Math.PI) * 2.5;
          endyObj.position.set(curX, arcY, 0);
          engine.controls.target.x = THREE.MathUtils.lerp(engine.controls.target.x, curX, 0.14);
          engine.camera.position.x = THREE.MathUtils.lerp(engine.camera.position.x, curX, 0.1);

          if (t >= 1) {
            const isForward = state.jumpTo > state.jumpFrom;
            addJumpArch(state.jumpFrom, state.jumpTo, isForward ? 0x22c55e : 0xf97316, isForward ? '+1' : '−1');
            state.pos = state.jumpTo;
            state.stepsTaken++;
            state.trail.push(state.pos);
            ctx.playTone(isForward ? 760 + state.stepsTaken * 30 : 540 - state.stepsTaken * 15);
            updatePillarHighlights();
            updateUI();

            if (state.jumpQueue.length > 0) {
              state.jumpFrom = state.pos;
              state.jumpTo = state.jumpQueue.shift();
              state.jumpProgress = 0;
            } else {
              state.animating = false;
              updateUI();
            }
          }
        } else {
          endyObj.position.y = 0.48 + Math.sin(elapsed * 3.0) * 0.08;
        }
      });

      updateUI();
    };

    const focusCameraOn = (n) => {
      const tx = xOf(n);
      engine.controls.target.set(tx, 1.2, 0);
      engine.camera.position.set(tx, 6.2, 12.2);
    };

    const clearArches = () => {
      if (!archGroup) return;
      while (archGroup.children.length > 0) {
        const c = archGroup.children[0];
        archGroup.remove(c);
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      }
    };

    const setStartPos = (n) => {
      state.startPos = n;
      state.pos = n;
      state.stepsTaken = 0;
      state.trail = [n];
      clearArches();
      endyObj.position.set(xOf(n), 0.48, 0);
      focusCameraOn(n);
      updatePillarHighlights();
      updateUI();
    };

    const addJumpArch = (fromN, toN, colorHex, badgeText) => {
      const p0 = new THREE.Vector3(xOf(fromN), 0.72, 0);
      const p1 = new THREE.Vector3((xOf(fromN) + xOf(toN)) / 2, 3.15, 0);
      const p2 = new THREE.Vector3(xOf(toN), 0.72, 0);
      const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 22, 0.1, 10, false),
        new THREE.MeshStandardMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 0.5 })
      );
      archGroup.add(tube);

      // Clear floating "+1" or "-1" badge right at the peak of every single jump!
      const badge = engine.createLabelSprite(badgeText, colorHex === 0x22c55e ? '#16A34A' : '#EA580C', '#FFFFFF', 0.62);
      badge.position.set((xOf(fromN) + xOf(toN)) / 2, 2.55, 0.2);
      archGroup.add(badge);
    };

    const updatePillarHighlights = () => {
      pillars.forEach((p, idx) => {
        if (idx === state.pos) p.material.color.setHex(0xfacc15);
        else if (idx === state.startPos && state.stepsTaken > 0) p.material.color.setHex(0x38bdf8);
        else if (idx === state.pos - 1) p.material.color.setHex(0xf97316);
        else if (idx === state.pos + 1) p.material.color.setHex(0x22c55e);
        else p.material.color.setHex(idx % 10 === 0 ? 0x0284c7 : 0x475569);
      });
    };

    const jumpSingleStep = (dir) => {
      if (state.animating) return;
      const next = state.pos + dir;
      if (next < 0 || next > MAX_N) return;
      state.op = dir > 0 ? '+' : '-';
      state.jumpFrom = state.pos;
      state.jumpTo = next;
      state.jumpQueue = [];
      state.jumpProgress = 0;
      state.animating = true;
    };

    const runMultiJump = () => {
      if (state.animating) return;
      state.startPos = state.pos;
      state.stepsTaken = 0;
      state.trail = [state.pos];
      clearArches();
      const dir = state.op === '+' ? 1 : -1;
      const queue = [];
      let cur = state.pos;
      for (let i = 0; i < state.steps; i++) {
        const next = cur + dir;
        if (next < 0 || next > MAX_N) break;
        queue.push(next);
        cur = next;
      }
      if (queue.length === 0) return;
      state.jumpFrom = state.pos;
      state.jumpTo = queue.shift();
      state.jumpQueue = queue;
      state.jumpProgress = 0;
      state.animating = true;
    };

    const updateUI = () => {
      const isEn = ctx.getLang() === 'en';
      const pred = state.pos > 0 ? state.pos - 1 : '—';
      const succ = state.pos < MAX_N ? state.pos + 1 : '—';
      const diff = state.pos - state.startPos;

      const eqStr = state.stepsTaken > 0
        ? `${state.startPos} ${diff >= 0 ? '+' : '−'} ${Math.abs(diff)} = ${state.pos}`
        : `${isEn ? 'At' : 'Đang ở số'}: ${state.pos}  (${pred} ◀ ${state.pos} ▶ ${succ})`;

      ctx.setFormula(eqStr);
      ctx.setBottomNote(
        isEn
          ? 'Use "+1 Step" / "−1 Step" to hop one square at a time, or run an auto-jump!'
          : 'Bấm "Tiến 1 ô (+1)" hoặc "Lùi 1 ô (−1)" để thấy Endy nhảy từng bước có vòng cung!'
      );

      ctx.leftHud.innerHTML = `
        <div class="mdl-section-title">🦘 ${isEn ? 'Hop 1 Step at a Time (Easy!)' : 'Bật nhảy từng ô (Dễ hiểu nhất!)'}</div>
        <div class="mdl-control-row">
          <button class="mdl-btn mdl-btn-warn" style="flex:1;" id="r2-step-back">⬅ ${isEn ? 'Back 1 (−1)' : 'Lùi 1 ô (−1)'}</button>
          <button class="mdl-btn mdl-btn-success" style="flex:1;" id="r2-step-fwd">${isEn ? 'Fwd 1 (+1)' : 'Tiến 1 ô (+1)'} ➡</button>
        </div>

        <div class="mdl-section-title">🚀 ${isEn ? 'Auto-Jump Equation' : 'Hoặc nhảy tự động nhiều bước'}</div>
        <div class="mdl-control-row" style="align-items:center;">
          <button class="mdl-btn ${state.op === '+' ? 'mdl-btn-success' : ''}" id="r2-op-add">➕ ${isEn ? 'Add' : 'Cộng'}</button>
          <button class="mdl-btn ${state.op === '-' ? 'mdl-btn-warn' : ''}" id="r2-op-sub">➖ ${isEn ? 'Sub' : 'Trừ'}</button>
          <input type="number" class="mdl-input" id="r2-steps" value="${state.steps}" min="1" max="12" style="width:62px;">
        </div>
        <button class="mdl-btn mdl-btn-primary" style="width:100%;" id="r2-run-jump">▶ ${isEn ? `Auto-Jump ${state.op}${state.steps} steps!` : `Chạy bật nhảy ${state.op}${state.steps} ô!`}</button>

        <div class="mdl-section-title">${isEn ? 'Pick Starting Number' : 'Đặt vị trí bắt đầu'}: <strong style="color:#FEF08A;">${state.pos}</strong></div>
        <input type="range" class="mdl-slider" id="r2-slider" min="0" max="${MAX_N}" value="${state.pos}">

        <div class="mdl-challenge-box">
          <div class="mdl-section-title" style="margin-top:0;color:#FEF08A;">🎯 ${isEn ? 'Practice Challenge' : 'Thử thách Tia số'}</div>
          ${!state.challenge
            ? `<button class="mdl-btn mdl-btn-warn" style="width:100%;" id="r2-new-ch">${isEn ? 'Start Challenge!' : 'Nhận nhiệm vụ nhảy số!'}</button>`
            : `<div class="mdl-challenge-q">${state.challenge.text}</div>
               <div class="mdl-control-row">
                 <button class="mdl-btn mdl-btn-success" id="r2-check-ch">${isEn ? 'Check' : 'Kiểm tra'}</button>
                 <button class="mdl-btn" id="r2-new-ch">${isEn ? 'Next' : 'Đề mới'}</button>
               </div>
               ${state.challengeMsg}`}
        </div>
      `;

      ctx.rightHud.innerHTML = `
        <div class="mdl-section-title">📐 ${isEn ? 'Step-by-Step Jump Trail (2D)' : 'Hành trình từng bước nhảy (2D)'}</div>
        <div class="mdl-2d-card">
          <div style="display:flex;justify-content:space-around;text-align:center;font-family:'Baloo 2',cursive;font-weight:800;">
            <div><div style="font-size:0.78rem;color:#EA580C;">${isEn ? 'Before' : 'Liền trước'}</div><div style="font-size:1.45rem;color:#EA580C;">${pred}</div></div>
            <div><div style="font-size:0.78rem;color:#0284C7;">${isEn ? 'Now' : 'Hiện tại'}</div><div style="font-size:1.75rem;color:#0284C7;">${state.pos}</div></div>
            <div><div style="font-size:0.78rem;color:#16A34A;">${isEn ? 'After' : 'Liền sau'}</div><div style="font-size:1.45rem;color:#16A34A;">${succ}</div></div>
          </div>
          <div style="margin-top:10px;padding-top:8px;border-top:2px dashed #CBD5E1;text-align:center;font-weight:800;color:#0F172A;font-size:0.95rem;">
            ${state.trail.length > 1
              ? `<div>${isEn ? 'Jumps' : 'Các ô đã nhảy qua'}:</div><div style="color:#0284C7;margin-top:4px;">${state.trail.join(' ➔ ')}</div><div style="color:#16A34A;margin-top:4px;font-size:1.15rem;">${eqStr}</div>`
              : `<div style="color:#64748B;">${isEn ? 'Click +1 or −1 to watch each hop!' : 'Hãy bấm Tiến 1 ô (+1) hoặc Lùi 1 ô (−1) để xem đường nhảy!'}</div>`}
          </div>
        </div>
      `;

      document.getElementById('r2-step-fwd').onclick = () => jumpSingleStep(1);
      document.getElementById('r2-step-back').onclick = () => jumpSingleStep(-1);
      document.getElementById('r2-slider').oninput = (e) => { if (!state.animating) setStartPos(parseInt(e.target.value)); };
      document.getElementById('r2-op-add').onclick = () => { state.op = '+'; updateUI(); };
      document.getElementById('r2-op-sub').onclick = () => { state.op = '-'; updateUI(); };
      document.getElementById('r2-steps').onchange = (e) => { state.steps = Math.max(1, Math.min(12, parseInt(e.target.value) || 1)); updateUI(); };
      document.getElementById('r2-run-jump').onclick = runMultiJump;

      const newCh = document.getElementById('r2-new-ch');
      if (newCh) newCh.onclick = () => {
        const start = Math.floor(Math.random() * 8) + 4;
        const step = Math.floor(Math.random() * 5) + 3;
        const isAdd = Math.random() > 0.4;
        setStartPos(start);
        state.challenge = {
          target: isAdd ? start + step : start - step,
          text: isEn
            ? `Endy is at <b>${start}</b>. Click <b>${isAdd ? 'Fwd 1 (+1)' : 'Back 1 (−1)'}</b> exactly <b>${step} times</b>!`
            : `Endy đang ở số <b>${start}</b>. Hãy bấm nút <b>${isAdd ? 'Tiến 1 ô (+1)' : 'Lùi 1 ô (−1)'}</b> đúng <b>${step} lần</b>!`
        };
        state.challengeMsg = '';
        updateUI();
      };
      const chk = document.getElementById('r2-check-ch');
      if (chk) chk.onclick = () => {
        if (state.pos === state.challenge.target) {
          ctx.playSuccess();
          state.challengeMsg = `<div class="mdl-feedback-pill ok">🎉 ${isEn ? `Correct! Endy landed on ${state.pos}!` : `Chính xác! Endy đã nhảy tới số ${state.pos}!`}</div>`;
        } else {
          ctx.playError();
          state.challengeMsg = `<div class="mdl-feedback-pill err">💡 ${isEn ? `Endy is at ${state.pos}. Keep hopping!` : `Endy đang ở số ${state.pos}, con bấm Tiến/Lùi tiếp nhé!`}</div>`;
        }
        updateUI();
      };
    };

    buildScene();
    return {
      reset: () => { state.steps = 3; state.op = '+'; state.challenge = null; state.challengeMsg = ''; setStartPos(5); },
      onLangChange: () => updateUI()
    };
  }
};
