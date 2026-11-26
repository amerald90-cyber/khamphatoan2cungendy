/* =========================================================================
   PHÒNG 07: ĐO LƯỜNG VÀ ĐẠI LƯỢNG 3D
   - 4 Trạm thực hành 3D trực tiếp:
     1) Thước đo chiều dài 3D (cm ↔ dm) với bút chì / quyển sách thật
     2) Cân đĩa & Cân điện tử 3D (kg) với độ nghiêng vật lý
     3) Bình đong dung tích 3D (Lít) có mực nước xanh trong suốt dâng lên/hạ xuống
     4) Đồng hồ 3D (Kim + Điện tử 24h) & Lịch tháng
   ========================================================================= */
import { THREE } from './lab-engine.js';

export const Room07Measurement = {
  id: 'room07',
  mount(engine, ctx, initialStation = 'ruler') {
    const state = {
      station: initialStation, // 'ruler' | 'scale' | 'liquid' | 'clock'
      objLen: 12,       // cm (1..20)
      scaleLeft: 3,     // kg
      scaleRight: 1,    // kg
      liters: 4,        // 0..10 L
      clockMin: 510,    // 08:30
      month: 5
    };

    const rebuild3D = () => {
      engine.clearRoom();
      const isEn = ctx.getLang() === 'en';

      // Bright Studio Pedestal
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(14, 0.3, 7),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 })
      );
      base.position.y = 0.15;
      base.receiveShadow = true;
      engine.roomGroup.add(base);

      if (state.station === 'ruler') {
        engine.setCameraPreset([0, 6.2, 10.5], [0, 0.8, 0]);
        // 20cm 3D Wooden Ruler
        const ruler = new THREE.Mesh(
          new THREE.BoxGeometry(10.4, 0.22, 1.3),
          new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.45 })
        );
        ruler.position.set(0, 0.42, 0.9);
        ruler.castShadow = true;
        engine.roomGroup.add(ruler);

        for (let cm = 0; cm <= 20; cm++) {
          const x = -5.0 + cm * 0.5;
          const is5 = cm % 5 === 0;
          const tick = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.05, is5 ? 0.55 : 0.3),
            new THREE.MeshBasicMaterial({ color: 0x0f172a })
          );
          tick.position.set(x, 0.55, 0.55);
          engine.roomGroup.add(tick);
          if (is5) {
            const lbl = engine.createLabelSprite(`${cm}`, '#0F172A', '#FFFFFF', 0.42);
            lbl.position.set(x, 0.95, 1.45);
            engine.roomGroup.add(lbl);
          }
        }

        // 3D Pencil measured along the ruler starting cleanly at 0 cm!
        const pencilLen = state.objLen * 0.5;
        const bodyLen = Math.max(0.4, pencilLen - 0.5);
        const pBody = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.22, bodyLen, 6),
          new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.35 })
        );
        pBody.rotation.z = Math.PI / 2;
        pBody.position.set(-5.0 + bodyLen / 2, 0.62, -0.5);
        pBody.castShadow = true;
        engine.roomGroup.add(pBody);

        const tip = new THREE.Mesh(
          new THREE.ConeGeometry(0.22, 0.5, 12),
          new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 })
        );
        tip.rotation.z = -Math.PI / 2;
        tip.position.set(-5.0 + bodyLen + 0.25, 0.62, -0.5);
        engine.roomGroup.add(tip);

        const endLbl = engine.createLabelSprite(`${state.objLen} cm`, '#0284C7', '#FFFFFF', 0.9);
        endLbl.position.set(-5.0 + pencilLen, 2.0, -0.5);
        engine.roomGroup.add(endLbl);
      } else if (state.station === 'scale') {
        engine.setCameraPreset([0, 6.0, 12.0], [0, 1.8, 0]);
        // 3D Balance Scale Pillar + Tilting Beam
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 3.0, 20), new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.3 }));
        pillar.position.y = 1.7; pillar.castShadow = true;
        engine.roomGroup.add(pillar);

        const diff = state.scaleRight - state.scaleLeft;
        const tilt = Math.max(-0.26, Math.min(0.26, -diff * 0.08));
        const beamGroup = new THREE.Group();
        beamGroup.position.y = 3.1;
        beamGroup.rotation.z = tilt;

        const beam = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.24, 0.36), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.4 }));
        beamGroup.add(beam);

        const mkPan = (x, kg, col) => {
          const pG = new THREE.Group(); pG.position.set(x, -1.2, 0);
          const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2), new THREE.MeshBasicMaterial({ color: 0x94a3b8 }));
          cord.position.y = 0.6; pG.add(cord);
          const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.85, 0.22, 24), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.35 }));
          pG.add(plate);
          for (let i = 0; i < kg; i++) {
            const w = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), new THREE.MeshStandardMaterial({ color: col, roughness: 0.3 }));
            w.position.set((i % 2 === 0 ? -0.32 : 0.32), 0.38 + Math.floor(i / 2) * 0.58, 0);
            w.castShadow = true;
            pG.add(w);
          }
          return pG;
        };
        beamGroup.add(mkPan(-3.2, state.scaleLeft, 0x22c55e));
        beamGroup.add(mkPan(3.2, state.scaleRight, 0x8b5cf6));
        engine.roomGroup.add(beamGroup);

        const sym = state.scaleLeft > state.scaleRight ? '>' : (state.scaleLeft < state.scaleRight ? '<' : '=');
        const sLbl = engine.createLabelSprite(`${state.scaleLeft} kg  ${sym}  ${state.scaleRight} kg`, sym === '=' ? '#16A34A' : '#EA580C', '#FFFFFF', 1.15);
        sLbl.position.set(0, 4.4, 0);
        engine.roomGroup.add(sLbl);
      } else if (state.station === 'liquid') {
        engine.setCameraPreset([0, 5.2, 9.5], [0, 2.0, 0]);
        // Transparent 3D Glass Beaker (10 Liters)
        const beaker = new THREE.Mesh(
          new THREE.CylinderGeometry(1.65, 1.65, 4.4, 32, 1, true),
          new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.32, roughness: 0.1, side: THREE.DoubleSide })
        );
        beaker.position.y = 2.55;
        engine.roomGroup.add(beaker);

        // Rising 3D Liquid Cylinder
        if (state.liters > 0) {
          const lh = (state.liters / 10) * 4.0;
          const liquid = new THREE.Mesh(
            new THREE.CylinderGeometry(1.56, 1.56, lh, 32),
            new THREE.MeshStandardMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.85, roughness: 0.15 })
          );
          liquid.position.y = 0.36 + lh / 2;
          engine.roomGroup.add(liquid);
        }

        for (let lv = 2; lv <= 10; lv += 2) {
          const y = 0.36 + (lv / 10) * 4.0;
          const ring = new THREE.Mesh(new THREE.TorusGeometry(1.67, 0.025, 8, 36), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
          ring.rotation.x = Math.PI / 2; ring.position.y = y;
          engine.roomGroup.add(ring);
          const lbl = engine.createLabelSprite(`${lv} L`, '#0284C7', '#FFFFFF', 0.45);
          lbl.position.set(2.3, y, 0);
          engine.roomGroup.add(lbl);
        }
      } else {
        // 3D Clock Station with Ultra-Crisp 1-12 Numbers & 60 Minute Ticks
        engine.setCameraPreset([0, 4.4, 8.2], [0, 2.5, 0]);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(2.38, 2.38, 0.36, 48), new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.28, metalness: 0.15 }));
        rim.rotation.x = Math.PI / 2; rim.position.y = 2.7; rim.castShadow = true;
        engine.roomGroup.add(rim);

        // Draw high-resolution 512x512 clock dial texture (1..12 + 5-min markers + 60 ticks)
        const dialCvs = document.createElement('canvas');
        dialCvs.width = 512; dialCvs.height = 512;
        const dctx = dialCvs.getContext('2d');
        const cx = 256, cy = 256, R = 246;
        dctx.fillStyle = '#FFFFFF';
        dctx.beginPath(); dctx.arc(cx, cy, R, 0, Math.PI * 2); dctx.fill();
        dctx.lineWidth = 8; dctx.strokeStyle = '#BAE6FD'; dctx.stroke();

        // 60 minute ticks
        for (let i = 0; i < 60; i++) {
          const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
          const is5 = i % 5 === 0;
          const r1 = is5 ? R - 26 : R - 15;
          const r2 = R - 6;
          dctx.beginPath();
          dctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
          dctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
          dctx.strokeStyle = is5 ? '#0F172A' : '#94A3B8';
          dctx.lineWidth = is5 ? 5 : 2.5;
          dctx.stroke();
        }

        // Bold 1..12 hour numbers + subtle orange 5-min labels
        dctx.textAlign = 'center'; dctx.textBaseline = 'middle';
        for (let n = 1; n <= 12; n++) {
          const a = (n / 12) * Math.PI * 2 - Math.PI / 2;
          const nx = cx + Math.cos(a) * 168, ny = cy + Math.sin(a) * 168;
          dctx.font = 'bold 46px "Baloo 2", Arial, sans-serif';
          dctx.fillStyle = (n % 3 === 0) ? '#0284C7' : '#0F172A';
          dctx.fillText(String(n), nx, ny);

          const mx = cx + Math.cos(a) * 208, my = cy + Math.sin(a) * 208;
          dctx.font = 'bold 17px "Nunito", Arial, sans-serif';
          dctx.fillStyle = '#EA580C';
          dctx.fillText(String((n * 5) % 60).padStart(2, '0'), mx, my);
        }

        const dialTex = new THREE.CanvasTexture(dialCvs);
        dialTex.colorSpace = THREE.SRGBColorSpace;
        const dialMesh = new THREE.Mesh(
          new THREE.CircleGeometry(2.14, 48),
          new THREE.MeshBasicMaterial({ map: dialTex, side: THREE.DoubleSide })
        );
        dialMesh.position.set(0, 2.7, 0.22);
        engine.roomGroup.add(dialMesh);

        const h = Math.floor(state.clockMin / 60), m = state.clockMin % 60;
        const mAng = -(m / 60) * Math.PI * 2;
        const hAng = -(((h % 12) + m / 60) / 12) * Math.PI * 2;

        const mPivot = new THREE.Group(); mPivot.position.set(0, 2.7, 0.26); mPivot.rotation.z = mAng;
        const mHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.06), new THREE.MeshStandardMaterial({ color: 0xea580c }));
        mHand.position.y = 0.7; mPivot.add(mHand);
        engine.roomGroup.add(mPivot);

        const hPivot = new THREE.Group(); hPivot.position.set(0, 2.7, 0.31); hPivot.rotation.z = hAng;
        const hHand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.0, 0.06), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
        hHand.position.y = 0.46; hPivot.add(hHand);
        engine.roomGroup.add(hPivot);

        const pin = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), new THREE.MeshStandardMaterial({ color: 0xea580c }));
        pin.position.set(0, 2.7, 0.34);
        engine.roomGroup.add(pin);

        const dig = engine.createLabelSprite(`${String(h).padStart(2, '0')} : ${String(m).padStart(2, '0')}`, '#0F172A', '#38BDF8', 0.95);
        dig.position.set(0, 0.72, 1.2);
        engine.roomGroup.add(dig);
      }

      updateUI();
    };

    const updateUI = () => {
      const isEn = ctx.getLang() === 'en';
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const h = Math.floor(state.clockMin / 60), m = state.clockMin % 60;

      if (state.station === 'ruler') {
        ctx.setFormula(`${state.objLen} cm = ${(state.objLen / 10).toFixed(1)} dm`);
        ctx.setBottomNote(isEn ? 'Slide to change pencil length and read the 3D ruler!' : 'Kéo thanh trượt để thay đổi độ dài bút chì trên thước 3D!');
      } else if (state.station === 'scale') {
        ctx.setFormula(`${state.scaleLeft} kg  vs  ${state.scaleRight} kg`);
        ctx.setBottomNote(isEn ? 'Add/remove 1kg weights to balance the 3D scale!' : 'Thêm/bớt quả cân 1 kg để cân thăng bằng!');
      } else if (state.station === 'liquid') {
        ctx.setFormula(`${state.liters} L / 10 L`);
        ctx.setBottomNote(isEn ? 'Pour water in or out to measure capacity in Liters!' : 'Rót thêm hoặc rót bớt nước để đo dung tích bằng Lít!');
      } else {
        ctx.setFormula(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} • ${isEn ? 'Month' : 'Tháng'} ${state.month} (${daysInMonth[state.month - 1]} ${isEn ? 'days' : 'ngày'})`);
        ctx.setBottomNote(isEn ? 'Adjust clock hands & inspect days in each month!' : 'Chỉnh giờ đồng hồ 3D và xem số ngày trong từng tháng!');
      }

      ctx.leftHud.innerHTML = `
        <div class="mdl-section-title">⚖️ ${isEn ? 'Select 3D Station' : 'Chọn trạm đo lường 3D'}</div>
        <div class="mdl-control-row">
          <button class="mdl-btn ${state.station === 'ruler' ? 'active' : ''}" id="r7-st-ruler">📏 ${isEn ? 'Ruler' : 'Thước đo'}</button>
          <button class="mdl-btn ${state.station === 'scale' ? 'active' : ''}" id="r7-st-scale">⚖️ ${isEn ? 'Scale' : 'Cân kg'}</button>
          <button class="mdl-btn ${state.station === 'liquid' ? 'active' : ''}" id="r7-st-liquid">🧪 ${isEn ? 'Liters' : 'Bình Lít'}</button>
          <button class="mdl-btn ${state.station === 'clock' ? 'active' : ''}" id="r7-st-clock">⏰ ${isEn ? 'Clock' : 'Đồng hồ'}</button>
        </div>

        ${state.station === 'ruler' ? `
          <div class="mdl-section-title">${isEn ? 'Pencil Length' : 'Độ dài bút chì'}: ${state.objLen} cm</div>
          <input type="range" class="mdl-slider" id="r7-len" min="2" max="20" value="${state.objLen}">
        ` : state.station === 'scale' ? `
          <div class="mdl-section-title">${isEn ? 'Left Pan (Green)' : 'Đĩa trái (Xanh lá)'}: ${state.scaleLeft} kg</div>
          <div class="mdl-control-row"><button class="mdl-btn" id="r7-l-sub">−1 kg</button><button class="mdl-btn mdl-btn-success" id="r7-l-add">+1 kg</button></div>
          <div class="mdl-section-title">${isEn ? 'Right Pan (Purple)' : 'Đĩa phải (Tím)'}: ${state.scaleRight} kg</div>
          <div class="mdl-control-row"><button class="mdl-btn" id="r7-r-sub">−1 kg</button><button class="mdl-btn mdl-btn-primary" id="r7-r-add">+1 kg</button></div>
        ` : state.station === 'liquid' ? `
          <div class="mdl-section-title">${isEn ? 'Water Volume' : 'Lượng nước'}: ${state.liters} L</div>
          <div class="mdl-control-row">
            <button class="mdl-btn mdl-btn-warn" id="r7-w-sub">−1 L</button>
            <button class="mdl-btn mdl-btn-primary" id="r7-w-add">+1 L</button>
            <button class="mdl-btn mdl-btn-success" id="r7-w-add2">+2 L</button>
          </div>
        ` : `
          <div class="mdl-section-title">${isEn ? 'Adjust 3D Clock' : 'Chỉnh Đồng hồ 3D'}</div>
          <div class="mdl-control-row">
            <button class="mdl-btn" id="r7-c-h">+1 ${isEn ? 'hr' : 'giờ'}</button>
            <button class="mdl-btn" id="r7-c-30">+30 ${isEn ? 'min' : 'phút'}</button>
            <button class="mdl-btn" id="r7-c-15">+15 ${isEn ? 'min' : 'phút'}</button>
          </div>
          <div class="mdl-section-title">${isEn ? 'Calendar Month' : 'Xem Lịch Tháng'}: ${state.month}</div>
          <input type="range" class="mdl-slider" id="r7-mon" min="1" max="12" value="${state.month}">
        `}
      `;

      ctx.rightHud.innerHTML = `
        <div class="mdl-section-title">📊 ${isEn ? 'Unit Conversion Board (2D)' : 'Bảng Quy đổi Đơn vị (2D)'}</div>
        <div class="mdl-2d-card" style="font-size:0.95rem;font-weight:700;line-height:1.6;">
          <div>📏 1 m = 10 dm = 100 cm</div>
          <div>⚖️ 1 kg = 1000 g</div>
          <div>🧪 ${isEn ? 'Capacity unit: Liter (L)' : 'Đơn vị dung tích: Lít (l)'}</div>
          <div>⏰ 1 ${isEn ? 'day' : 'ngày'} = 24 ${isEn ? 'hours' : 'giờ'} • 1 ${isEn ? 'hour' : 'giờ'} = 60 ${isEn ? 'min' : 'phút'}</div>
        </div>
      `;

      const bind = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
      ['ruler', 'scale', 'liquid', 'clock'].forEach(st => bind(`r7-st-${st}`, () => { state.station = st; ctx.playTone(680); rebuild3D(); }));
      const lenEl = document.getElementById('r7-len'); if (lenEl) lenEl.oninput = (e) => { state.objLen = parseInt(e.target.value); rebuild3D(); };
      bind('r7-l-add', () => { if (state.scaleLeft < 6) { state.scaleLeft++; rebuild3D(); } });
      bind('r7-l-sub', () => { if (state.scaleLeft > 1) { state.scaleLeft--; rebuild3D(); } });
      bind('r7-r-add', () => { if (state.scaleRight < 6) { state.scaleRight++; ctx.playTone(720); rebuild3D(); } });
      bind('r7-r-sub', () => { if (state.scaleRight > 0) { state.scaleRight--; rebuild3D(); } });
      bind('r7-w-add', () => { if (state.liters < 10) { state.liters++; ctx.playTone(740); rebuild3D(); } });
      bind('r7-w-add2', () => { state.liters = Math.min(10, state.liters + 2); ctx.playTone(780); rebuild3D(); });
      bind('r7-w-sub', () => { if (state.liters > 0) { state.liters--; rebuild3D(); } });
      bind('r7-c-h', () => { state.clockMin = (state.clockMin + 60) % 1440; ctx.playTone(700); rebuild3D(); });
      bind('r7-c-30', () => { state.clockMin = (state.clockMin + 30) % 1440; ctx.playTone(700); rebuild3D(); });
      bind('r7-c-15', () => { state.clockMin = (state.clockMin + 15) % 1440; ctx.playTone(700); rebuild3D(); });
      const mEl = document.getElementById('r7-mon'); if (mEl) mEl.oninput = (e) => { state.month = parseInt(e.target.value); updateUI(); };
    };

    rebuild3D();
    return {
      reset: () => { state.station = 'ruler'; state.objLen = 12; state.scaleLeft = 3; state.scaleRight = 1; state.liters = 4; state.clockMin = 510; rebuild3D(); },
      onLangChange: () => updateUI()
    };
  }
};
