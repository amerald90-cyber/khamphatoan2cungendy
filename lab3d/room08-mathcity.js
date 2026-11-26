/* =========================================================================
   PHÒNG 08: THÀNH PHỐ TOÁN HỌC 3D (MATH CITY 3D WORLD)
   - Bản đồ thành phố 3D sống động với 6 địa điểm tương tác:
     1) 🛒 Siêu thị (Tính tiền, cộng trừ)
     2) 🌳 Công viên (Đếm cây, tính diện tích)
     3) 🚉 Nhà ga (Xem đồng hồ 24h, tính thời gian)
     4) 🏗️ Công trường (Đo chiều dài, đếm vật liệu)
     5) 🍽️ Nhà hàng (Chia đều thức ăn, phép nhân)
     6) 🏘️ Khu dân cư (Nhận biết hình khối 3D)
   - Chạm trực tiếp vào công trình 3D hoặc bấm nút → Camera bay mượt tới địa điểm & mở nhiệm vụ!
   ========================================================================= */
import { THREE } from './lab-engine.js';

const ZONES = [
  { id: 'market', icon: '🛒', pos: [-5.5, 0, -4.0], col: 0xef4444, vi: 'Siêu thị', en: 'Supermarket',
    qGen: (en) => {
      const a = 15 + Math.floor(Math.random() * 15), b = 12 + Math.floor(Math.random() * 15);
      return { ans: a + b, q: en ? `A milk box costs ${a}k and bread costs ${b}k. Total cost (in k)?` : `Hộp sữa giá ${a} nghìn, bánh mì giá ${b} nghìn. Tổng cộng bao nhiêu nghìn đồng?`, hint: `${a} + ${b}` };
    }
  },
  { id: 'park', icon: '🌳', pos: [0, 0, -4.5], col: 0x22c55e, vi: 'Công viên', en: 'Central Park',
    qGen: (en) => {
      const r = 3 + Math.floor(Math.random() * 3), c = 4 + Math.floor(Math.random() * 3);
      return { ans: r * c, q: en ? `A flower garden is ${r} m wide and ${c} m long. What is its Area (m²)?` : `Vườn hoa công viên rộng ${r} m, dài ${c} m. Diện tích vườn hoa là bao nhiêu m²?`, hint: `${r} × ${c}` };
    }
  },
  { id: 'station', icon: '🚉', pos: [5.5, 0, -4.0], col: 0x0ea5e9, vi: 'Nhà ga', en: 'Train Station',
    qGen: (en) => {
      const start = 8 + Math.floor(Math.random() * 5), dur = 2 + Math.floor(Math.random() * 3);
      return { ans: start + dur, q: en ? `Train departs at ${start}:00 and travels for ${dur} hours. Arrival hour?` : `Tàu khởi hành lúc ${start} giờ và đi hết ${dur} giờ. Tàu đến ga lúc mấy giờ?`, hint: `${start} + ${dur}` };
    }
  },
  { id: 'build', icon: '🏗️', pos: [-5.5, 0, 3.8], col: 0xf59e0b, vi: 'Công trường', en: 'Construction Site',
    qGen: (en) => {
      const m = 3 + Math.floor(Math.random() * 6);
      return { ans: m * 10, q: en ? `A steel beam is ${m} meters long. How many decimeters (dm) is that?` : `Thanh thép dài ${m} m. Đổi sang đơn vị đề-xi-mét (dm) là bao nhiêu?`, hint: `1 m = 10 dm` };
    }
  },
  { id: 'food', icon: '🍽️', pos: [0, 0, 4.2], col: 0xec4899, vi: 'Nhà hàng', en: 'Restaurant',
    qGen: (en) => {
      const tables = 3 + Math.floor(Math.random() * 3), per = 2 + Math.floor(Math.random() * 3);
      return { ans: per, q: en ? `Share ${tables * per} pizzas equally among ${tables} tables. Pizzas per table?` : `Chia đều ${tables * per} chiếc bánh cho ${tables} bàn ăn. Mỗi bàn có mấy chiếc bánh?`, hint: `${tables * per} : ${tables}` };
    }
  },
  { id: 'home', icon: '🏘️', pos: [5.5, 0, 3.8], col: 0x8b5cf6, vi: 'Khu dân cư', en: 'Neighborhood',
    qGen: (en) => {
      return { ans: 6, q: en ? `How many flat faces does a cube-shaped house block have?` : `Ngôi nhà hình khối lập phương có tất cả bao nhiêu mặt phẳng?`, hint: `Hình lập phương có 6 mặt vuông` };
    }
  }
];

