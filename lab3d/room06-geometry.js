/* =========================================================================
   PHÒNG 06: BẢO TÀNG HÌNH HỌC 3D
   - Đầy đủ 9 hình học: Vuông, Chữ nhật, Tam giác, Tròn, Lập phương, Hộp CN, Cầu, Trụ, Nón
   - Xoay 360°, phóng to/thu nhỏ, hiện khung cạnh & đỉnh (Wireframe + Vertices)
   - Thanh trượt MỞ / ĐÓNG HÌNH KHAI TRIỂN 3D (Animated 3D Cube Net!)
   - Liên hệ đồ vật thực tế + Thử thách nhận diện hình học
   ========================================================================= */
import { THREE } from './lab-engine.js';

const SHAPES_INFO = {
  cube: { vi: 'Hình lập phương', en: 'Cube', faces: 6, edges: 12, verts: 8, realVi: 'Khối Rubik, viên xúc xắc', realEn: "Rubik's cube, dice", hasNet: true },
  cuboid: { vi: 'Hình hộp chữ nhật', en: 'Cuboid', faces: 6, edges: 12, verts: 8, realVi: 'Hộp sữa, viên gạch, quyển sách', realEn: 'Milk carton, brick, book', hasNet: false },
  sphere: { vi: 'Hình cầu', en: 'Sphere', faces: 1, edges: 0, verts: 0, realVi: 'Quả bóng đá, viên bi, quả địa cầu', realEn: 'Soccer ball, marble, globe', hasNet: false },
  cylinder: { vi: 'Hình trụ', en: 'Cylinder', faces: 3, edges: 2, verts: 0, realVi: 'Lon sữa đặc, chiếc trống, hộp cầu lông', realEn: 'Tin can, drum, tube', hasNet: false },
  cone: { vi: 'Hình nón', en: 'Cone', faces: 2, edges: 1, verts: 1, realVi: 'Nón lá Việt Nam, mũ sinh nhật, ốc quế', realEn: 'Conical hat, party hat, ice cream cone', hasNet: false },
  square: { vi: 'Hình vuông (2D)', en: 'Square (2D)', faces: 1, edges: 4, verts: 4, realVi: 'Viên gạch lát nền, khung ảnh vuông', realEn: 'Floor tile, square frame', hasNet: false },
  rectangle: { vi: 'Hình chữ nhật (2D)', en: 'Rectangle (2D)', faces: 1, edges: 4, verts: 4, realVi: 'Bảng lớp học, cánh cửa, tờ giấy A4', realEn: 'Blackboard, door, A4 paper', hasNet: false },
  triangle: { vi: 'Hình tam giác (2D)', en: 'Triangle (2D)', faces: 1, edges: 3, verts: 3, realVi: 'Thước ê-ke, biển báo giao thông tam giác', realEn: 'Set square, warning traffic sign', hasNet: false },
  circle: { vi: 'Hình tròn (2D)', en: 'Circle (2D)', faces: 1, edges: 0, verts: 0, realVi: 'Mặt đồng hồ, đồng xu, bánh xe', realEn: 'Clock face, coin, wheel', hasNet: false }
};

