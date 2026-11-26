/* =========================================================================
   MATH DISCOVERY LAB — CORE THREE.JS 3D ENGINE
   Real WebGL 3D Scene, Studio Lighting, Soft Shadows, OrbitControls,
   Raycaster Interaction, Quality Scaling, and WebGL Fallback
   ========================================================================= */
import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

export { THREE };

export class Lab3DEngine {
  constructor(containerEl) {
    this.container = containerEl;
    this.quality = 'high'; // 'high' | 'smooth'
    this.webglSupported = this.detectWebGL();
    this.updateCallbacks = [];
    this.clickHandlers = [];
    this.interactiveMeshes = [];
    this.disposed = false;

    if (!this.webglSupported) {
      this.renderFallbackNotice();
      return;
    }

    // Scene with luminous Science Museum gradient sky
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.018);

    const w = containerEl.clientWidth || window.innerWidth;
    const h = containerEl.clientHeight || (window.innerHeight - 62);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 200);
    this.defaultCamPos = new THREE.Vector3(0, 9, 15);
    this.defaultTarget = new THREE.Vector3(0, 1, 0);
    this.camera.position.copy(this.defaultCamPos);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    containerEl.innerHTML = '';
    containerEl.appendChild(this.renderer.domElement);

    // Smooth OrbitControls (360° rotate, zoom, pan — mouse + touch)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 45;
    this.controls.target.copy(this.defaultTarget);

    // Studio Lighting
    this.setupLighting();

    // Root Group for Room Content (easy clean disposal on room switch)
    this.roomGroup = new THREE.Group();
    this.scene.add(this.roomGroup);

    // Subtle Museum Studio Floor + Grid
    this.setupStudioFloor();

    // Raycaster for direct 3D object clicks/taps
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this._pointerDownPos = { x: 0, y: 0 };

    this._onPointerDown = (e) => {
      this._pointerDownPos = { x: e.clientX, y: e.clientY };
    };
    this._onPointerUp = (e) => {
      const dist = Math.hypot(e.clientX - this._pointerDownPos.x, e.clientY - this._pointerDownPos.y);
      if (dist > 6 || this.interactiveMeshes.length === 0) return;
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hits = this.raycaster.intersectObjects(this.interactiveMeshes, true);
      if (hits.length > 0) {
        const hit = hits[0];
        this.clickHandlers.forEach(fn => fn(hit));
      }
    };

    this.renderer.domElement.addEventListener('pointerdown', this._onPointerDown);
    this.renderer.domElement.addEventListener('pointerup', this._onPointerUp);

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);

    this.clock = new THREE.Clock();
    this.animate();
  }

  detectWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) {
      return false;
    }
  }

  renderFallbackNotice() {
    this.container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:32px;text-align:center;color:#F8FAFC;">
        <div style="font-size:4rem;margin-bottom:12px;">🧊</div>
        <h2 style="font-family:'Baloo 2',cursive;font-size:1.8rem;color:#38BDF8;">Thiết bị chưa bật WebGL 3D</h2>
        <p style="max-width:460px;color:#94A3B8;margin-top:8px;">Bạn vẫn có thể sử dụng chế độ biểu diễn Toán học 2D ở bảng bên phải hoặc bật tăng tốc phần cứng trên trình duyệt.</p>
      </div>`;
  }

  setupLighting() {
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.95);
    hemi.position.set(0, 25, 0);
    this.scene.add(hemi);

    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
    this.keyLight.position.set(12, 20, 14);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 1;
    this.keyLight.shadow.camera.far = 60;
    const d = 18;
    this.keyLight.shadow.camera.left = -d;
    this.keyLight.shadow.camera.right = d;
    this.keyLight.shadow.camera.top = d;
    this.keyLight.shadow.camera.bottom = -d;
    this.keyLight.shadow.bias = -0.0005;
    this.scene.add(this.keyLight);

    const rim = new THREE.DirectionalLight(0x38bdf8, 0.55);
    rim.position.set(-14, 10, -12);
    this.scene.add(rim);
  }

  setupStudioFloor() {
    const floorGeo = new THREE.CircleGeometry(38, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x162238,
      roughness: 0.72,
      metalness: 0.15
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(40, 40, 0x38bdf8, 0x1e3a5f);
    grid.position.y = 0;
    grid.material.opacity = 0.28;
    grid.material.transparent = true;
    this.scene.add(grid);
  }

  setCameraPreset(pos, target) {
    if (!this.webglSupported) return;
    this.defaultCamPos.set(pos[0], pos[1], pos[2]);
    this.defaultTarget.set(target[0], target[1], target[2]);
    this.camera.position.copy(this.defaultCamPos);
    this.controls.target.copy(this.defaultTarget);
    this.controls.update();
  }

  resetCamera() {
    if (!this.webglSupported) return;
    this.camera.position.copy(this.defaultCamPos);
    this.controls.target.copy(this.defaultTarget);
    this.controls.update();
  }

  setQuality(mode) {
    this.quality = mode;
    if (!this.webglSupported) return;
    if (mode === 'smooth') {
      this.renderer.setPixelRatio(1);
      this.renderer.shadowMap.enabled = false;
      this.keyLight.castShadow = false;
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.keyLight.castShadow = true;
    }
    this.resize();
  }

  resize() {
    if (!this.webglSupported || this.disposed) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || (window.innerHeight - 62);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  onUpdate(fn) { this.updateCallbacks.push(fn); }
  onClick(fn) { this.clickHandlers.push(fn); }
  registerInteractive(mesh) { this.interactiveMeshes.push(mesh); }

  // Helper: Create crisp AUTO-SIZED CanvasTexture for 3D labels (NEVER clips long Vietnamese text!)
  createLabelSprite(text, bgColor = '#0284C7', textColor = '#FFFFFF', scale = 1.2) {
    const str = String(text);
    const cvs = document.createElement('canvas');
    const tmpCtx = cvs.getContext('2d');
    tmpCtx.font = 'bold 46px "Baloo 2", sans-serif';
    const textW = tmpCtx.measureText(str).width;
    const w = Math.max(220, Math.ceil(textW + 72));
    const h = 112;
    cvs.width = w;
    cvs.height = h;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(10, 14, w - 20, h - 28, 28);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.stroke();
    ctx.fillStyle = textColor;
    ctx.font = 'bold 46px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(str, w / 2, h / 2 + 2);

    const tex = new THREE.CanvasTexture(cvs);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(scale * (w / h), scale, 1);
    return sprite;
  }

  // Helper: Create crisp high-contrast gridded Base-10 texture (clearly shows 10 squares per column)
  createGridTexture(baseHex, lineHex, cells = 10, cols = null) {
    const cvs = document.createElement('canvas');
    cvs.width = 256;
    cvs.height = 256;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 256, 256);
    const numCols = cols || cells;
    const stepX = 256 / numCols;
    const stepY = 256 / cells;
    // Draw subtle highlight inside each cell so kids can count every square
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < numCols; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)';
        ctx.fillRect(c * stepX + 2, r * stepY + 2, stepX - 4, stepY - 4);
      }
    }
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = cells === 10 && numCols === 1 ? 7 : 5;
    for (let i = 0; i <= numCols; i++) {
      ctx.beginPath(); ctx.moveTo(i * stepX, 0); ctx.lineTo(i * stepX, 256); ctx.stroke();
    }
    for (let j = 0; j <= cells; j++) {
      ctx.beginPath(); ctx.moveTo(0, j * stepY); ctx.lineTo(256, j * stepY); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  clearRoom() {
    this.updateCallbacks = [];
    this.clickHandlers = [];
    this.interactiveMeshes = [];
    if (!this.webglSupported) return;
    while (this.roomGroup.children.length > 0) {
      const obj = this.roomGroup.children[0];
      this.roomGroup.remove(obj);
      obj.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
    }
  }

  animate() {
    if (this.disposed) return;
    this._raf = requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.getElapsedTime();
    this.controls.update();
    for (const fn of this.updateCallbacks) fn(dt, elapsed);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this._raf);
    window.removeEventListener('resize', this._onResize);
    if (this.webglSupported) {
      this.renderer.domElement.removeEventListener('pointerdown', this._onPointerDown);
      this.renderer.domElement.removeEventListener('pointerup', this._onPointerUp);
      this.clearRoom();
      this.controls.dispose();
      this.renderer.dispose();
    }
  }
}