export const Room08MathCity = {
  id: 'room08',
  mount(engine, ctx) {
    engine.setCameraPreset([0, 14.5, 18.5], [0, 0.5, 0]);

    const state = {
      activeZone: ZONES[0],
      mission: null,
      solvedCount: 0,
      feedback: '',
      camTargetPos: new THREE.Vector3(0, 14.5, 18.5),
      camLookAt: new THREE.Vector3(0, 0.5, 0),
      flyActive: false
    };

    const buildCity = () => {
      engine.clearRoom();
      // Green City Ground + Asphalt Cross Roads
      const grass = new THREE.Mesh(new THREE.BoxGeometry(20, 0.3, 15), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 }));
      grass.position.y = 0.12; grass.receiveShadow = true;
      engine.roomGroup.add(grass);

      const roadH = new THREE.Mesh(new THREE.BoxGeometry(20, 0.34, 2.2), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));
      roadH.position.y = 0.13;
      const roadV = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.34, 15), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 }));
      roadV.position.y = 0.13;
      engine.roomGroup.add(roadH, roadV);

      // Dashed yellow road stripes
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      for (let x = -8.5; x <= 8.5; x += 2.2) {
        if (Math.abs(x) < 1.5) continue;
        const st = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.04, 0.14), stripeMat);
        st.position.set(x, 0.32, 0);
        engine.roomGroup.add(st);
      }

      const isEn = ctx.getLang() === 'en';
      ZONES.forEach(z => {
        const g = new THREE.Group();
        g.position.set(z.pos[0], 0.28, z.pos[2]);

        const bldg = new THREE.Mesh(
          new THREE.BoxGeometry(3.2, z.id === 'park' ? 0.5 : 2.3, 2.8),
          new THREE.MeshStandardMaterial({ color: z.col, roughness: 0.35, metalness: 0.12 })
        );
        bldg.position.y = z.id === 'park' ? 0.25 : 1.15;
        bldg.castShadow = true; bldg.receiveShadow = true;
        bldg.userData = { zoneId: z.id };
        g.add(bldg);
        engine.registerInteractive(bldg);

        if (z.id === 'park') {
          for (let i = -1; i <= 1; i++) {
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.8), new THREE.MeshStandardMaterial({ color: 0x78350f }));
            trunk.position.set(i * 0.9, 0.9, 0);
            const crown = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.3, 12), new THREE.MeshStandardMaterial({ color: 0x4ade80 }));
            crown.position.set(i * 0.9, 1.8, 0); crown.castShadow = true;
            g.add(trunk, crown);
          }
        } else {
          const roof = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.1, 4), new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 }));
          roof.rotation.y = Math.PI / 4;
          roof.position.y = 2.85;
          roof.castShadow = true;
          g.add(roof);
          // Glowing front windows + door
          const winMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.35 });
          [-0.85, 0.85].forEach(wx => {
            const w = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.08), winMat);
            w.position.set(wx, 1.45, 1.42);
            g.add(w);
          });
          const door = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.0, 0.08), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
          door.position.set(0, 0.5, 1.42);
          g.add(door);
        }

        const lbl = engine.createLabelSprite(`${z.icon} ${isEn ? z.en : z.vi}`, '#0F172A', '#FFFFFF', 0.92);
        lbl.position.set(0, 4.15, 0);
        g.add(lbl);
        engine.roomGroup.add(g);
      });

      engine.onClick((hit) => {
        const zid = hit.object?.userData?.zoneId;
        if (zid) selectZone(zid);
      });

      engine.onUpdate(() => {
        if (state.flyActive) {
          engine.camera.position.lerp(state.camTargetPos, 0.08);
          engine.controls.target.lerp(state.camLookAt, 0.1);
          if (engine.camera.position.distanceTo(state.camTargetPos) < 0.25) state.flyActive = false;
        }
      });

      selectZone('market');
    };

    const selectZone = (zid) => {
      const z = ZONES.find(x => x.id === zid) || ZONES[0];
      state.activeZone = z;
      state.mission = z.qGen(ctx.getLang() === 'en');
      state.feedback = '';
      state.camLookAt.set(z.pos[0], 1.2, z.pos[2]);
      state.camTargetPos.set(z.pos[0], 8.2, z.pos[2] + 9.2);
      state.flyActive = true;
      ctx.playTone(700);
      updateUI();
    };

    const updateUI = () => {
      const isEn = ctx.getLang() === 'en';
      const z = state.activeZone;
      ctx.setFormula(`${z.icon} ${isEn ? z.en : z.vi}  •  ⭐ ${state.solvedCount} ${isEn ? 'Solved' : 'Nhiệm vụ hoàn thành'}`);
      ctx.setBottomNote(isEn ? 'Click any 3D building in Math City to fly there and solve real-world math!' : 'Chạm trực tiếp vào bất kỳ tòa nhà 3D nào trong thành phố để bay tới giải toán thực tế!');

      ctx.leftHud.innerHTML = `
        <div class="mdl-section-title">🌆 ${isEn ? 'Fly to 6 City Zones' : 'Bay tới 6 Khu vực Thành phố'}</div>
        <div class="mdl-control-row">
          ${ZONES.map(item =>
            `<button class="mdl-btn ${state.activeZone.id === item.id ? 'active' : ''}" id="r8-z-${item.id}" style="font-size:0.82rem;">${item.icon} ${isEn ? item.en : item.vi}</button>`
          ).join('')}
        </div>
        <button class="mdl-btn mdl-btn-primary" style="width:100%;margin-top:6px;" id="r8-overview">🚁 ${isEn ? 'City Overview Camera' : 'Góc nhìn toàn Thành phố'}</button>
      `;

      ctx.rightHud.innerHTML = `
        <div class="mdl-section-title">${z.icon} ${isEn ? 'Real-World Mission' : 'Nhiệm vụ thực tế tại'} ${isEn ? z.en : z.vi}</div>
        <div class="mdl-2d-card">
          <div style="font-family:'Baloo 2',cursive;font-size:1.1rem;font-weight:800;color:#0F172A;line-height:1.4;">${state.mission.q}</div>
          <div style="margin-top:8px;font-size:0.86rem;color:#0284C7;font-weight:700;">💡 ${isEn ? 'Hint' : 'Gợi ý'}: ${state.mission.hint}</div>
          <div class="mdl-control-row" style="margin-top:10px;">
            <input type="number" class="mdl-input" id="r8-ans" placeholder="?" style="width:90px;">
            <button class="mdl-btn mdl-btn-success" id="r8-check">${isEn ? 'Submit' : 'Trả lời'}</button>
            <button class="mdl-btn" id="r8-next">${isEn ? 'New' : 'Đề khác'}</button>
          </div>
          ${state.feedback}
        </div>
      `;

      ZONES.forEach(item => {
        const b = document.getElementById(`r8-z-${item.id}`);
        if (b) b.onclick = () => selectZone(item.id);
      });
      document.getElementById('r8-overview').onclick = () => {
        state.camTargetPos.set(0, 14.5, 18.5);
        state.camLookAt.set(0, 0.5, 0);
        state.flyActive = true;
      };
      document.getElementById('r8-next').onclick = () => selectZone(state.activeZone.id);
      document.getElementById('r8-check').onclick = () => {
        const v = parseInt(document.getElementById('r8-ans').value);
        if (v === state.mission.ans) {
          state.solvedCount++;
          ctx.playSuccess();
          state.feedback = `<div class="mdl-feedback-pill ok">🎉 ${isEn ? 'Mission Accomplished! +1 Star!' : 'Xuất sắc! Hoàn thành nhiệm vụ!'}</div>`;
        } else {
          ctx.playError();
          state.feedback = `<div class="mdl-feedback-pill err">💡 ${isEn ? 'Not quite, check the hint and try again!' : 'Chưa đúng rồi, con xem gợi ý rồi tính lại nhé!'}</div>`;
        }
        updateUI();
      };
    };

    buildCity();
    return {
      reset: () => { state.solvedCount = 0; buildCity(); },
      onLangChange: () => buildCity()
    };
  }
};