export const Room06Geometry = {
  id: 'room06',
  mount(engine, ctx) {
    engine.setCameraPreset([4.5, 4.8, 7.2], [0, 1.4, 0]);

    const state = {
      shape: 'cube',
      unfold: 0, // 0 = folded 3D cube, 1 = flat 2D cross net!
      wireframe: false,
      autoSpin: true,
      challenge: null,
      challengeMsg: ''
    };

    let displayGroup = null;
    let hinges = null;

    // Build Hinged 3D Cube Net (6 faces that genuinely unfold flat into a 2D cross!)
    const buildHingedCube = (wf) => {
      const S = 2.0;
      const root = new THREE.Group();
      root.position.y = 0.52;
      const faceGeo = new THREE.BoxGeometry(S, 0.08, S);
      const colors = [0x0ea5e9, 0x38bdf8, 0x22c55e, 0xf59e0b, 0xf43f5e, 0x8b5cf6];
      const mkFace = (col) => {
        const m = new THREE.Mesh(faceGeo, new THREE.MeshStandardMaterial({ color: col, roughness: 0.3, metalness: 0.15, wireframe: wf }));
        m.castShadow = true; m.receiveShadow = true;
        return m;
      };

      // Bottom base face
      root.add(mkFace(colors[0]));

      // Front hinge (+Z)
      const hFront = new THREE.Group(); hFront.position.set(0, 0, S / 2);
      const fFront = mkFace(colors[1]); fFront.position.set(0, 0, S / 2); hFront.add(fFront);
      root.add(hFront);

      // Back hinge (-Z)
      const hBack = new THREE.Group(); hBack.position.set(0, 0, -S / 2);
      const fBack = mkFace(colors[2]); fBack.position.set(0, 0, -S / 2); hBack.add(fBack);
      root.add(hBack);

      // Top lid hinged on Back face
      const hTop = new THREE.Group(); hTop.position.set(0, 0, -S);
      const fTop = mkFace(colors[3]); fTop.position.set(0, 0, -S / 2); hTop.add(fTop);
      hBack.add(hTop);

      // Left hinge (-X)
      const hLeft = new THREE.Group(); hLeft.position.set(-S / 2, 0, 0);
      const fLeft = mkFace(colors[4]); fLeft.position.set(-S / 2, 0, 0); hLeft.add(fLeft);
      root.add(hLeft);

      // Right hinge (+X)
      const hRight = new THREE.Group(); hRight.position.set(S / 2, 0, 0);
      const fRight = mkFace(colors[5]); fRight.position.set(S / 2, 0, 0); hRight.add(fRight);
      root.add(hRight);

      hinges = { hFront, hBack, hTop, hLeft, hRight };
      applyUnfold(state.unfold);
      return root;
    };

    const applyUnfold = (u) => {
      if (!hinges) return;
      const ang = (1 - u) * (Math.PI / 2);
      hinges.hFront.rotation.x = -ang;
      hinges.hBack.rotation.x = ang;
      hinges.hTop.rotation.x = ang;
      hinges.hLeft.rotation.z = -ang;
      hinges.hRight.rotation.z = ang;
    };

    const rebuild3D = () => {
      engine.clearRoom();
      hinges = null;

      // Museum Pedestal
      const ped = new THREE.Mesh(
        new THREE.CylinderGeometry(3.2, 3.6, 0.45, 36),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5, metalness: 0.1 })
      );
      ped.position.y = 0.22;
      ped.receiveShadow = true;
      engine.roomGroup.add(ped);

      displayGroup = new THREE.Group();
      engine.roomGroup.add(displayGroup);

      const mat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.25, metalness: 0.2, wireframe: state.wireframe });
      let mesh = null;

      if (state.shape === 'cube') {
        displayGroup.add(buildHingedCube(state.wireframe));
      } else if (state.shape === 'cuboid') {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 2.0), mat);
        mesh.position.y = 1.6;
      } else if (state.shape === 'sphere') {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(1.45, 32, 24), new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.22, metalness: 0.2, wireframe: state.wireframe }));
        mesh.position.y = 1.9;
      } else if (state.shape === 'cylinder') {
        mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 2.4, 32), new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.25, wireframe: state.wireframe }));
        mesh.position.y = 1.7;
      } else if (state.shape === 'cone') {
        mesh = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.5, 32), new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.28, wireframe: state.wireframe }));
        mesh.position.y = 1.75;
      } else if (state.shape === 'square') {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 0.14), mat);
        mesh.position.y = 1.8;
      } else if (state.shape === 'rectangle') {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.9, 0.14), mat);
        mesh.position.y = 1.65;
      } else if (state.shape === 'triangle') {
        const triShape = new THREE.Shape();
        triShape.moveTo(0, 1.5); triShape.lineTo(-1.5, -1.0); triShape.lineTo(1.5, -1.0); triShape.closePath();
        mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(triShape, { depth: 0.16, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, wireframe: state.wireframe }));
        mesh.position.set(0, 1.6, -0.08);
      } else if (state.shape === 'circle') {
        mesh = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.14, 40), new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3, wireframe: state.wireframe }));
        mesh.rotation.x = Math.PI / 2;
        mesh.position.y = 1.9;
      }

      if (mesh) {
        mesh.castShadow = true; mesh.receiveShadow = true;
        displayGroup.add(mesh);
      }

      engine.onUpdate((dt) => {
        if (state.autoSpin && displayGroup && state.unfold === 0) {
          displayGroup.rotation.y += dt * 0.45;
        }
      });

      updateUI();
    };

    const updateUI = () => {
      const isEn = ctx.getLang() === 'en';
      const info = SHAPES_INFO[state.shape];

      ctx.setFormula(`${isEn ? info.en : info.vi} — ${info.faces} ${isEn ? 'faces' : 'mặt'} • ${info.edges} ${isEn ? 'edges' : 'cạnh'} • ${info.verts} ${isEn ? 'vertices' : 'đỉnh'}`);
      ctx.setBottomNote(
        isEn
          ? `Real life: ${info.realEn}. Drag to rotate 360°!`
          : `Trong thực tế: ${info.realVi}. Kéo chuột để xoay 360°!`
      );

      ctx.leftHud.innerHTML = `
        <div class="mdl-section-title">🧊 ${isEn ? '3D Solids (5 Shapes)' : 'Hình khối 3D (5 khối)'}</div>
        <div class="mdl-control-row">
          ${['cube','cuboid','sphere','cylinder','cone'].map(k =>
            `<button class="mdl-btn ${state.shape === k ? 'active' : ''}" id="r6-s-${k}" style="font-size:0.8rem;">${isEn ? SHAPES_INFO[k].en : SHAPES_INFO[k].vi}</button>`
          ).join('')}
        </div>

        <div class="mdl-section-title">📐 ${isEn ? '2D Flat Shapes (4 Shapes)' : 'Hình phẳng 2D (4 hình)'}</div>
        <div class="mdl-control-row">
          ${['square','rectangle','triangle','circle'].map(k =>
            `<button class="mdl-btn ${state.shape === k ? 'active' : ''}" id="r6-s-${k}" style="font-size:0.8rem;">${isEn ? SHAPES_INFO[k].en.replace(' (2D)','') : SHAPES_INFO[k].vi.replace(' (2D)','')}</button>`
          ).join('')}
        </div>

        ${info.hasNet ? `
          <div class="mdl-section-title">📦 ${isEn ? 'Unfold / Fold 3D Net' : 'Mở / Đóng Hình Khai Triển 3D'}: ${Math.round(state.unfold * 100)}%</div>
          <input type="range" class="mdl-slider" id="r6-net" min="0" max="100" value="${Math.round(state.unfold * 100)}">
        ` : ''}

        <div class="mdl-control-row" style="margin-top:8px;">
          <button class="mdl-btn ${state.wireframe ? 'mdl-btn-warn' : ''}" id="r6-wf">🕸️ ${isEn ? 'Wireframe' : 'Khung xương'}</button>
          <button class="mdl-btn ${state.autoSpin ? 'mdl-btn-primary' : ''}" id="r6-spin">🔄 ${isEn ? 'Auto-Spin' : 'Tự xoay'}</button>
        </div>

        <div class="mdl-challenge-box">
          <div class="mdl-section-title" style="margin-top:0;color:#FEF08A;">🎯 ${isEn ? 'Real-World Shape Quiz' : 'Đố vui đồ vật thực tế'}</div>
          ${!state.challenge
            ? `<button class="mdl-btn mdl-btn-warn" style="width:100%;" id="r6-new-ch">${isEn ? 'Start Quiz!' : 'Bắt đầu nhận diện hình!'}</button>`
            : `<div class="mdl-challenge-q">${state.challenge.text}</div>
               <div class="mdl-control-row">
                 <button class="mdl-btn mdl-btn-success" id="r6-check-ch">${isEn ? 'Check Selected Shape' : 'Kiểm tra hình đang chọn'}</button>
                 <button class="mdl-btn" id="r6-new-ch">${isEn ? 'Next' : 'Câu mới'}</button>
               </div>
               ${state.challengeMsg}`}
        </div>
      `;

      ctx.rightHud.innerHTML = `
        <div class="mdl-section-title">🔎 ${isEn ? 'Shape Inspector' : 'Hồ sơ Hình học'}</div>
        <div class="mdl-2d-card">
          <div style="font-family:'Baloo 2',cursive;font-size:1.3rem;font-weight:800;color:#0284C7;text-align:center;">${isEn ? info.en : info.vi}</div>
          <table class="mdl-2d-table" style="margin-top:8px;">
            <tr><th>${isEn ? 'Faces' : 'Số mặt'}</th><th>${isEn ? 'Edges' : 'Số cạnh'}</th><th>${isEn ? 'Vertices' : 'Số đỉnh'}</th></tr>
            <tr><td>${info.faces}</td><td>${info.edges}</td><td>${info.verts}</td></tr>
          </table>
          <div style="margin-top:10px;font-size:0.88rem;color:#334155;font-weight:700;">
            🌍 <strong>${isEn ? 'Examples' : 'Ví dụ thực tế'}:</strong> ${isEn ? info.realEn : info.realVi}
          </div>
        </div>
      `;

      Object.keys(SHAPES_INFO).forEach(k => {
        const b = document.getElementById(`r6-s-${k}`);
        if (b) b.onclick = () => { state.shape = k; state.unfold = 0; ctx.playTone(680); rebuild3D(); };
      });
      const netEl = document.getElementById('r6-net');
      if (netEl) netEl.oninput = (e) => { state.unfold = parseInt(e.target.value) / 100; applyUnfold(state.unfold); };
      document.getElementById('r6-wf').onclick = () => { state.wireframe = !state.wireframe; rebuild3D(); };
      document.getElementById('r6-spin').onclick = () => { state.autoSpin = !state.autoSpin; updateUI(); };

      const newCh = document.getElementById('r6-new-ch');
      if (newCh) newCh.onclick = () => {
        const keys = ['cube', 'cuboid', 'sphere', 'cylinder', 'cone'];
        const pick = keys[Math.floor(Math.random() * keys.length)];
        const inf = SHAPES_INFO[pick];
        state.challenge = {
          ans: pick,
          text: isEn ? `Which 3D shape looks like: <b>${inf.realEn}</b>? Select it above!` : `Đồ vật nào sau đây có dạng hình gì: <b>${inf.realVi}</b>? Hãy chọn hình đúng ở trên!`
        };
        state.challengeMsg = '';
        updateUI();
      };
      const chk = document.getElementById('r6-check-ch');
      if (chk) chk.onclick = () => {
        if (state.shape === state.challenge.ans) {
          ctx.playSuccess();
          state.challengeMsg = `<div class="mdl-feedback-pill ok">🎉 ${isEn ? 'Correct! Great geometry eyes!' : 'Chính xác! Mắt quan sát quá đỉnh!'}</div>`;
        } else {
          ctx.playError();
          state.challengeMsg = `<div class="mdl-feedback-pill err">💡 ${isEn ? 'Try selecting another 3D solid!' : 'Chưa đúng rồi, con chọn khối hình khác thử xem!'}</div>`;
        }
        updateUI();
      };
    };

    rebuild3D();
    return {
      reset: () => { state.shape = 'cube'; state.unfold = 0; state.wireframe = false; state.challenge = null; state.challengeMsg = ''; rebuild3D(); },
      onLangChange: () => updateUI()
    };
  }
};
