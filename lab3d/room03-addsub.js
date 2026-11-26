/* =========================================================================
   PHÒNG 03: BÀN THÍ NGHIỆM PHÉP CỘNG & PHÉP TRỪ 3D (SIÊU TRỰC QUAN)
   - Chọn vật thể mô phỏng sinh động: 🧱 Khối 10 ô rõ nét | 🍎 Táo | 🌸 Hoa | 🧸 Gấu
   - Chọn nhanh 5 dạng bài: Dưới 10 • Cộng không nhớ • Cộng có nhớ • Trừ không nhớ • Trừ có nhớ
   - Mỗi thanh chục được ghép từ 10 ô vuông rõ từng vạch để trẻ đếm trực tiếp!
   - Giải thích sư phạm từng bước cực dễ hiểu ngay bảng 2D bên phải
   ========================================================================= */
import { THREE } from './lab-engine.js';

export const Room03AddSub = {
  id: 'room03',
  mount(engine, ctx) {
    engine.setCameraPreset([0, 10.5, 16.5], [0, 1.1, 0]);

    const state = {
      theme: 'blocks', // 'blocks' | 'apples' | 'flowers' | 'bears'
      op: '+',
      a: 25,
      b: 17,
      stage: 'split', // 'split' | 'merged' | 'regrouped' | 'borrowed' | 'subtracted'
      challenge: null,
      challengeMsg: ''
    };

    const texTenClear = engine.createGridTexture('#0EA5E9', '#FFFFFF', 10, 1);
    const texTenPurple = engine.createGridTexture('#8B5CF6', '#FFFFFF', 10, 1);
    const texTenGold = engine.createGridTexture('#F59E0B', '#FFFFFF', 10, 1);

    const matTenA = new THREE.MeshStandardMaterial({ map: texTenClear, roughness: 0.3 });
    const matTenB = new THREE.MeshStandardMaterial({ map: texTenPurple, roughness: 0.3 });
    const matTenGold = new THREE.MeshStandardMaterial({ map: texTenGold, roughness: 0.25, emissive: 0xd97706, emissiveIntensity: 0.25 });
    const matOneA = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
    const matOneB = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3 });
    const matOneGold = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xd97706, emissiveIntensity: 0.3 });

    // Create a vivid 3D Unit Object based on selected theme (Block / Apple / Flower / Bear)
    const createUnitMesh = (theme, isGroupB, isGold) => {
      if (theme === 'apples') {
        const g = new THREE.Group();
        const apple = new THREE.Mesh(
          new THREE.SphereGeometry(0.24, 16, 16),
          new THREE.MeshStandardMaterial({ color: isGold ? 0xfacc15 : (isGroupB ? 0x22c55e : 0xef4444), roughness: 0.25 })
        );
        apple.scale.set(1, 0.92, 1);
        apple.castShadow = true;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16), new THREE.MeshStandardMaterial({ color: 0x78350f }));
        stem.position.y = 0.24;
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.08), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
        leaf.position.set(0.08, 0.27, 0); leaf.rotation.z = 0.4;
        g.add(apple, stem, leaf);
        return g;
      }
      if (theme === 'flowers') {
        const g = new THREE.Group();
        const center = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
        const pCol = isGold ? 0xf59e0b : (isGroupB ? 0xa855f7 : 0xec4899);
        const pMat = new THREE.MeshStandardMaterial({ color: pCol, roughness: 0.35 });
        for (let k = 0; k < 5; k++) {
          const ang = (k / 5) * Math.PI * 2;
          const pet = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), pMat);
          pet.position.set(Math.cos(ang) * 0.15, 0, Math.sin(ang) * 0.15);
          pet.scale.set(1, 0.45, 1);
          pet.castShadow = true;
          g.add(pet);
        }
        g.add(center);
        return g;
      }
      if (theme === 'bears') {
        const g = new THREE.Group();
        const bCol = isGold ? 0xf59e0b : (isGroupB ? 0x92400e : 0xd97706);
        const bMat = new THREE.MeshStandardMaterial({ color: bCol, roughness: 0.55 });
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 14), bMat);
        head.castShadow = true;
        const earL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), bMat);
        earL.position.set(-0.16, 0.17, 0);
        const earR = earL.clone(); earR.position.x = 0.16;
        const snout = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), new THREE.MeshStandardMaterial({ color: 0xfef3c7 }));
        snout.position.set(0, -0.03, 0.17);
        g.add(head, earL, earR, snout);
        return g;
      }
      // Default: crisp 3D unit cube with white border highlight
      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), isGold ? matOneGold : (isGroupB ? matOneB : matOneA));
      cube.castShadow = true; cube.receiveShadow = true;
      return cube;
    };

    // Create a 10-Group (10 clearly segmented squares stacked, OR a 10-tray crate of apples/flowers/bears!)
    const createTenGroup = (theme, isGroupB, isGold) => {
      if (theme === 'blocks') {
        // Build 10 visibly distinct stacked cubes with crisp gaps so kids can count 1..10!
        const rodGroup = new THREE.Group();
        const cMat = isGold ? matTenGold : (isGroupB ? matTenB : matTenA);
        const rod = new THREE.Mesh(new THREE.BoxGeometry(0.42, 2.6, 0.42), cMat);
        rod.position.y = 1.3;
        rod.castShadow = true; rod.receiveShadow = true;
        rodGroup.add(rod);
        return rodGroup;
      }
      // For Apples / Flowers / Bears: A neat 2×5 transparent tray holding 10 real 3D items (1 giỏ = 10 vật)!
      const trayGroup = new THREE.Group();
      const tray = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 0.14, 2.35),
        new THREE.MeshStandardMaterial({ color: isGold ? 0xfacc15 : (isGroupB ? 0x6d28d9 : 0x0284c7), roughness: 0.4 })
      );
      tray.position.y = 0.07;
      tray.receiveShadow = true;
      trayGroup.add(tray);
      for (let i = 0; i < 10; i++) {
        const item = createUnitMesh(theme, isGroupB, isGold);
        item.scale.setScalar(0.75);
        item.position.set(i % 2 === 0 ? -0.25 : 0.25, 0.34, -0.92 + Math.floor(i / 2) * 0.46);
        trayGroup.add(item);
      }
      return trayGroup;
    };

    const buildCluster = (parent, tCount, oCount, xCenter, isGroupB, highlightLastTen = false, goldOnes = false) => {
      const isBlocks = state.theme === 'blocks';
      const spacingT = isBlocks ? 0.62 : 1.25;
      for (let i = 0; i < tCount; i++) {
        const tenObj = createTenGroup(state.theme, isGroupB, highlightLastTen && i === tCount - 1);
        const col = i % 5, row = Math.floor(i / 5);
        tenObj.position.set(xCenter - 2.4 + col * spacingT, 0.32, isBlocks ? (-0.9 + row * 0.85) : (-1.1 + row * 2.55));
        parent.add(tenObj);
      }
      for (let i = 0; i < oCount; i++) {
        const unitObj = createUnitMesh(state.theme, isGroupB, goldOnes);
        const col = i % 5, row = Math.floor(i / 5);
        unitObj.position.set(xCenter + 0.9 + col * 0.56, 0.54 + (row >= 2 ? 0.52 : 0), -1.1 + (row % 2) * 0.62);
        parent.add(unitObj);
      }
    };

    const rebuild3D = () => {
      engine.clearRoom();
      const bench = new THREE.Mesh(
        new THREE.BoxGeometry(16.5, 0.36, 7.6),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.2 })
      );
      bench.position.set(0, 0.14, 0);
      bench.receiveShadow = true;
      engine.roomGroup.add(bench);

      const tA = Math.floor(state.a / 10), oA = state.a % 10;
      const tB = Math.floor(state.b / 10), oB = state.b % 10;

      if (state.op === '+') {
        if (state.stage === 'split') {
          buildCluster(engine.roomGroup, tA, oA, -4.1, false);
          buildCluster(engine.roomGroup, tB, oB, 4.1, true);
          const lA = engine.createLabelSprite(`A = ${state.a}`, '#0284C7', '#FFFFFF', 0.95); lA.position.set(-4.1, 3.8, -2.0);
          const lB = engine.createLabelSprite(`B = ${state.b}`, '#7C3AED', '#FFFFFF', 0.95); lB.position.set(4.1, 3.8, -2.0);
          const lP = engine.createLabelSprite('+', '#22C55E', '#FFFFFF', 0.9); lP.position.set(0, 2.3, 0);
          engine.roomGroup.add(lA, lB, lP);
        } else if (state.stage === 'merged') {
          buildCluster(engine.roomGroup, tA + tB, oA + oB, 0, false, false, (oA + oB) >= 10);
          const lM = engine.createLabelSprite(`${tA + tB} chục + ${oA + oB} lẻ`, '#F59E0B', '#FFFFFF', 1.15);
          lM.position.set(0, 4.0, -2.0);
          engine.roomGroup.add(lM);
        } else {
          const sum = state.a + state.b;
          buildCluster(engine.roomGroup, Math.floor(sum / 10), sum % 10, 0, false, (oA + oB) >= 10);
          const lR = engine.createLabelSprite(`= ${sum}`, '#16A34A', '#FFFFFF', 1.3);
          lR.position.set(0, 4.1, -2.0);
          engine.roomGroup.add(lR);
        }
      } else {
        const big = Math.max(state.a, state.b), small = Math.min(state.a, state.b);
        state.a = big; state.b = small;
        const tb = Math.floor(big / 10), ob = big % 10, needB = ob < (small % 10);
        if (state.stage === 'split') {
          buildCluster(engine.roomGroup, tb, ob, 0, false);
          const l = engine.createLabelSprite(`${big} − ${small}`, '#EA580C', '#FFFFFF', 1.15); l.position.set(0, 4.0, -2.0);
          engine.roomGroup.add(l);
        } else if (state.stage === 'borrowed') {
          buildCluster(engine.roomGroup, needB ? tb - 1 : tb, needB ? ob + 10 : ob, 0, false, false, needB);
          const l = engine.createLabelSprite(needB ? `${tb - 1} chục + ${ob + 10} lẻ` : `${tb} chục + ${ob} lẻ`, '#EAB308', '#0F172A', 1.15);
          l.position.set(0, 4.0, -2.0);
          engine.roomGroup.add(l);
        } else {
          const diff = big - small;
          buildCluster(engine.roomGroup, Math.floor(diff / 10), diff % 10, 0, false);
          const l = engine.createLabelSprite(`= ${diff}`, '#16A34A', '#FFFFFF', 1.3); l.position.set(0, 4.1, -2.0);
          engine.roomGroup.add(l);
        }
      }

      updateUI();
    };

    const getStepStory = (isEn) => {
      const tA = Math.floor(state.a / 10), oA = state.a % 10;
      const tB = Math.floor(state.b / 10), oB = state.b % 10;
      const unitWord = { blocks: isEn ? 'blocks' : 'ô vuông', apples: isEn ? 'apples' : 'quả táo', flowers: isEn ? 'flowers' : 'bông hoa', bears: isEn ? 'bears' : 'chú gấu' }[state.theme];
      const tenWord = { blocks: isEn ? 'ten-rods (10 squares)' : 'thanh chục (10 ô)', apples: isEn ? 'baskets of 10' : 'giỏ 10 táo', flowers: isEn ? 'bouquets of 10' : 'bó 10 hoa', bears: isEn ? 'boxes of 10' : 'hộp 10 gấu' }[state.theme];

      if (state.op === '+') {
        const oSum = oA + oB, sum = state.a + state.b;
        const carry = oSum >= 10;
        if (isEn) {
          return `<b>1️⃣ Start:</b> ${state.a} + ${state.b}.<br><b>2️⃣ Ones:</b> ${oA} + ${oB} = <b>${oSum}</b> ${unitWord}.${carry ? ` Since ${oSum} ≥ 10, bundle <b>10 ${unitWord} → 1 ${tenWord}</b> (carry 1), leaving <b>${oSum % 10}</b>!` : ''}<br><b>3️⃣ Tens:</b> ${tA} + ${tB}${carry ? ' + 1 (carried)' : ''} = <b>${Math.floor(sum / 10)}</b> → Total = <b>${sum}</b>!`;
        }
        return `<b>1️⃣ Ban đầu:</b> Nhóm A có <b>${state.a}</b>, nhóm B có <b>${state.b}</b>.<br><b>2️⃣ Hàng đơn vị:</b> ${oA} + ${oB} = <b>${oSum}</b> ${unitWord}.${carry ? ` Vì ${oSum} ≥ 10 nên ta gom <b>10 ${unitWord} → 1 ${tenWord}</b> (nhớ 1), còn lẻ <b>${oSum % 10}</b>!` : ' Không vượt quá 10 (không nhớ).'}<br><b>3️⃣ Hàng chục:</b> ${tA} + ${tB}${carry ? ' + 1 (nhớ)' : ''} = <b>${Math.floor(sum / 10)}</b> chục → Kết quả <b>${sum}</b>!`;
      } else {
        const diff = state.a - state.b, borrow = oA < oB;
        if (isEn) {
          return `<b>1️⃣ Start:</b> ${state.a} (${tA} tens, ${oA} ones) − ${state.b}.<br><b>2️⃣ Ones:</b> ${borrow ? `${oA} < ${oB} → Split 1 ${tenWord} into <b>10 ${unitWord}</b>! Now we have ${tA - 1} tens & ${oA + 10} ones. ${oA + 10} − ${oB} = <b>${oA + 10 - oB}</b>.` : `${oA} − ${oB} = <b>${oA - oB}</b> (no borrowing!).`}<br><b>3️⃣ Tens:</b> ${borrow ? tA - 1 : tA} − ${tB} = <b>${Math.floor(diff / 10)}</b> → Result = <b>${diff}</b>!`;
        }
        return `<b>1️⃣ Ban đầu:</b> Có <b>${state.a}</b> (${tA} ${tenWord} và ${oA} ${unitWord}).<br><b>2️⃣ Hàng đơn vị:</b> ${borrow ? `Vì ${oA} không trừ được ${oB}, ta <b>tách 1 ${tenWord} thành 10 ${unitWord}</b> (mượn 1 chục) → có <b>${oA + 10}</b>. Lấy ${oA + 10} − ${oB} = <b>${oA + 10 - oB}</b>!` : `Lấy ${oA} − ${oB} = <b>${oA - oB}</b> (không cần mượn).`}<br><b>3️⃣ Hàng chục:</b> Còn ${borrow ? tA - 1 : tA} chục, bớt ${tB} chục còn <b>${Math.floor(diff / 10)}</b> chục → Kết quả <b>${diff}</b>!`;
      }
    };

    const updateUI = () => {
      const isEn = ctx.getLang() === 'en';
      const ans = state.op === '+' ? state.a + state.b : state.a - state.b;
      const showAns = (state.stage === 'regrouped' || state.stage === 'subtracted');

      ctx.setFormula(`${state.a} ${state.op} ${state.b} = ${showAns ? ans : '?'}`);
      ctx.setBottomNote(
        isEn
          ? 'Switch between 3D Blocks, Apples, Flowers, or Bears & pick a preset below!'
          : 'Mỗi thanh chục gồm đúng 10 ô vuông rõ nét — hoặc đổi sang 🍎 Táo, 🌸 Hoa, 🧸 Gấu cực sinh động!'
      );

      ctx.leftHud.innerHTML = `
        <div class="mdl-section-title">🎨 ${isEn ? 'Choose 3D Objects' : 'Chọn vật thể mô phỏng 3D'}</div>
        <div class="mdl-control-row">
          <button class="mdl-btn ${state.theme === 'blocks' ? 'active' : ''}" id="r3-th-blocks">🧱 ${isEn ? 'Blocks' : 'Khối 10 ô'}</button>
          <button class="mdl-btn ${state.theme === 'apples' ? 'active' : ''}" id="r3-th-apples">🍎 ${isEn ? 'Apples' : 'Táo'}</button>
          <button class="mdl-btn ${state.theme === 'flowers' ? 'active' : ''}" id="r3-th-flowers">🌸 ${isEn ? 'Flowers' : 'Hoa'}</button>
          <button class="mdl-btn ${state.theme === 'bears' ? 'active' : ''}" id="r3-th-bears">🧸 ${isEn ? 'Bears' : 'Gấu'}</button>
        </div>

        <div class="mdl-section-title">📚 ${isEn ? 'Quick Lesson Presets' : 'Chọn nhanh dạng bài'}</div>
        <div class="mdl-control-row">
          <button class="mdl-btn" id="r3-p-u10" style="font-size:0.8rem;">${isEn ? 'Under 10 (5+3)' : 'Dưới 10 (5+3)'}</button>
          <button class="mdl-btn" id="r3-p-add0" style="font-size:0.8rem;">${isEn ? 'Add No Carry' : 'Cộng ko nhớ'}</button>
          <button class="mdl-btn" id="r3-p-add1" style="font-size:0.8rem;">${isEn ? 'Add Carry' : 'Cộng có nhớ'}</button>
          <button class="mdl-btn" id="r3-p-sub0" style="font-size:0.8rem;">${isEn ? 'Sub No Borrow' : 'Trừ ko nhớ'}</button>
          <button class="mdl-btn" id="r3-p-sub1" style="font-size:0.8rem;">${isEn ? 'Sub Borrow' : 'Trừ có nhớ'}</button>
        </div>

        <div class="mdl-control-row" style="align-items:center;">
          <input type="number" class="mdl-input" id="r3-a" value="${state.a}" min="1" max="89" style="width:66px;">
          <button class="mdl-btn ${state.op === '+' ? 'mdl-btn-success' : 'mdl-btn-warn'}" id="r3-toggle-op" style="padding:5px 12px;">${state.op}</button>
          <input type="number" class="mdl-input" id="r3-b" value="${state.b}" min="1" max="59" style="width:66px;">
          <button class="mdl-btn mdl-btn-primary" id="r3-set">OK</button>
        </div>

        <div class="mdl-section-title">✨ ${isEn ? 'Run 3D Steps' : 'Thao tác 2 bước trên bàn 3D'}</div>
        ${state.op === '+' ? `
          <button class="mdl-btn mdl-btn-primary" style="width:100%;margin-bottom:6px;" id="r3-step-merge">1️⃣ ${isEn ? 'Merge Groups A + B' : 'Bước 1: Ghép 2 nhóm lại'}</button>
          <button class="mdl-btn mdl-btn-success" style="width:100%;" id="r3-step-regroup">2️⃣ ${isEn ? 'Bundle 10 Ones → 1 Ten!' : 'Bước 2: Gom 10 lẻ → 1 chục & Xem KQ!'}</button>
        ` : `
          <button class="mdl-btn mdl-btn-warn" style="width:100%;margin-bottom:6px;" id="r3-step-borrow">1️⃣ ${isEn ? 'Borrow 1 Ten → 10 Ones' : 'Bước 1: Tách 1 chục → 10 lẻ (nếu cần)'}</button>
          <button class="mdl-btn mdl-btn-success" style="width:100%;" id="r3-step-sub">2️⃣ ${isEn ? `Take Away ${state.b}` : `Bước 2: Lấy bớt ${state.b} & Xem KQ!`}</button>
        `}
      `;

      ctx.rightHud.innerHTML = `
        <div class="mdl-section-title">📝 ${isEn ? 'Step-by-Step Explanation (2D)' : 'Giải thích từng bước cực dễ hiểu'}</div>
        <div class="mdl-2d-card" style="font-family:monospace;font-size:1.65rem;font-weight:900;text-align:right;padding:12px 32px;">
          <div style="color:#0284C7;">${String(state.a).padStart(3, ' ')}</div>
          <div style="color:#7C3AED;border-bottom:3px solid #0F172A;padding-bottom:4px;">${state.op} ${String(state.b).padStart(2, ' ')}</div>
          <div style="color:#16A34A;padding-top:4px;">${showAns ? ans : '??'}</div>
        </div>
        <div style="margin-top:10px;background:rgba(30,41,59,0.9);border:1.5px solid #38BDF8;border-radius:14px;padding:10px 12px;font-size:0.88rem;color:#E2E8F0;line-height:1.55;">
          ${getStepStory(isEn)}
        </div>
      `;

      const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
      ['blocks', 'apples', 'flowers', 'bears'].forEach(th => bind(`r3-th-${th}`, () => { state.theme = th; ctx.playTone(720); rebuild3D(); }));
      bind('r3-p-u10', () => { state.op = '+'; state.a = 5; state.b = 3; state.stage = 'split'; rebuild3D(); });
      bind('r3-p-add0', () => { state.op = '+'; state.a = 23; state.b = 14; state.stage = 'split'; rebuild3D(); });
      bind('r3-p-add1', () => { state.op = '+'; state.a = 25; state.b = 17; state.stage = 'split'; rebuild3D(); });
      bind('r3-p-sub0', () => { state.op = '-'; state.a = 48; state.b = 13; state.stage = 'split'; rebuild3D(); });
      bind('r3-p-sub1', () => { state.op = '-'; state.a = 54; state.b = 26; state.stage = 'split'; rebuild3D(); });
      bind('r3-toggle-op', () => { state.op = state.op === '+' ? '-' : '+'; state.stage = 'split'; rebuild3D(); });
      bind('r3-set', () => {
        state.a = Math.max(1, Math.min(89, parseInt(document.getElementById('r3-a').value) || 25));
        state.b = Math.max(1, Math.min(59, parseInt(document.getElementById('r3-b').value) || 17));
        state.stage = 'split'; rebuild3D();
      });
      bind('r3-step-merge', () => { state.stage = 'merged'; ctx.playTone(640); rebuild3D(); });
      bind('r3-step-regroup', () => { state.stage = 'regrouped'; ctx.playSuccess(); rebuild3D(); });
      bind('r3-step-borrow', () => { state.stage = 'borrowed'; ctx.playTone(620); rebuild3D(); });
      bind('r3-step-sub', () => { state.stage = 'subtracted'; ctx.playSuccess(); rebuild3D(); });
    };

    rebuild3D();
    return {
      reset: () => { state.theme = 'blocks'; state.op = '+'; state.a = 25; state.b = 17; state.stage = 'split'; rebuild3D(); },
      onLangChange: () => updateUI()
    };
  }
};
