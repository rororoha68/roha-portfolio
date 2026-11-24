// ════════════════════════════════════════════════════════════════════
//  Spine 월페이퍼 템플릿 (Wallpaper Engine / 브라우저 공용)
//  ▸ 새 월페이퍼를 만들 땐 [1. 설정] 구역만 고치면 됩니다.
//  ▸ project.json 은 브라우저 테스트 패널의 [project.json 저장] 버튼으로 생성합니다. (python serve.py 로 열었을 때 파일에 바로 저장됨)
// ════════════════════════════════════════════════════════════════════

// ───────────────── 1. 설정 (여기만 수정) ─────────────────
const PROJECT = {
  title: 'nerjimaseyo',          // project.json 의 title
  preview: 'preview.png',         // 미리보기 이미지 파일명
  storeKey: 'nerjimaseyo_panel', // 브라우저 테스트 패널 값 저장 키 (월페이퍼마다 다르게)
};

// 캐릭터 목록. 키 이름이 곧 슬라이더 이름(<이름>_x 등)이 됩니다. 오른쪽에 쓸수록 앞(위)에 그려지는 기본 순서.
//   path        assets 폴더 안 파일 경로(확장자 제외). <path>.skel / <path>.atlas / 텍스처 png 필요
//   label       패널/속성에 표시할 이름 (생략하면 키 이름)
//   x, y        기본 배치 위치(월드 좌표). y 생략 시 -250
//   scale       기본 크기 배율. 생략 시 BASE_SCALE
//   abilities   'pat'(쓰다듬기: 클릭 없이 머리 위에서 마우스 흔들기) 'hit'(클릭 때리기) 'cheek'(볼 당기기) 'drag'(머리를 클릭한 채 드래그: 본은 안 움직이고 모션만 재생)
//   cheekBone   볼 본 이름 (cheek 능력에 필요)
//   defaults    슬라이더 기본값 { x, y, s, layer } (project.json 기본값과 같게 내보내짐). layer 생략 시 목록 순서
//   anim        이 캐릭터만 쓸 애니메이션 이름 덮어쓰기. 예: { dragLoop: 'drag_idle', dragEnd: 'drag_end' } (생략하면 아래 ANIM 값)
//   outline, shadow  false 로 두면 이 캐릭터에만 외곽선 / 벽 그림자를 적용하지 않음 (생략하면 적용)
const CHARACTERS = {
  // 머리를 클릭한 채 드래그하면 ner_idle 이 반복 재생되고, 놓으면 ner_end 가 1회 재생됨 (본은 움직이지 않음, 아래 ANIM)
  // 클릭하지 않고 머리 위에서 마우스를 흔들면 쓰다듬기(pet_idle / pet_end)
  // 캐릭터 이름(charA)과 path 는 실제 캐릭터에 맞게 바꿀 것
  nerjimaseyo: { path: 'assets/nerjimaseyo', label: 'nerjimaseyo', x: 0, abilities: ['pat', 'hit', 'drag', 'cheek'], cheekBone: 'cheek', defaults: { x: 0, y: 0, s: 1 } },
};

// 배경/프레임 이미지 (파일이 없으면 조용히 건너뜀)
// fit: 'cover' = 화면을 꽉 채움 / 'contain' = 전체가 보이게 / 'stretch' = 비율 무시하고 늘림
const IMAGES = {
  bg:    { src: 'assets/bg.png',    fit: 'cover',   label: '배경' },   // 영상이 안 될 때 쓰는 정지 이미지
  frame: { src: 'assets/frame.png', fit: 'stretch', label: '프레임' },
};

// 배경 영상 (webm 권장). 이 파일이 있으면 IMAGES.bg 이미지 대신 영상이 배경으로 반복 재생됨.
//   파일이 없거나 재생에 실패하면 자동으로 IMAGES.bg 이미지로 돌아감. 영상을 쓰지 않으려면 '' 로 둠.
//   권장: WebM(VP9) / 1920×1080 이하 / 15~30fps / 소리 없음.  ※ Wallpaper Engine 내장 브라우저는 mp4(H.264)를 못 읽는 경우가 있어 webm 을 씀
//   배치(cover/contain/stretch)는 IMAGES.bg 의 fit 을 그대로 따름.
const BG_VIDEO = 'assets/bg.webm';

// 효과: 스파인 모델 외곽선 + 배경(벽)에 비치는 그림자. 키 이름이 곧 Wallpaper Engine 속성 이름.
//   bool / slider(range: [최소, 최대, 간격]) / color('r g b', 각 0~1) 형식.
//   거리/두께 단위는 월드 좌표(기준 화면 1080px 높이 기준 약 1px). 처음부터 끄려면 outline_on / shadow_on 의 value 를 false 로.
//   벽 그림자: 모든 캐릭터의 실루엣을 하나로 합쳐 '배경 바로 위, 캐릭터 뒤'에 그림 (바닥 그림자 아님)
//             shadow_x / shadow_y 는 그림자가 벽에서 떨어져 보이는 방향 (y 는 아래가 마이너스)
const FX = {
  outline_on:    { type: 'bool',   text: '외곽선 표시',          value: true },
  outline_width: { type: 'slider', text: '외곽선 두께',          value: 3,    range: [0, 12, 0.5],     fraction: true },
  outline_color: { type: 'color',  text: '외곽선 색',            value: '1 1 1' },
  shadow_on:     { type: 'bool',   text: '벽 그림자 표시',       value: true },
  shadow_alpha:  { type: 'slider', text: '벽 그림자 진하기',     value: 0.35, range: [0, 1, 0.05],     fraction: true },
  shadow_blur:   { type: 'slider', text: '벽 그림자 번짐',       value: 12,   range: [0, 40, 1] },
  shadow_x:      { type: 'slider', text: '벽 그림자 가로 거리',  value: 40,   range: [-300, 300, 5] },
  shadow_y:      { type: 'slider', text: '벽 그림자 세로 거리',  value: -25,  range: [-300, 300, 5] },
  shadow_color:  { type: 'color',  text: '벽 그림자 색',         value: '0 0 0' },
  effect_heart_on: { type: 'bool', text: '쓰다듬기 하트 이펙트',  value: true },
  effect_star_on:  { type: 'bool', text: '때리기 별 이펙트',      value: true },
};

// 기준 화면. 캐릭터 위치를 맞출 때 쓴 화면 비율(가로/세로)로 설정.
// 어떤 화면에서도 이 기준 영역 '안쪽'만 보이므로, 기준 화면에서 안 보이던(안 그린) 부분은 다른 비율에서도 안 보임.
// (기준보다 가로로 넓은 화면은 위아래가 조금 잘리고, 세로로 긴 화면은 좌우가 조금 잘림)
const DESIGN_HEIGHT = 1080;
const DESIGN_ASPECT = 16 / 9;     // 예: 브라우저 창에서 맞췄다면 그 창의 가로/세로 값 (1912 / 1265 등)
const BASE_SCALE    = 0.45;       // 기본 캐릭터 크기

// 스파인 파일 안의 이름 규칙 (본/애니메이션/바운딩박스)
const ANIM = { idle: 'idle', patLoop: 'pet_idle', patEnd: 'pet_end', hit: 'hit', hitEnd: 'hit_end', pullLoop: 'pull_idle', pullEnd: 'pull_end',
               dragLoop: 'ner_idle', dragEnd: 'ner_end' };   // 머리 드래그 중 반복 / 놓았을 때 1회 (캐릭터별로 다르게 하려면 CHARACTERS 의 anim 으로 덮어씀)
// atama(시선/패럴랙스 컨트롤러 본)를 마우스 방향으로 움직임 → atama-to-head/face/fronthair/backhair 트랜스폼 제약이 이 값을 받아 따라감
//   (atama 본은 애니메이션에 키가 없어서, 코드가 움직여주지 않으면 제약이 영원히 정지 상태임)
const LOOK = { enabled: true, bone: 'atama', rangeX: 150, rangeY: 100, follow: 8,
               lockMix: true };   // true: 애니메이션(pet_idle 등)이 트랜스폼 제약의 mix 값을 덮어써도 매 프레임 기본값으로 되돌려 제약이 항상 먹게 함   // range: 월드 단위 최대 이동량, follow: 추종 속도
const BOX  = { head: 'head', cheek: 'cheek' };      // 바운딩박스 이름에 이 글자가 들어가면 해당 부위로 판정
// 반응 모션(쓰다듬기/때리기/볼 당기기/드래그)은 모두 같은 트랙 1 에서 재생 → 한 번에 하나만 재생되고, 바뀔 때 부드럽게 전환됨 (0: idle)
const TRACK = { PET: 1, HIT: 1, PULL: 1, DRAG: 1 };
const MIX_IN     = 0.35;  // 초: idle → 모션 으로 들어갈 때 페이드 인 시간
const MIX_SWITCH = 0.35;  // 초: 모션 → 모션 (반복→끝 모션, 쓰다듬기→드래그 등) 전환 시간
const MIX_OUT    = 0.35;  // 초: 모션이 끝나고 idle 로 돌아갈 때 페이드 아웃 시간
const MIX_OUT_OVERLAP = 0; // 초: 끝 모션이 끝나기 이만큼 전부터 idle 복귀를 시작 (0 = 끝 모션을 끝까지 보여준 뒤 복귀, 크면 더 일찍/겹쳐서)

// 튜닝값
const PAT_MOVE_THRESHOLD = 12;   // px: 이 이상 움직이면 쓰다듬기/드래그로 인식
const PAT_STOP_MS        = 250;  // 마우스가 이 시간(ms) 멈추면 쓰다듬기 종료
const CLICK_MAX_MS       = 300;  // 이 시간 안에 떼면 클릭(때리기)
const PULL_MAX_WORLD     = 120;  // 볼이 늘어나는 최대 거리 (월드 단위)
const PULL_FOLLOW        = 20;   // 볼 드래그 중 마우스 추종 속도
const SPRING_K           = 400;  // 볼 스프링 강도 (클수록 빠르게 복귀)
const SPRING_C           = 12;   // 볼 스프링 감쇠 (작을수록 많이 튕김)
// 머리 위 동작 구분: 클릭한 채 움직이면 '드래그'(PAT_MOVE_THRESHOLD 이상 움직이면 시작),
//                    클릭 없이 머리 위에서 마우스를 흔들면 '쓰다듬기'
const GESTURE_STEP     = 8;    // px: 쓰다듬기 판정 시 이보다 작은 움직임은 무시 (손 떨림)
const PAT_HOVER_PAD    = 600;  // 월드 단위: 쓰다듬기가 '발동된 동안'에만 머리 판정 영역을 이만큼 바깥으로 넓힘 (0 = 넓히지 않음). 시작/클릭/드래그 판정은 원래 크기 그대로
const SHAKE_REVERSALS  = 2;    // 쓰다듬기: 방향이 이 횟수만큼 뒤집히면 시작 (좌→우→좌 = 2번). 1이면 더 쉽게, 크면 더 확실히 흔들어야 함
const DEBUG_HIT          = true;  // true: 브라우저 테스트에서 클릭 판정 영역(머리=하늘색, 볼=노란색)과 클릭 로그 표시

// 슬라이더 범위 (project.json 내보내기와 테스트 패널에 사용)
const RANGE = { x: [-800, 800, 5], y: [-600, 600, 5], s: [0.3, 2, 0.05], scale: [0.3, 2, 0.05], layer: [0, 10, 1], alpha: [0, 1, 0.05] };

// ───────────────── 2. 설정에서 파생되는 값 (수정 불필요) ─────────────────
const DESIGN_WIDTH = DESIGN_HEIGHT * DESIGN_ASPECT;
const CHAR_KEYS  = Object.keys(CHARACTERS);
const LAYER_KEYS = ['bg', ...CHAR_KEYS, 'frame'];   // 기본 레이어 순서 (뒤 → 앞)
const labelOf = (k) => (CHARACTERS[k] && CHARACTERS[k].label) || (IMAGES[k] && IMAGES[k].label) || k;

// 모든 속성의 기본값 (project.json 의 기본값과 같은 이름)
function defaultValues() {
  const v = {};
  LAYER_KEYS.forEach((k, i) => {
    const d = (CHARACTERS[k] && CHARACTERS[k].defaults) || {};
    v['show_' + k] = true;
    v['layer_' + k] = d.layer ?? i;          // 기본 레이어 순서 (생략하면 목록 순서)
  });
  v.bg_alpha = 1; v.frame_alpha = 1; v.scale = 1;
  v.bg_video = '';                                   // 직접 고른 배경 영상 경로 (비어 있으면 BG_VIDEO)
  for (const k of Object.keys(FX)) v[k] = FX[k].value;
  for (const n of CHAR_KEYS) {
    const d = CHARACTERS[n].defaults || {};
    v[n + '_x'] = d.x ?? 0; v[n + '_y'] = d.y ?? 0; v[n + '_s'] = d.s ?? 1;
  }
  return v;
}

// Wallpaper Engine 용 project.json 내용 생성 (values: 속성 이름 → 값. 생략하면 기본값)
function buildProjectJson(values) {
  values = Object.assign(defaultValues(), values || {});
  const props = {};
  let order = 1;
  const bool   = (key, text)        => { props[key] = { order: order++, text, type: 'bool', value: values[key] }; };
  const slider = (key, text, r, fr) => {
    props[key] = Object.assign({ order: order++, text, type: 'slider', min: r[0], max: r[1], step: r[2], value: values[key] }, fr ? { fraction: true } : {});
  };
  const color  = (key, text)        => { props[key] = { order: order++, text, type: 'color', value: values[key] }; };
  const file   = (key, text, kind)  => { props[key] = { order: order++, text, type: 'file', fileType: kind, value: values[key] }; };
  for (const k of LAYER_KEYS) bool('show_' + k, labelOf(k) + ' 표시');
  slider('scale', '전체 크기', RANGE.scale, true);
  slider('bg_alpha', labelOf('bg') + ' 투명도', RANGE.alpha, true);
  slider('frame_alpha', labelOf('frame') + ' 투명도', RANGE.alpha, true);
  file('bg_video', labelOf('bg') + ' 영상 직접 선택 (webm, 선택사항)', 'video');
  for (const k of LAYER_KEYS) slider('layer_' + k, labelOf(k) + ' 레이어 순서 (작을수록 뒤)', RANGE.layer, false);
  for (const n of CHAR_KEYS) {
    slider(n + '_x', labelOf(n) + ' 가로 위치', RANGE.x, false);
    slider(n + '_y', labelOf(n) + ' 세로 위치', RANGE.y, false);
    slider(n + '_s', labelOf(n) + ' 크기', RANGE.s, true);
  }
  for (const [k, f] of Object.entries(FX)) {
    if (f.type === 'bool') bool(k, f.text);
    else if (f.type === 'color') color(k, f.text);
    else slider(k, f.text, f.range, f.fraction);
  }
  return { title: PROJECT.title, type: 'web', file: 'index.html', preview: PROJECT.preview, general: { properties: props } };
}
// ═══ END_PURE (여기까지는 브라우저 없이도 실행 가능: project.json 생성 스크립트가 이 위쪽만 사용) ═══

// ───────────────── 3. 디버그 표시: 브라우저 테스트에서만 보임 ─────────────────
const isBrowserTest = () => !window.__weActive;
function hideDebugUI() {
  for (const id of ['dbg', 'hitlog', 'status']) document.getElementById(id)?.remove();
}
function showError(msg) {
  if (!isBrowserTest()) return;
  let el = document.getElementById('dbg');
  if (!el) {
    el = document.createElement('pre');
    el.id = 'dbg';
    el.style.cssText = 'position:fixed;left:8px;top:8px;right:8px;margin:0;color:#ff7a7a;' +
      'font:16px monospace;white-space:pre-wrap;z-index:9;background:rgba(0,0,0,.6);padding:8px';
    document.body.appendChild(el);
  }
  el.textContent += msg + '\n';
}
window.addEventListener('error', (e) => showError('ERROR: ' + e.message + ' (' + (e.filename || '').split('/').slice(-2).join('/') + ':' + e.lineno + ')'));
window.addEventListener('unhandledrejection', (e) => showError('PROMISE: ' + e.reason));
if (typeof spine === 'undefined') showError('spine 라이브러리 없음 (lib/spine-webgl.js 경로 확인)');

// ───────────────── 4. 현재 설정값 ─────────────────
// 'r g b'(Wallpaper Engine 색 속성) → [r, g, b] (0~1)
function parseColor(v) {
  const a = String(v).trim().split(/\s+/).map(Number);
  return [0, 1, 2].map((i) => (Number.isFinite(a[i]) ? Math.min(1, Math.max(0, a[i])) : 0));
}
// 효과 속성 값을 종류에 맞게 변환
function fxValue(key, v) {
  const t = FX[key].type;
  if (t === 'bool')  return v !== false;
  if (t === 'color') return parseColor(v);
  const n = Number(v);
  return Number.isFinite(n) ? n : FX[key].value;
}

const DEFAULTS = defaultValues();
const settings = {
  visible: {}, alpha: { bg: DEFAULTS.bg_alpha, frame: DEFAULTS.frame_alpha }, layer: {},
  scale: DEFAULTS.scale,
  adj: {},     // 캐릭터별 조절값 (x, y 이동 / s 크기 배율)
  fx: {},      // 외곽선 / 벽 그림자 설정
};
for (const k of LAYER_KEYS) { settings.visible[k] = DEFAULTS['show_' + k]; settings.layer[k] = DEFAULTS['layer_' + k]; }
for (const n of CHAR_KEYS) settings.adj[n] = { x: DEFAULTS[n + '_x'], y: DEFAULTS[n + '_y'], s: DEFAULTS[n + '_s'] };
for (const k of Object.keys(FX)) settings.fx[k] = fxValue(k, DEFAULTS[k]);

// 속성 이름(show_xxx, layer_xxx, xxx_alpha, scale, <캐릭터>_x/_y/_s, 효과 속성, bg_video)과 값을 받아 settings 에 반영
// (Wallpaper Engine 속성 연동과 브라우저 테스트 패널이 공용으로 사용)
function applyProp(key, v) {
  if (key in FX)        { settings.fx[key] = fxValue(key, v); return; }   // 외곽선 / 벽 그림자
  if (key === 'bg_video') { onBgVideoProp(v); return; }                  // 직접 고른 배경 영상
  let m;
  if ((m = key.match(/^show_(.+)$/)) && m[1] in settings.visible)        settings.visible[m[1]] = v !== false;
  else if ((m = key.match(/^layer_(.+)$/)) && m[1] in settings.layer)    settings.layer[m[1]]   = Number(v) || 0;
  else if ((m = key.match(/^(.+)_alpha$/)) && m[1] in settings.alpha)    settings.alpha[m[1]]   = Number(v);
  else if (key === 'scale')                                              settings.scale         = Number(v) || 1;
  else if ((m = key.match(/^(.+)_([xys])$/)) && settings.adj[m[1]])      settings.adj[m[1]][m[2]] = Number(v) || (m[2] === 's' ? 1 : 0);
}

// ───────────────── 5. 초기화 ─────────────────
const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl', { alpha: false, premultipliedAlpha: true });
const renderer = new spine.SceneRenderer(canvas, gl);
const assets = new spine.AssetManager(gl);

for (const c of Object.values(CHARACTERS)) {
  assets.loadBinary(c.path + '.skel');
  assets.loadTextureAtlas(c.path + '.atlas');
}

const chars = {};

// 배경/프레임 로드 (없으면 imgs[key]가 비어 있어 그리지 않음)
const imgs = {};
for (const [key, cfg] of Object.entries(IMAGES)) {
  const im = new Image();
  im.onload = () => { imgs[key] = { tex: new spine.GLTexture(renderer.context, im, false), w: im.width, h: im.height, fit: cfg.fit }; };
  im.onerror = () => console.warn('이미지 없음(건너뜀): ' + cfg.src);
  im.src = cfg.src;
}

// 현재 레이어 순서 (뒤 → 앞)
function layerOrder() {
  return LAYER_KEYS.map((k, i) => ({ k, i }))
    .sort((a, b) => (settings.layer[a.k] - settings.layer[b.k]) || (a.i - b.i))
    .map((o) => o.k);
}

// 화면 고정 이미지 그리기 (카메라 확대/축소의 영향을 받지 않음)
function layerImage(key) { return (key === 'bg' && bgv.ready) ? bgv.entry : imgs[key]; }   // 배경은 영상이 준비되면 영상 우선
function drawImageLayer(key, viewW, viewH) {
  const im = layerImage(key);
  if (!im) return;
  let w = viewW, h = viewH;
  if (im.fit !== 'stretch') {
    const s = im.fit === 'contain' ? Math.min(viewW / im.w, viewH / im.h) : Math.max(viewW / im.w, viewH / im.h);
    w = im.w * s; h = im.h * s;
  }
  const a = settings.alpha[key];
  renderer.batcher.setBlendMode(0);                                // 일반 블렌드로 고정
  renderer.drawTexture(im.tex, -w / 2, -h / 2, w, h, new spine.Color(a, a, a, a));   // 프리멀티플라이드 알파
}

// 렌더러 begin/end 상태 추적 (효과 패스에서 오프스크린으로 잠시 나갔다 돌아올 때 사용)
let rActive = false;
const rBegin = () => { renderer.begin(); rActive = true; };
const rEnd   = () => { renderer.end();   rActive = false; };

// ───────────────── 배경 영상 (webm) ─────────────────
// <video> 의 현재 프레임을 매 프레임 WebGL 텍스처로 올려서 배경 이미지처럼 그림.
const bgv = { el: null, entry: null, ready: false, src: '', fallback: '', newFrame: false, hasRVFC: false, lastTime: -1, lastPlayTry: 0 };

function stopBgVideo() {
  const s = bgv;
  if (s.el) { try { s.el.pause(); s.el.removeAttribute('src'); s.el.load(); s.el.remove(); } catch (e) {} }
  if (s.entry && s.entry.tex) { try { s.entry.tex.dispose(); } catch (e) {} }
  s.el = null; s.entry = null; s.ready = false;
}

function bgVideoFail(why) {
  console.warn('배경 영상 사용 안 함(' + bgv.src + '): ' + why);
  const fb = bgv.fallback;
  stopBgVideo();
  if (fb) startBgVideo(fb, '');          // 직접 고른 파일이 실패하면 기본 영상으로, 그것도 안 되면 배경 이미지로
}

function startBgVideo(src, fallbackSrc) {
  stopBgVideo();
  bgv.fallback = fallbackSrc || '';
  if (!src) return;
  const v = document.createElement('video');
  v.muted = true; v.defaultMuted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.preload = 'auto';
  v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
  v.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none;z-index:-1';
  bgv.el = v; bgv.src = src;

  v.addEventListener('loadeddata', () => {
    if (bgv.el !== v || bgv.ready) return;
    try {
      const tex = new spine.GLTexture(renderer.context, v, false);
      bgv.entry = { tex, w: v.videoWidth, h: v.videoHeight, fit: IMAGES.bg ? IMAGES.bg.fit : 'cover' };
      bgv.ready = true; bgv.newFrame = true;
    } catch (e) { bgVideoFail('텍스처 생성 실패: ' + e.message); }
  });
  v.addEventListener('error', () => { if (bgv.el === v) bgVideoFail('로드/재생 실패'); });

  bgv.hasRVFC = typeof v.requestVideoFrameCallback === 'function';
  if (bgv.hasRVFC) {                      // 새 프레임이 있을 때만 텍스처를 갱신 (영상 fps 가 화면 fps 보다 낮아도 낭비 없음)
    const cb = () => { if (bgv.el !== v) return; bgv.newFrame = true; v.requestVideoFrameCallback(cb); };
    v.requestVideoFrameCallback(cb);
  }
  document.body.appendChild(v);
  v.src = src;
  const p = v.play(); if (p && p.catch) p.catch(() => {});
}

// 속성 bg_video(직접 고른 파일) 처리. 비어 있으면 BG_VIDEO 사용
let bgVideoRequested = false;
function onBgVideoProp(v) {
  bgVideoRequested = true;
  let src = String(v || '').trim();
  if (!src || /(^|[\\/])assets[\\/]bg\.mp4$/i.test(src)) { startBgVideo(BG_VIDEO, ''); return; }   // 비어 있거나 예전 기본값(assets/bg.mp4)이면 기본 webm
  if (!/^(file|https?|blob):/i.test(src) && !/^assets\//i.test(src)) src = encodeURI('file:///' + src.replace(/\\/g, '/').replace(/^\/+/, ''));   // assets/ 로 시작하는 건 폴더 안 상대경로 (패널 저장으로 생긴 파일)
  startBgVideo(src, BG_VIDEO);
}
setTimeout(() => { if (!bgVideoRequested) startBgVideo(BG_VIDEO, ''); }, 300);   // Wallpaper Engine 속성이 안 오면(브라우저 테스트) 기본 영상 시작

// 매 프레임: 영상의 새 프레임을 텍스처로 업로드 (그리기 시작 전에 호출)
function updateBgVideo(now) {
  const s = bgv;
  if (!s.ready || !settings.visible.bg) return;
  const v = s.el;
  if (v.paused && now - s.lastPlayTry > 1000) { s.lastPlayTry = now; const p = v.play(); if (p && p.catch) p.catch(() => {}); }
  if (v.readyState < 2) return;
  const fresh = s.hasRVFC ? s.newFrame : v.currentTime !== s.lastTime;
  if (!fresh) return;
  s.newFrame = false; s.lastTime = v.currentTime;
  const prevActive = gl.getParameter(gl.ACTIVE_TEXTURE);
  gl.activeTexture(gl.TEXTURE0);
  const prevTex = gl.getParameter(gl.TEXTURE_BINDING_2D);
  try {
    s.entry.tex.update(false);            // GLTexture 가 가진 이미지(=video) 의 현재 프레임을 다시 올림
    s.entry.w = v.videoWidth; s.entry.h = v.videoHeight;
  } catch (e) {
    gl.bindTexture(gl.TEXTURE_2D, prevTex); gl.activeTexture(prevActive);
    bgVideoFail('프레임 업로드 실패: ' + e.message);
    return;
  }
  gl.bindTexture(gl.TEXTURE_2D, prevTex); gl.activeTexture(prevActive);
}

// ───────────────── 효과: 외곽선 / 벽 그림자 ─────────────────
// 방법: 캐릭터를 투명한 오프스크린 텍스처(마스크)에 그린 뒤, 셰이더로
//   - 외곽선: 실루엣을 바깥으로 넓혀 색을 칠함 → 그 위에 캐릭터 본체를 그림
//   - 벽 그림자: 실루엣을 (shadow_x, shadow_y) 만큼 옮기고 흐리게 해서 배경 바로 위에 칠함
// 캐릭터 본체는 항상 원래대로 화면에 직접 그려서, 효과를 꺼도 켜도 본체 화질은 같음.
const FX_ATTR = 7;   // Spine 셰이더가 쓰는 속성 번호(0~3)와 겹치지 않게
const FX_VS = 'attribute vec2 a_pos; varying vec2 v_uv; void main(){ v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }';
const FX_HEAD = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';
const FX_FS = {
  outline: FX_HEAD + `
    uniform sampler2D u_tex; uniform vec2 u_r; uniform vec4 u_color; varying vec2 v_uv;
    void main() {
      float m = texture2D(u_tex, v_uv).a;
      for (int i = 0; i < 24; i++) {
        float ang = float(i) * 0.2617994;
        vec2 d = vec2(cos(ang), sin(ang)) * u_r;
        m = max(m, texture2D(u_tex, v_uv + d * 0.34).a);
        m = max(m, texture2D(u_tex, v_uv + d * 0.67).a * 0.92);
        m = max(m, texture2D(u_tex, v_uv + d).a * 0.6);
      }
      float o = smoothstep(0.0, 0.3, m) * u_color.a;
      gl_FragColor = vec4(u_color.rgb * o, o);
    }`,
  shadow: FX_HEAD + `
    uniform sampler2D u_tex; uniform vec2 u_off; uniform vec2 u_blur; uniform vec4 u_color; varying vec2 v_uv;
    void main() {
      vec2 uv = v_uv - u_off;
      float a = 0.0;
      if (u_blur.x < 0.00001) {
        a = texture2D(u_tex, uv).a;
      } else {
        for (int i = 0; i < 32; i++) {
          float fi = float(i);
          float rr = sqrt((fi + 0.5) / 32.0);
          float ang = fi * 2.3999632;
          a += texture2D(u_tex, uv + vec2(cos(ang), sin(ang)) * rr * u_blur).a;
        }
        a /= 32.0;
      }
      float o = a * u_color.a;
      gl_FragColor = vec4(u_color.rgb * o, o);
    }`,
};
const fxGl = { ready: false, failed: false, w: 0, h: 0, tex: null, fbo: null, buf: null, prog: {} };

function fxFail(e) {
  fxGl.failed = true;
  try { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); } catch (_) {}
  showError('외곽선/그림자 효과 실패(효과만 꺼짐): ' + (e && e.message ? e.message : e));
  console.warn(e);
  if (!rActive) rBegin();
}

function fxCompile(type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src); gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error('셰이더 컴파일 실패: ' + gl.getShaderInfoLog(sh));
  return sh;
}
function fxProgram(fsSrc, uniforms) {
  const p = gl.createProgram();
  gl.attachShader(p, fxCompile(gl.VERTEX_SHADER, FX_VS));
  gl.attachShader(p, fxCompile(gl.FRAGMENT_SHADER, fsSrc));
  gl.bindAttribLocation(p, FX_ATTR, 'a_pos');
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('셰이더 링크 실패: ' + gl.getProgramInfoLog(p));
  const u = { p };
  for (const n of uniforms) u[n] = gl.getUniformLocation(p, n);
  return u;
}
function fxInit() {
  if (fxGl.ready) return true;
  if (fxGl.failed) return false;
  try {
    fxGl.prog.outline = fxProgram(FX_FS.outline, ['u_tex', 'u_r', 'u_color']);
    fxGl.prog.shadow  = fxProgram(FX_FS.shadow,  ['u_tex', 'u_off', 'u_blur', 'u_color']);
    fxGl.buf = gl.createBuffer();
    fxGl.ready = true;
    return true;
  } catch (e) { fxFail(e); return false; }
}

// 화면 크기의 마스크용 텍스처 + 프레임버퍼 (화면 크기가 바뀌면 다시 만듦)
function fxEnsureTarget() {
  const w = canvas.width, h = canvas.height;
  if (fxGl.tex && fxGl.w === w && fxGl.h === h) return;
  gl.activeTexture(gl.TEXTURE0);
  if (fxGl.tex) { gl.deleteTexture(fxGl.tex); gl.deleteFramebuffer(fxGl.fbo); }
  fxGl.tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, fxGl.tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  fxGl.fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fxGl.fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fxGl.tex, 0);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  fxGl.w = w; fxGl.h = h;
  if (!ok) throw new Error('프레임버퍼 생성 실패');
}

// 효과 패스 전후로 GL 상태를 저장/복원 (Spine 이 알고 있는 상태와 어긋나지 않게)
function fxSave() {
  const active = gl.getParameter(gl.ACTIVE_TEXTURE);
  gl.activeTexture(gl.TEXTURE0);
  const s = {
    active, tex0: gl.getParameter(gl.TEXTURE_BINDING_2D),
    prog: gl.getParameter(gl.CURRENT_PROGRAM),
    blend: gl.isEnabled(gl.BLEND),
    bf: [gl.getParameter(gl.BLEND_SRC_RGB), gl.getParameter(gl.BLEND_DST_RGB), gl.getParameter(gl.BLEND_SRC_ALPHA), gl.getParameter(gl.BLEND_DST_ALPHA)],
    ab: gl.getParameter(gl.ARRAY_BUFFER_BINDING),
  };
  gl.activeTexture(active);
  return s;
}
function fxRestore(s) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.useProgram(s.prog);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, s.tex0);
  gl.activeTexture(s.active);
  if (s.blend) gl.enable(gl.BLEND); else gl.disable(gl.BLEND);
  gl.blendFuncSeparate(s.bf[0], s.bf[1], s.bf[2], s.bf[3]);
  gl.bindBuffer(gl.ARRAY_BUFFER, s.ab);
}

// 캐릭터들을 마스크 텍스처에 그림 (끝나면 화면 프레임버퍼로 복귀, 렌더러는 멈춘 상태)
function fxRenderMask(list) {
  if (rActive) rEnd();                           // 지금까지 쌓인 그리기(배경 등)를 먼저 화면에 반영
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fxGl.fbo);
  gl.viewport(0, 0, fxGl.w, fxGl.h);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  rBegin();
  for (const ch of list) { try { renderer.drawSkeleton(ch.skeleton); } catch (e) {} }
  rEnd();
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
}

// 마스크 텍스처를 읽어 화면의 사각형(클립 좌표) 영역에 효과를 그림
function fxDraw(prog, clip, setup) {
  gl.useProgram(prog.p);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, fxGl.tex);
  gl.uniform1i(prog.u_tex, 0);
  setup(prog);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   // 셰이더가 프리멀티플라이드 색을 내보냄
  const x0 = clip[0], y0 = clip[1], x1 = clip[2], y1 = clip[3];
  gl.bindBuffer(gl.ARRAY_BUFFER, fxGl.buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x0, y0, x1, y0, x0, y1, x0, y1, x1, y0, x1, y1]), gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(FX_ATTR);
  gl.vertexAttribPointer(FX_ATTR, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.disableVertexAttribArray(FX_ATTR);
}

// 캐릭터의 월드 좌표 경계 [x0, y0, x1, y1] (못 구하면 null → 화면 전체로 처리)
function fxBoundsWorld(ch) {
  try {
    const off = new spine.Vector2(), size = new spine.Vector2();
    ch.skeleton.getBounds(off, size, []);
    if (Number.isFinite(off.x) && Number.isFinite(off.y) && Number.isFinite(size.x) && Number.isFinite(size.y) && size.x > 0 && size.y > 0)
      return [off.x, off.y, off.x + size.x, off.y + size.y];
  } catch (e) {}
  return null;
}
// 월드 사각형 → 클립 좌표(-1~1). 화면 밖으로 나가는 부분은 잘라냄. 비어 있으면 null
function fxClipRect(b, viewW, viewH) {
  const x0 = Math.max(-1, b[0] / (viewW / 2)), x1 = Math.min(1, b[2] / (viewW / 2));
  const y0 = Math.max(-1, b[1] / (viewH / 2)), y1 = Math.min(1, b[3] / (viewH / 2));
  return (x1 > x0 && y1 > y0) ? [x0, y0, x1, y1] : null;
}

// 캐릭터 한 명의 외곽선 (본체를 그리기 직전에 호출)
function drawOutline(ch, viewW, viewH, pxPerWorld) {
  try {
    const f = settings.fx;
    if (!fxInit()) return;
    const b = fxBoundsWorld(ch), m = f.outline_width + 3;
    const clip = b ? fxClipRect([b[0] - m, b[1] - m, b[2] + m, b[3] + m], viewW, viewH) : [-1, -1, 1, 1];
    if (!clip) return;
    if (rActive) rEnd();                // 쌓인 그리기를 먼저 반영한 뒤에 GL 상태를 건드림
    const saved = fxSave();
    fxEnsureTarget();
    fxRenderMask([ch]);
    const rpx = f.outline_width * pxPerWorld, c = f.outline_color;
    fxDraw(fxGl.prog.outline, clip, (u) => {
      gl.uniform2f(u.u_r, rpx / canvas.width, rpx / canvas.height);
      gl.uniform4f(u.u_color, c[0], c[1], c[2], 1);
    });
    fxRestore(saved);
    rBegin();
  } catch (e) { fxFail(e); }
}

// 벽 그림자: 보이는 모든 캐릭터 실루엣을 합쳐 한 번에 (배경 바로 위, 캐릭터 뒤)
function drawWallShadow(list, viewW, viewH, pxPerWorld) {
  try {
    const f = settings.fx;
    if (!fxInit()) return;
    const sx = f.shadow_x, sy = f.shadow_y, pad = f.shadow_blur + 4;
    let u = null, full = false;
    for (const ch of list) {
      const b = fxBoundsWorld(ch);
      if (!b) { full = true; break; }
      const r = [b[0] + sx - pad, b[1] + sy - pad, b[2] + sx + pad, b[3] + sy + pad];
      u = u ? [Math.min(u[0], r[0]), Math.min(u[1], r[1]), Math.max(u[2], r[2]), Math.max(u[3], r[3])] : r;
    }
    const clip = full ? [-1, -1, 1, 1] : (u ? fxClipRect(u, viewW, viewH) : null);
    if (!clip) return;
    if (rActive) rEnd();
    const saved = fxSave();
    fxEnsureTarget();
    fxRenderMask(list);
    const c = f.shadow_color, br = f.shadow_blur * pxPerWorld;
    fxDraw(fxGl.prog.shadow, clip, (p) => {
      gl.uniform2f(p.u_off, sx * pxPerWorld / canvas.width, sy * pxPerWorld / canvas.height);
      gl.uniform2f(p.u_blur, br / canvas.width, br / canvas.height);
      gl.uniform4f(p.u_color, c[0], c[1], c[2], f.shadow_alpha);
    });
    fxRestore(saved);
    rBegin();
  } catch (e) { fxFail(e); }
}

// 4.3 호환: pose가 있으면 pose, 없으면 본 자체
const P = (b) => b.pose || b;

// 없는 애니메이션 이름이어도 오류 없이 넘어가는 헬퍼
const hasAnim = (ch, name) => !!ch.skeleton.data.findAnimation(name);
const animOf = (ch, key) => (ch.cfg.anim && ch.cfg.anim[key]) || ANIM[key];   // 캐릭터별 anim 이 있으면 그걸 우선
const isEmptyEntry = (e) => !e || !e.animation || e.animation.name === '<empty>' || (e.animation.timelines && e.animation.timelines.length === 0);

// 모션 재생. 트랙이 비어 있으면 mixDuration 이 무시되고 첫 프레임부터 100% 로 튀어나오므로,
// 빈 모션을 먼저 깔고 그 위에 큐로 이어서 페이드 인 시킴 (이게 idle → 모션 전환이 뚝 끊기던 원인)
function playAnim(ch, track, name, loop) {
  if (!hasAnim(ch, name)) return null;
  const st = ch.state;
  const cur = (st.tracks && st.tracks[track]) || null;   // 런타임에 따라 getCurrent 가 없어서 tracks 를 직접 읽음
  let e;
  if (!cur) {
    st.setEmptyAnimation(track, 0);
    e = st.addAnimation(track, name, loop, 0);
    e.mixDuration = MIX_IN;
  } else {
    e = st.setAnimation(track, name, loop);
    e.mixDuration = isEmptyEntry(cur) ? MIX_IN : MIX_SWITCH;   // 비어 있던(복귀 중이던) 트랙이면 페이드 인, 다른 모션이면 모션 간 전환
  }
  return e;
}
// last 모션이 끝난 뒤 idle 로 부드럽게 복귀하도록 빈 모션을 이어 붙임
function queueFadeOut(ch, track, last) {
  const f = ch.state.addEmptyAnimation(track, MIX_OUT, 0);
  try { if (last && last.getTrackComplete) f.delay = Math.max(0, last.getTrackComplete() - MIX_OUT_OVERLAP); } catch (_) {}
  return f;
}
// 끝 모션을 1회 재생하고, 끝나면 idle 로 부드럽게 복귀 (끝 모션이 없으면 바로 복귀)
function endAnim(ch, track, endName) {
  if (hasAnim(ch, endName)) {
    const e = playAnim(ch, track, endName, false);
    queueFadeOut(ch, track, e);
  } else ch.state.setEmptyAnimation(track, MIX_OUT);
}
// 때리기/끝 모션이 재생되는 중이면 true → 이때는 쓰다듬기가 끼어들지 않음
function isBusy(ch) {
  if (ch.dragging || ch.pulling) return true;
  const t = ch.state.tracks[TRACK.HIT];
  if (!t || !t.animation) return false;
  const n = t.animation.name;
  return n === ANIM.hit || n === ANIM.hitEnd || n === animOf(ch, 'dragEnd') || n === ANIM.pullEnd;
}

function build() {
  for (const [name, cfg] of Object.entries(CHARACTERS)) {
    const atlas  = assets.require(cfg.path + '.atlas');
    const loader = new spine.AtlasAttachmentLoader(atlas);
    const data   = new spine.SkeletonBinary(loader).readSkeletonData(assets.require(cfg.path + '.skel'));

    const skeleton = new spine.Skeleton(data);
    skeleton.setSkin(data.defaultSkin || data.skins[0]);   // 내부에서 updateCache() 호출됨
    skeleton.setupPose();
    skeleton.x = cfg.x;
	skeleton.y = cfg.y ?? -250;

    const stateData = new spine.AnimationStateData(data);
    stateData.defaultMix = MIX_SWITCH;
    const state = new spine.AnimationState(stateData);
    if (data.findAnimation(ANIM.idle)) state.setAnimation(0, ANIM.idle, true);
    else showError('idle 애니메이션 없음(' + name + '): ANIM.idle 이름 확인');

    const cheekBone = cfg.cheekBone ? skeleton.findBone(cfg.cheekBone) : null;
    if (cfg.abilities.includes('cheek') && !cheekBone) showError('cheek 본을 찾지 못함(' + name + '): CHARACTERS 의 cheekBone 이름 확인');

    chars[name] = {
      name, cfg, skeleton, state,
      bounds: new spine.SkeletonBounds(),
      has: (a) => cfg.abilities.includes(a),
      cheekBone,
      atamaBone: skeleton.findBone(LOOK.bone),
      look: { x: 0, y: 0 },

      down: null,        // 현재 누르고 있는 정보
      patting: false,
      lastMove: 0,
      hover: { lx: null, ly: null, vx: null, vy: null, rev: 0, t: 0 },   // 클릭 없이 흔드는 동작 판정용
      pulling: false,
      dragging: false,   // 머리 드래그 모션 재생 중

      // 월드 좌표계 오프셋 (볼 스프링: vx, vy 속도 포함)
      fx: { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, active: false },
    };
  }
}

// ───────────────── 6. 입력 처리 ─────────────────
const mouseNorm = { x: 0, y: 0 };
// 버튼 눌림 상태를 직접 추적. Wallpaper Engine 은 mousemove 의 e.buttons 를 항상 0 으로 보내는 경우가 있어서,
// e.buttons 만 믿으면 드래그 시작 직전에 '뗌'으로 오인해 바로 풀려버림.
let btnDown = false;
let buttonsSupported = false;   // mousemove 에서 buttons > 0 이 한 번이라도 관측되면 true (브라우저처럼 정상 지원하는 환경)
window.addEventListener('mousedown', () => { btnDown = true; }, true);
for (const t of ['mouseup', 'pointerup', 'pointercancel', 'dragend']) window.addEventListener(t, () => { btnDown = false; }, true);
const isPressed = (e) => ((e.buttons | 0) !== 0) || btnDown;
window.addEventListener('mousemove', (e) => {
  mouseNorm.x = (e.clientX / Math.max(1, window.innerWidth))  * 2 - 1;
  mouseNorm.y = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1);   // 위쪽이 +
});

function toWorld(e) {
  const v = new spine.Vector3(e.clientX, e.clientY, 0);
  renderer.camera.screenToWorld(v, canvas.width, canvas.height);
  return v;
}

// atama-* 트랜스폼 제약의 mix 를 셋업 값으로 복원 (4.2 / 4.3 런타임 모두 대응). 애니메이션이 제약 mix 를 키잉했을 때 쓰다듬기 중 제약이 꺼지는 문제 방지
const MIX_KEYS = ['mixRotate', 'mixX', 'mixY', 'mixScaleX', 'mixScaleY', 'mixShearY'];
function lockConstraintMix(ch) {
  try {
    const sk = ch.skeleton;
    const list = sk.transformConstraints || sk.constraints || [];
    for (const c of list) {
      const d = c && c.data;
      if (!d || typeof d.name !== 'string' || !d.name.startsWith(LOOK.bone)) continue;
      const setup = d.setup || d;       // 4.3: data.setup / 4.2: data
      const pose  = c.pose || c;        // 4.3: constraint.pose / 4.2: constraint
      for (const k of MIX_KEYS) if (typeof setup[k] === 'number' && typeof pose[k] === 'number') pose[k] = setup[k];
    }
  } catch (e) { if (!ch._lockErr) { ch._lockErr = 1; showError('제약 mix 복원 실패(' + ch.name + '): ' + e.message); } }
}

// 클릭한 좌표가 어느 캐릭터의 어느 부위인지 판정 (앞에 있는 캐릭터부터, 볼 우선)
// 점 (px,py) 에서 다각형 변까지의 최단 거리
function distToPolyEdge(poly, px, py) {
  let best = Infinity;
  for (let j = 0; j < poly.length; j += 2) {
    const k = (j + 2) % poly.length;
    const ax = poly[j], ay = poly[j + 1], bx = poly[k], by = poly[k + 1];
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    best = Math.min(best, Math.hypot(px - (ax + t * dx), py - (ay + t * dy)));
  }
  return best;
}

// headPad: 머리 판정만 바깥으로 넓히는 거리(월드 단위). 볼 판정은 넓히지 않음
// headPad 는 숫자, 또는 캐릭터별로 값을 돌려주는 함수 (ch) => 숫자
function hitTest(wx, wy, headPad = 0) {
  const front = layerOrder().filter((k) => chars[k]).reverse();
  for (const ch of front.map((k) => chars[k])) {
    if (!settings.visible[ch.name] || !ch.hitPolys) continue;
    const b = ch.bounds;
    const pad = typeof headPad === 'function' ? headPad(ch) : headPad;

    let head = false, cheek = false;
    for (let i = 0; i < ch.hitPolys.length; i++) {
      const n = ch.hitNames[i];
      const inside = b.containsPointPolygon(ch.hitPolys[i], wx, wy);
      if (inside) {
        if (n.includes(BOX.head))  head  = true;
        if (n.includes(BOX.cheek)) cheek = true;
      } else if (pad > 0 && n.includes(BOX.head) && distToPolyEdge(ch.hitPolys[i], wx, wy) <= pad) {
        head = true;   // 머리 박스 바깥 여유 구간
      }
    }
    if (cheek && ch.has('cheek'))                                          return { ch, region: 'cheek' };
    if (head  && (ch.has('pat') || ch.has('hit') || ch.has('drag')))     return { ch, region: 'head' };
  }
  return null;
}

function endPat(ch, silent) {
  if (!ch.patting) return;
  ch.patting = false;
  if (!silent) endAnim(ch, TRACK.PET, ANIM.patEnd);   // silent: 다른 모션이 바로 이어받을 때는 끝 모션 생략
}

window.addEventListener('mousedown', (e) => {
  const w = toWorld(e);
  const hit = hitTest(w.x, w.y);
  if (DEBUG_HIT && isBrowserTest()) {
    let t = 'click world=(' + Math.round(w.x) + ',' + Math.round(w.y) + ') hit=' + (hit ? hit.ch.name + ':' + hit.region : '없음') + '\n';
    for (const c of Object.values(chars)) { t += '  ' + c.name + ' boxes=[' + (c.hitNames || []).join(',') + ']\n'; }
    window.__hitLog = t; window.__hitLogT = performance.now();
  }
  if (!hit) return;
  endPat(hit.ch, true); resetHover(hit.ch);   // 클릭하면 쓰다듬기는 끝내고 드래그/클릭 판정으로
  hit.ch.down = {
    region: hit.region,
    sx: e.clientX, sy: e.clientY,     // 화면 좌표
    wx: w.x, wy: w.y,                 // 월드 좌표
    t: performance.now(),
    moved: false,
  };
});

function resetHover(ch) {
  const h = ch.hover;
  h.lx = h.ly = h.vx = h.vy = null;
  h.rev = 0;
}

// 마우스 위치가 들어올 때마다 호출. 방향이 SHAKE_REVERSALS 번 뒤집혔으면(=흔드는 중) true
function hoverShake(h, x, y, now) {
  if (h.lx === null || now - h.t > PAT_STOP_MS) {     // 멈췄다가 다시 움직이면 처음부터 판정
    h.lx = x; h.ly = y; h.vx = h.vy = null; h.rev = 0;
  }
  h.t = now;
  const sx = x - h.lx, sy = y - h.ly;
  if (Math.hypot(sx, sy) >= GESTURE_STEP) {
    if (h.vx !== null && sx * h.vx + sy * h.vy < 0) h.rev++;   // 직전 방향과 반대면 뒤집힘
    h.vx = sx; h.vy = sy; h.lx = x; h.ly = y;
  }
  return h.rev >= SHAKE_REVERSALS;
}

// 클릭하지 않은 채 머리 위에서 마우스를 흔들면 쓰다듬기. 머리 밖으로 나가면 끝남
function updateHoverPat(e, now) {
  const w = toWorld(e);
  const hit = hitTest(w.x, w.y, (c) => (c.patting ? PAT_HOVER_PAD : 0));   // 쓰다듬기 시작은 원래 머리 박스 안에서만, 발동 중인 캐릭터만 영역 확장
  for (const ch of Object.values(chars)) {
    if (!(hit && hit.ch === ch && hit.region === 'head' && ch.has('pat'))) {
      resetHover(ch);
      endPat(ch);
      continue;
    }
    const shaking = hoverShake(ch.hover, e.clientX, e.clientY, now);
    if (isBusy(ch)) { if (ch.patting) endPat(ch, true); continue; }
    if (ch.patting || shaking) {
      ch.lastMove = now;               // 움직이는 동안은 계속 쓰다듬기, 멈추면 PAT_STOP_MS 뒤 종료
      if (!ch.patting) {
        ch.patting = true;
        playAnim(ch, TRACK.PET, ANIM.patLoop, true);
      }
      emitHearts(ch, e.clientX, e.clientY, now);   // ♥ 쓰다듬는 동안 하트 이펙트
    }
  }
}

window.addEventListener('mousemove', (e) => {
  const now = performance.now();
  if ((e.buttons | 0) !== 0) buttonsSupported = true;
  // 뗌 유실 복구: buttons 를 제대로 주는 환경(브라우저)에서만 사용. Wallpaper Engine 처럼 항상 0 이면 mouseup 만 믿음
  if (buttonsSupported && (e.buttons | 0) === 0 && Object.values(chars).some((c) => c.down)) { btnDown = false; releaseAll(); }
  if (!isPressed(e)) updateHoverPat(e, now);   // 클릭 중이 아닐 때만
  for (const ch of Object.values(chars)) {
    const d = ch.down;
    if (!d) continue;
    const dist = Math.hypot(e.clientX - d.sx, e.clientY - d.sy);

    // 머리를 클릭한 채 드래그: 본은 그대로, 모션만 반복 재생
    if (d.region === 'head' && ch.has('drag') && !ch.dragging && dist > PAT_MOVE_THRESHOLD) {
      d.moved = true;
      endPat(ch, true);
      ch.dragging = true;
      playAnim(ch, TRACK.DRAG, animOf(ch, 'dragLoop'), true);
    }

    // 볼 당기기
    if (d.region === 'cheek' && dist > PAT_MOVE_THRESHOLD) {
      d.moved = true;
      endPat(ch, true);
      const w = toWorld(e);
      let dx = w.x - d.wx, dy = w.y - d.wy;
      const len = Math.hypot(dx, dy);
      if (len > PULL_MAX_WORLD) { dx *= PULL_MAX_WORLD / len; dy *= PULL_MAX_WORLD / len; }
      ch.fx.tx = dx; ch.fx.ty = dy;
      ch.fx.active = true;

      if (!ch.pulling) {
        ch.pulling = true;
        playAnim(ch, TRACK.PULL, ANIM.pullLoop, true);
      }
    }
  }
});

function releaseAll() {
  const now = performance.now();
  for (const ch of Object.values(chars)) {
    const d = ch.down;
    if (!d) continue;

    if (d.region === 'head') {
      if (ch.dragging) {
        ch.dragging = false;
        endAnim(ch, TRACK.DRAG, animOf(ch, 'dragEnd'));   // 놓으면 끝 모션 1회 → idle 로 부드럽게 복귀
      } else if (!d.moved && now - d.t < CLICK_MAX_MS && ch.has('hit') && hasAnim(ch, ANIM.hit)) {
        // 클릭 → hit 재생 후 hitEnd 1회
        endPat(ch, true);
        emitStars(d.sx, d.sy);   // ★ 때릴 때 별 이펙트 (클릭한 위치)
        let tail = playAnim(ch, TRACK.HIT, ANIM.hit, false);
        if (hasAnim(ch, ANIM.hitEnd)) { tail = ch.state.addAnimation(TRACK.HIT, ANIM.hitEnd, false, 0); tail.mixDuration = MIX_SWITCH; }
        queueFadeOut(ch, TRACK.HIT, tail);
      }
    }

    if (d.region === 'cheek' && ch.pulling) {
      ch.pulling = false;
      endAnim(ch, TRACK.PULL, ANIM.pullEnd);
      // 스프링은 현재 오프셋에서 속도 0으로 출발 → 0으로 튕겨 복귀
      ch.fx.vx = 0; ch.fx.vy = 0;
    }
    ch.down = null;
  }
}
// 버튼 뗌 이벤트가 유실돼도 풀리도록 여러 경로로 연결 (Wallpaper Engine 대비)
for (const t of ['mouseup', 'pointerup', 'pointercancel', 'dragend']) window.addEventListener(t, releaseAll);
window.addEventListener('blur', () => { if (isBrowserTest()) releaseAll(); });          // WE 는 데스크톱 클릭 때 blur 가 오발하므로 브라우저 테스트에서만
document.addEventListener('mouseleave', () => { if (isBrowserTest()) releaseAll(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });

// ───────────────── 7. 볼 스프링 ─────────────────
function updateCheekSpring(ch, dt) {
  const f = ch.fx;
  if (!f.active) return;

  if (ch.pulling) {
    // 드래그 중: 목표 위치를 부드럽게 따라감
    const k = Math.min(1, dt * PULL_FOLLOW);
    f.x += (f.tx - f.x) * k;
    f.y += (f.ty - f.y) * k;
  } else {
    // 놓은 뒤: 감쇠 스프링으로 0까지 복귀 (오버슈트하며 튕김)
    const ax = -SPRING_K * f.x - SPRING_C * f.vx;
    const ay = -SPRING_K * f.y - SPRING_C * f.vy;
    f.vx += ax * dt;  f.vy += ay * dt;
    f.x  += f.vx * dt; f.y  += f.vy * dt;

    if (Math.abs(f.x) < 0.1 && Math.abs(f.y) < 0.1 &&
        Math.abs(f.vx) < 1 && Math.abs(f.vy) < 1) {
      f.x = f.y = f.vx = f.vy = f.tx = f.ty = 0;
      f.active = false;
    }
  }
}

// 월드 오프셋을 본의 로컬 변위로 변환해 적용 (원래 값 반환)
function applyBoneOffset(bone, f) {
  if (!bone || !f.active) return null;

  const bp = P(bone);
  const saved = { x: bp.x, y: bp.y };

  const parent = bone.parent;
  if (parent) {
    const pp = parent.appliedPose || P(parent);
    // 부모 월드 행렬의 역행렬로 월드 변위 → 부모 로컬 변위
    const det = pp.a * pp.d - pp.b * pp.c;
    if (Math.abs(det) > 1e-8) {
      bp.x += ( pp.d * f.x - pp.b * f.y) / det;
      bp.y += (-pp.c * f.x + pp.a * f.y) / det;
    }
  } else {
    bp.x += f.x;
    bp.y += f.y;
  }
  return saved;
}

// ───────────────── 8. 메인 루프 ─────────────────
let frameCount = 0;
let last = performance.now();

// 캐릭터 한 명의 위치/애니메이션/물리를 갱신해 월드 행렬까지 계산 (그리기는 따로)
function updateChar(ch, now, dt) {
  const a = settings.adj[ch.name];
  ch.skeleton.x = ch.cfg.x + a.x;
  ch.skeleton.y = (ch.cfg.y ?? -250) + a.y;
  ch.skeleton.scaleX = ch.skeleton.scaleY = (ch.cfg.scale ?? BASE_SCALE) * a.s;

  // 쓰다듬다 마우스가 멈추면 쓰다듬기 종료
  if (ch.patting && now - ch.lastMove > PAT_STOP_MS) endPat(ch);

  ch.state.update(dt);
  ch.state.apply(ch.skeleton);
  if (LOOK.lockMix) lockConstraintMix(ch);

  // 드래그 오프셋을 물리 계산 '전에' 본 위치에 얹음 → 물리 본(머리카락 등)이 드래그 움직임에 반응함
  // (부모 월드 행렬은 직전 프레임 값을 사용: 이동량 변환에는 회전/크기 성분만 필요하므로 문제없음)
  updateCheekSpring(ch, dt);
  ch._savedCheek = applyBoneOffset(ch.cheekBone, ch.fx);

  // 판정 영역(바운딩박스)은 시선(atama) 이동을 적용하기 '전' 상태로 한 번 계산해 저장 → 시선이 움직여도 판정 영역은 고정
  //   (Physics.pose: 물리 시간은 진행시키지 않고 현재 물리 상태만 반영)
  try {
    ch.skeleton.updateWorldTransform(spine.Physics.pose ?? spine.Physics.none);
    ch.bounds.update(ch.skeleton, true);
    ch.hitNames = ch.bounds.boundingBoxes.map((x) => x.name);
    ch.hitPolys = ch.bounds.polygons.map((p) => p.slice());
  } catch (e) { if (!ch._hitErr) { ch._hitErr = 1; showError('판정 영역 계산 실패(' + ch.name + '): ' + e.message); } }

  // atama 컨트롤러 본: 마우스 방향으로 부드럽게 이동 (제약의 입력)
  if (LOOK.enabled && ch.atamaBone) {
    const k = 1 - Math.exp(-LOOK.follow * dt);
    ch.look.x += (mouseNorm.x * LOOK.rangeX - ch.look.x) * k;
    ch.look.y += (mouseNorm.y * LOOK.rangeY - ch.look.y) * k;
    ch._savedAtama = applyBoneOffset(ch.atamaBone, { active: true, x: ch.look.x, y: ch.look.y });
  }

  ch.skeleton.update(dt);   // 물리 시간 진행 (이게 없으면 물리 제약이 움직이지 않음)
  ch.skeleton.updateWorldTransform(spine.Physics.update);   // 오프셋 포함해 월드 행렬 + 물리 한 번에 계산
}

// 오프셋이 누적되지 않게 복원 (그리기가 모두 끝난 뒤)
function restoreChar(ch) {
  if (ch._savedCheek) { const bp = P(ch.cheekBone); bp.x = ch._savedCheek.x; bp.y = ch._savedCheek.y; }
  ch._savedCheek = null;
  if (ch._savedAtama) { const ap = P(ch.atamaBone); ap.x = ch._savedAtama.x; ap.y = ch._savedAtama.y; }
  ch._savedAtama = null;
}

function drawChar(ch) {
  try {
    renderer.drawSkeleton(ch.skeleton);
  } catch (e) {
    if (!ch._errShown) { showError('draw 실패(' + ch.name + '): ' + e.message); ch._errShown = true; }
  }
}

function frameBody(now) {
  frameCount++;
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  gl.viewport(0, 0, w, h);
  gl.clearColor(0.1, 0.1, 0.13, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 기준 영역을 화면에 꽉 채우도록 맞춤(cover): 보이는 영역은 항상 기준 영역의 안쪽
  const screenAspect = w / h;
  let viewW, viewH;
  if (screenAspect >= DESIGN_ASPECT) { viewW = DESIGN_WIDTH / settings.scale;   viewH = viewW / screenAspect; }
  else                               { viewH = DESIGN_HEIGHT / settings.scale;  viewW = viewH * screenAspect; }
  renderer.camera.setViewport(viewW, viewH);
  renderer.camera.position.set(0, 0, 0);
  renderer.camera.update();

  // 1) 갱신: 보이는 캐릭터의 애니메이션/물리, 배경 영상의 새 프레임
  const order = layerOrder();
  const active = [];
  for (const key of order) {
    const ch = chars[key];
    if (ch && settings.visible[key]) { updateChar(ch, now, dt); active.push(ch); }
  }
  updateBgVideo(now);

  // 2) 그리기 (뒤 → 앞). 벽 그림자는 배경 바로 위(배경이 없으면 첫 캐릭터 바로 앞)에 한 번
  const fx = settings.fx, pxPerWorld = w / viewW;
  const shadowList = active.filter((c) => c.cfg.shadow !== false);
  const wantShadow  = !fxGl.failed && fx.shadow_on && fx.shadow_alpha > 0 && shadowList.length > 0;
  const wantOutline = !fxGl.failed && fx.outline_on && fx.outline_width > 0;
  let shadowDone = !wantShadow;
  const bgShown = !!IMAGES.bg && settings.visible.bg && !!layerImage('bg');

  rBegin();
  for (const key of order) {
    if (!settings.visible[key]) continue;
    if (IMAGES[key]) {
      drawImageLayer(key, viewW, viewH);
      if (key === 'bg' && !shadowDone) { drawWallShadow(shadowList, viewW, viewH, pxPerWorld); shadowDone = true; }
      continue;
    }
    const ch = chars[key];
    if (!ch) continue;
    if (!shadowDone && !bgShown) { drawWallShadow(shadowList, viewW, viewH, pxPerWorld); shadowDone = true; }
    if (wantOutline && !fxGl.failed && ch.cfg.outline !== false) drawOutline(ch, viewW, viewH, pxPerWorld);
    drawChar(ch);
  }
  if (DEBUG_HIT && isBrowserTest()) drawHitDebug();
  rEnd();

  for (const ch of active) restoreChar(ch);
}

// 한 프레임에서 예외가 나도 루프가 죽지 않게 보호 (죽으면 화면이 통째로 멈춤)
function frame(now) {
  try { frameBody(now); }
  catch (e) {
    console.error(e);
    if (!window.__frameErr) { window.__frameErr = 1; showError('frame 오류(계속 진행): ' + (e && e.message ? e.message : e)); }
    try { rActive = false; gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); } catch (_) {}
    for (const ch of Object.values(chars)) { try { restoreChar(ch); } catch (_) {} }
  }
  requestAnimationFrame(frame);
}

// ───────────────── 9. 디버그: 판정 영역 / 상태 표시 (브라우저 테스트 전용) ─────────────────
function drawHitDebug() {
  if (!isBrowserTest()) return;
  try {
    for (const ch of Object.values(chars)) {
      if (!settings.visible[ch.name] || !ch.hitPolys) continue;
      for (let i = 0; i < ch.hitPolys.length; i++) {
        const poly = ch.hitPolys[i], n = ch.hitNames[i];
        const col = n.includes(BOX.cheek) ? new spine.Color(1, 1, 0, 1) : new spine.Color(0, 1, 1, 1);
        for (let j = 0; j < poly.length; j += 2) {
          const k = (j + 2) % poly.length;
          renderer.line(poly[j], poly[j + 1], poly[k], poly[k + 1], col);
        }
      }
    }
  } catch (e) { if (!window.__hdErr) { window.__hdErr = 1; showError('hit 표시 실패: ' + e.message); } }
  const logEl = document.getElementById('hitlog') || (() => {
    const el = document.createElement('pre'); el.id = 'hitlog';
    el.style.cssText = 'position:fixed;left:8px;top:8px;margin:0;color:#ffd35a;font:13px monospace;z-index:9;background:rgba(0,0,0,.6);padding:6px;pointer-events:none';
    document.body.appendChild(el); return el;
  })();
  logEl.textContent = (window.__hitLog && performance.now() - window.__hitLogT < 4000) ? window.__hitLog : '';
}

function slotInfo(ch) {
  let out = '  ';
  try {
    const sk = ch.skeleton;
    let total = 0, withAtt = 0, visible = 0;
    for (const sl of sk.slots) {
      total++;
      const sp = sl.appliedPose || sl.pose;
      const att = sp.attachment;
      if (att) { withAtt++; if (sp.color.a > 0) visible++; }
    }
    out += 'slots=' + total + ' attach=' + withAtt + ' visible=' + visible;
  } catch (e) { out += 'slot err ' + e.message; }
  try {
    const off = new spine.Vector2(), size = new spine.Vector2();
    ch.skeleton.getBounds(off, size, []);
    out += ' bounds=(' + Math.round(off.x) + ',' + Math.round(off.y) + ' ' + Math.round(size.x) + 'x' + Math.round(size.y) + ')';
  } catch (e) { out += ' bounds err'; }
  try {
    const pg = assets.require(ch.cfg.path + '.atlas').pages;
    out += ' pages=' + pg.length + ' tex=' + pg.map((q) => { const im = q.texture.getImage(); return im.width + 'x' + im.height; }).join(',');
  } catch (e) { out += ' tex err ' + e.message; }
  const tr = ch.state.tracks[0];
  out += ' anim=' + (tr && tr.animation ? tr.animation.name : 'none') + '\n';
  return out;
}
function startStatus() {
  const el = document.createElement('pre');
  el.id = 'status';
  el.style.cssText = 'position:fixed;left:8px;bottom:8px;margin:0;color:#7fe0a0;font:14px monospace;' +
    'white-space:pre;z-index:9;background:rgba(0,0,0,.6);padding:8px';
  document.body.appendChild(el);
  const t0 = performance.now();
  const timer = setInterval(() => {
    if (!isBrowserTest()) { clearInterval(timer); el.remove(); return; }
    let txt = 'canvas ' + canvas.width + 'x' + canvas.height + ' / scale ' + settings.scale +
              ' / frames ' + frameCount + ' / glErr ' + gl.getError() + '\n';
    for (const ch of Object.values(chars)) {
      const d = ch.skeleton.data;
      txt += ch.name + ' vis=' + settings.visible[ch.name] + ' size=' + Math.round(d.width) + 'x' + Math.round(d.height) +
             ' pos=' + ch.skeleton.x + ',' + ch.skeleton.y + ' scale=' + ch.skeleton.scaleX + '\n' + slotInfo(ch);
    }
    el.textContent = txt;
    if (performance.now() - t0 > 20000) { clearInterval(timer); el.remove(); }
  }, 500);
}

function waitLoad() {
  if (assets.hasErrors()) { showError('에셋 로드 실패:\n' + JSON.stringify(assets.getErrors(), null, 1)); return; }
  if (assets.isLoadingComplete()) { document.getElementById('dbg')?.remove(); build(); startStatus(); requestAnimationFrame(frame); }
  else requestAnimationFrame(waitLoad);
}
waitLoad();

// ───────────────── 10. Wallpaper Engine 속성 연동 ─────────────────
window.wallpaperPropertyListener = {
  applyUserProperties(p) {
    window.__weActive = true;
    hideDebugUI();
    for (const key of Object.keys(p)) {
      if (p[key] && p[key].value !== undefined) applyProp(key, p[key].value);
    }
  }
};

// ───────────────── 11. 브라우저 테스트용 패널 (Wallpaper Engine 에서는 표시 안 됨) ─────────────────
// 웹 서버/브라우저에서 index.html 을 열면 오른쪽 위에 나타남. H 키로 숨기기/보이기, 값은 localStorage 에 자동 저장.
setTimeout(() => {
  if (window.__weActive) return;

  const defaults = defaultValues();
  const labels = {};                                   // 속성 이름 → 한글 라벨 (project.json 의 text 와 같음)
  const pj = buildProjectJson().general.properties;
  for (const k of Object.keys(pj)) labels[k] = pj[k].text;

  // 값 저장/복원 (브라우저 localStorage, 새로고침해도 유지)
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(PROJECT.storeKey) || "{}"); } catch (e) {}
  const values = Object.assign({}, defaults);          // 현재 패널 값 (project.json 속성 이름 → 값)
  const persist = (key, v) => {
    values[key] = v;
    try { localStorage.setItem(PROJECT.storeKey, JSON.stringify(values)); } catch (e) {}
  };
  const init = (key) => { if (saved[key] !== undefined) { values[key] = saved[key]; applyProp(key, saved[key]); } return values[key]; };

  // ── DOM 도우미 ──
  const h = (tag, attrs, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) { if (k === "class") e.className = v; else e[k] = v; }
    for (const c of kids) e.append(c);
    return e;
  };
  const css = h("style", { textContent:
    ".tp{position:fixed;right:8px;top:8px;z-index:20;width:300px;max-height:92vh;overflow:auto;background:rgba(15,15,20,.86);color:#eee;font:12px/1.4 sans-serif;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,.5);user-select:none}" +
    ".tp-head{display:flex;align-items:center;gap:6px;padding:8px 10px;position:sticky;top:0;background:rgba(15,15,20,.95);z-index:1}" +
    ".tp-head b{flex:1;font-size:13px}.tp-head small{color:#9aa}" +
    ".tp details{border-top:1px solid #333}.tp summary{cursor:pointer;padding:6px 10px;color:#7fe0a0;font-weight:bold}" +
    ".tp-body{padding:0 10px 8px}.tp-row{margin:6px 0}" +
    ".tp-lab{display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:2px}" +
    ".tp-ctl{display:flex;align-items:center;gap:6px}.tp-ctl input[type=range]{flex:1;min-width:0}" +
    ".tp-ctl input[type=number]{width:62px;background:#222;color:#fff;border:1px solid #555;border-radius:3px;padding:1px 3px}" +
    ".tp button{cursor:pointer;background:#2c2c36;color:#eee;border:1px solid #555;border-radius:4px;padding:3px 8px}" +
    ".tp button:hover{background:#3a3a48}.tp .rs{padding:0 5px;line-height:16px}" +
    ".tp-st{color:#9aa;margin:4px 0;word-break:break-all}.tp-btns{padding:8px 10px;border-top:1px solid #333;display:flex;flex-wrap:wrap;gap:4px}" });
  const box = h("div", { class: "tp" });
  // 패널 위의 마우스 조작이 캐릭터(쓰다듬기/때리기/드래그)로 전달되지 않게 막음
  for (const t of ["mousedown", "mousemove", "mouseup"]) box.addEventListener(t, (e) => e.stopPropagation());

  const body = h("div");
  const toggleBtn = h("button", { textContent: "접기", title: "패널 접기/펴기" });
  toggleBtn.onclick = () => { const hide = body.style.display !== "none"; body.style.display = hide ? "none" : ""; toggleBtn.textContent = hide ? "펴기" : "접기"; };
  box.append(h("div", { class: "tp-head" }, h("b", { textContent: "테스트 패널" }), h("small", { textContent: "H: 숨기기" }), toggleBtn), body);

  const group = (title, open) => {
    const inner = h("div", { class: "tp-body" });
    const d = h("details", { open: open !== false }, h("summary", { textContent: title }), inner);
    body.append(d);
    return inner;
  };
  const labelRow = (key, extra) => h("div", { class: "tp-lab" }, h("span", { textContent: labels[key] || key }), extra || "");
  const resetBtn = (fn) => h("button", { class: "rs", textContent: "↺", title: "기본값으로" , onclick: fn });
  const clamp = (v, r) => Math.min(r[1], Math.max(r[0], v));

  const addSlider = (into, key, r) => {
    const def = init(key);
    const rng = h("input", { type: "range", min: r[0], max: r[1], step: r[2], value: def });
    const num = h("input", { type: "number", min: r[0], max: r[1], step: r[2], value: def });
    const set = (v) => {
      v = Number(v); if (!Number.isFinite(v)) return;
      v = clamp(v, r); rng.value = v; num.value = v; applyProp(key, v); persist(key, v);
    };
    rng.oninput = () => set(rng.value);
    num.onchange = () => set(num.value);
    into.append(h("div", { class: "tp-row" }, labelRow(key, resetBtn(() => set(defaults[key]))), h("div", { class: "tp-ctl" }, rng, num)));
  };
  const addCheck = (into, key) => {
    const def = init(key);
    const cb = h("input", { type: "checkbox", checked: !!def });
    const set = (v) => { cb.checked = v; applyProp(key, v); persist(key, v); };
    cb.onchange = () => set(cb.checked);
    into.append(h("div", { class: "tp-row" }, h("label", {}, cb, " " + (labels[key] || key)), resetBtn(() => set(defaults[key]))));
  };
  const toHex = (c) => "#" + parseColor(c).map((n) => Math.round(n * 255).toString(16).padStart(2, "0")).join("");
  const addColor = (into, key) => {
    const def = init(key);
    const inp = h("input", { type: "color", value: toHex(def) });
    const set = (v) => { inp.value = toHex(v); applyProp(key, v); persist(key, v); };
    inp.oninput = () => set([1, 3, 5].map((i) => (parseInt(inp.value.slice(i, i + 2), 16) / 255).toFixed(3)).join(" "));
    into.append(h("div", { class: "tp-row" }, labelRow(key, resetBtn(() => set(defaults[key]))), inp));
  };
  const addFx = (into, pred) => {
    for (const [k, f] of Object.entries(FX)) {
      if (!pred(k)) continue;
      if (f.type === "bool") addCheck(into, k); else if (f.type === "color") addColor(into, k); else addSlider(into, k, f.range);
    }
  };

  // ── 구성 ──
  let g = group("표시 / 레이어 순서 (작을수록 뒤)");
  for (const k of LAYER_KEYS) { addCheck(g, "show_" + k); addSlider(g, "layer_" + k, RANGE.layer); }

  g = group("전체 크기 / 투명도");
  addSlider(g, "scale", RANGE.scale);
  for (const k of ["bg", "frame"]) addSlider(g, k + "_alpha", RANGE.alpha);

  // 배경 영상: 이 브라우저 탭에서만 쓰는 임시 선택 (새로고침하면 기본 영상 BG_VIDEO 로 돌아감)
  g = group("배경 영상 (webm)", false);
  const vidStatus = h("div", { class: "tp-st" });
  let blobUrl = "";
  let pickedFile = null;                              // 고른 영상 (project.json 저장 때 폴더에 같이 저장됨)
  const savedBg = init("bg_video");                   // 이전에 저장한 배경 영상 경로 복원
  if (savedBg) vidStatus.dataset.name = savedBg;
  const pick = h("input", { type: "file", accept: "video/*" });
  pick.onchange = () => {
    const f = pick.files && pick.files[0]; if (!f) return;
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    blobUrl = URL.createObjectURL(f);
    pickedFile = f;
    onBgVideoProp(blobUrl);
    vidStatus.dataset.name = f.name + " (저장 버튼을 누르면 폴더에 저장됨)";
  };
  const defVid = h("button", { textContent: "기본 영상으로", onclick: () => {
    if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = ""; }
    pickedFile = null; persist("bg_video", "");
    pick.value = ""; vidStatus.dataset.name = ""; onBgVideoProp("");
  } });
  g.append(h("div", { class: "tp-row" }, pick), h("div", { class: "tp-row" }, defVid), vidStatus);
  setInterval(() => {
    const name = vidStatus.dataset.name ? "선택한 파일: " + vidStatus.dataset.name + " / " : "";
    vidStatus.textContent = name + (bgv.ready ? "영상 재생 중" : (bgv.el ? "영상 불러오는 중 (실패하면 배경 이미지)" : "배경 이미지 사용 중"));
  }, 500);

  g = group("이펙트 (하트 / 별)");
  addFx(g, (k) => k.startsWith("effect_"));
  g = group("외곽선");
  addFx(g, (k) => k.startsWith("outline_"));
  g = group("벽 그림자");
  addFx(g, (k) => k.startsWith("shadow_"));

  for (const n of CHAR_KEYS) {
    g = group(labelOf(n) + " 위치 / 크기");
    addSlider(g, n + "_x", RANGE.x); addSlider(g, n + "_y", RANGE.y); addSlider(g, n + "_s", RANGE.s);
  }

  // ── 버튼 ──
  // [project.json 저장]: ① serve.py 로 열었으면 월페이퍼 폴더의 project.json 을 바로 덮어씀
  //                      ② 아니면 Chrome/Edge 의 파일 저장 창으로 project.json 을 골라 덮어씀 (같은 탭에서는 다음부터 바로 덮어씀)
  //                      ③ 둘 다 안 되면 project.json 을 다운로드함
  const status = h("div", { class: "tp-st", style: "padding:0 10px" });
  const say = (m) => { status.textContent = new Date().toLocaleTimeString() + " " + m; };
  let fileHandle = null;
  const bgExt = (f) => { const e = ((f.name.match(/\.[^.]+$/) || [""])[0]).toLowerCase(); return [".mp4", ".webm", ".m4v", ".mov"].includes(e) ? e : ".mp4"; };
  const dl = (blob, name) => {
    const a = h("a", { href: URL.createObjectURL(blob), download: name });
    document.body.append(a); a.click(); a.remove();
  };
  const saveProject = async () => {
    // ① 고른 배경 영상이 있으면 serve.py 로 assets/bg_custom.* 에 저장하고, project.json 의 bg_video 에 그 경로를 기록
    let bgNote = "";
    let over = {};                                     // 서버 저장이 안 될 때만 쓰는 임시 값
    if (pickedFile) {
      let ok = false;
      try {
        const r = await fetch("/__save_bg", { method: "POST", headers: { "X-Requested-With": "spine-panel", "X-Filename": encodeURIComponent(pickedFile.name), "Content-Type": "application/octet-stream" }, body: pickedFile });
        if (r.ok) { const rel = (await r.text()).trim(); persist("bg_video", rel); vidStatus.dataset.name = rel; pickedFile = null; ok = true; bgNote = " + 배경 영상"; }
      } catch (e) {}
      if (!ok) over = { bg_video: "assets/bg_custom" + bgExt(pickedFile) };
    }
    const text = JSON.stringify(buildProjectJson(Object.assign({}, values, over)), null, 2) + "\n";
    const pendingBg = pickedFile;                      // 서버로 못 보냈으면 다운로드로 대신함
    const finishLocal = () => { if (pendingBg) { dl(pendingBg, "bg_custom" + bgExt(pendingBg)); return " / 배경 영상은 다운로드된 bg_custom 파일을 assets 폴더에 넣어주세요"; } return ""; };
    try {
      const r = await fetch("/__save_project", { method: "POST", headers: { "X-Requested-With": "spine-panel", "Content-Type": "application/json" }, body: text });
      if (r.ok) { say("저장됨: 폴더의 project.json" + bgNote + " (이전 파일은 project.json.bak)"); return; }
    } catch (e) {}
    if (window.showSaveFilePicker) {
      try {
        if (!fileHandle) fileHandle = await window.showSaveFilePicker({ suggestedName: "project.json", types: [{ description: "project.json", accept: { "application/json": [".json"] } }] });
        const w = await fileHandle.createWritable(); await w.write(text); await w.close();
        say("저장됨: " + fileHandle.name + finishLocal()); return;
      } catch (e) {
        if (e && e.name === "AbortError") { say("저장 취소됨"); return; }
        fileHandle = null;
      }
    }
    dl(new Blob([text], { type: "application/json" }), "project.json");
    say("다운로드됨: project.json → 월페이퍼 폴더에 덮어쓰세요 (serve.py 로 열면 바로 저장돼요)" + finishLocal());
  };
  const copyText = async (btn, label, text) => {
    try { await navigator.clipboard.writeText(text); btn.textContent = "복사됨!"; }
    catch (e) { window.prompt("Ctrl+C 로 복사하세요", text); }
    setTimeout(() => { btn.textContent = label; }, 1500);
  };
  const btns = h("div", { class: "tp-btns" });
  const mk = (text, fn, strong) => { const b = h("button", { textContent: text }); if (strong) b.style.cssText = "background:#2f7d4f;border-color:#5fc98a;font-weight:bold"; b.onclick = () => fn(b); btns.append(b); };
  mk("project.json 저장", saveProject, true);
  mk("복사", (b) => copyText(b, "복사", JSON.stringify(buildProjectJson(values), null, 2)));
  mk("전체 초기화", () => { try { localStorage.removeItem(PROJECT.storeKey); } catch (e) {} location.reload(); });
  box.append(btns, status);

  window.addEventListener("keydown", (e) => {
    if ((e.key === "h" || e.key === "H") && !(e.target && e.target.type === "number")) box.style.display = box.style.display === "none" ? "" : "none";
  });

  document.head.append(css);
  document.body.appendChild(box);
}, 1500);


// ════════════════════════════════════════════════════════════════════
//  이펙트: 쓰다듬기 → 하트(♥), 때리기 → 별(★)
//  화면 위에 별도의 2D 캔버스를 얹어서 그림 (이미지 파일 필요 없음)
// ════════════════════════════════════════════════════════════════════
const EFFECT = {
  enabled: true,
  heart: { interval: 110, count: 1, color: '#ff5c8a', outline: '#ffffff', size: [14, 26], life: [0.9, 1.5], rise: [70, 130] },
  star:  { count: 9, color: '#ffd93b', outline: '#ffffff', size: [14, 28], life: [0.55, 0.9], speed: [220, 460], gravity: 700 },
};

const fxParticles = [];
const fxCanvas = document.createElement('canvas');
fxCanvas.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:8';
document.body.appendChild(fxCanvas);
const fxCtx = fxCanvas.getContext('2d');
let fxRunning = false, fxLast = 0, fxHeartT = 0;

function fxResize() {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.round(window.innerWidth * dpr), h = Math.round(window.innerHeight * dpr);
  if (fxCanvas.width !== w || fxCanvas.height !== h) { fxCanvas.width = w; fxCanvas.height = h; }
}
const fxRand = (r) => r[0] + Math.random() * (r[1] - r[0]);
const fxScale = () => Math.max(0.6, window.innerHeight / 1080 * 1.2);   // 화면 크기에 맞춰 이펙트 크기 보정

// 화면 좌표(x, y)가 머리 바운딩박스(확장 전 원래 크기) 안인지 확인
function fxInHeadBox(ch, x, y) {
  try {
    const w = toWorld({ clientX: x, clientY: y });
    for (let i = 0; i < ch.hitPolys.length; i++) {
      if (ch.hitNames[i].includes(BOX.head) && ch.bounds.containsPointPolygon(ch.hitPolys[i], w.x, w.y)) return true;
    }
  } catch (e) {}
  return false;
}

function emitHearts(ch, x, y, now) {
  if (!EFFECT.enabled || !settings.fx.effect_heart_on || now - fxHeartT < EFFECT.heart.interval) return;
  if (!fxInHeadBox(ch, x, y)) return;                 // 원래 크기 박스 바깥에서는 생성 안 함
  fxHeartT = now;
  const H = EFFECT.heart, k = fxScale();
  for (let i = 0; i < H.count; i++) {
    fxParticles.push({
      type: 'heart', x: x + (Math.random() - 0.5) * 70 * k, y: y - 20 * k + (Math.random() - 0.5) * 30 * k,
      vx: 0, vy: -fxRand(H.rise) * k, sway: Math.random() * 6.28, swayAmp: (10 + Math.random() * 20) * k,
      rot: (Math.random() - 0.5) * 0.5, vr: 0, size: fxRand(H.size) * k,
      age: 0, life: fxRand(H.life), color: H.color, outline: H.outline,
    });
  }
  fxStart();
}

function emitStars(x, y) {
  if (!EFFECT.enabled || !settings.fx.effect_star_on) return;
  const S = EFFECT.star, k = fxScale();
  for (let i = 0; i < S.count; i++) {
    const a = (i / S.count) * Math.PI * 2 + Math.random() * 0.5, sp = fxRand(S.speed) * k;
    fxParticles.push({
      type: 'star', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120 * k,
      rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 12, size: fxRand(S.size) * k,
      age: 0, life: fxRand(S.life), color: S.color, outline: S.outline, g: S.gravity * k,
    });
  }
  fxStart();
}

function fxHeartPath(c, s) {
  c.beginPath();
  c.moveTo(0, s * 0.9);
  c.bezierCurveTo(-s * 1.3, 0.0, -s * 0.8, -s * 0.9, 0, -s * 0.35);
  c.bezierCurveTo(s * 0.8, -s * 0.9, s * 1.3, 0.0, 0, s * 0.9);
  c.closePath();
}
function fxStarPath(c, r) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r, a = -Math.PI / 2 + i * Math.PI / 5;
    c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr);
  }
  c.closePath();
}

function fxStart() { if (!fxRunning) { fxRunning = true; fxLast = performance.now(); requestAnimationFrame(fxTick); } }

function fxTick(now) {
  const dt = Math.min((now - fxLast) / 1000, 0.05); fxLast = now;
  fxResize();
  const dpr = window.devicePixelRatio || 1, c = fxCtx;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
  c.setTransform(dpr, 0, 0, dpr, 0, 0);

  for (let i = fxParticles.length - 1; i >= 0; i--) {
    const p = fxParticles[i];
    p.age += dt;
    if (p.age >= p.life) { fxParticles.splice(i, 1); continue; }
    const t = p.age / p.life;
    if (p.type === 'heart') {
      p.y += p.vy * dt;
      p.x += Math.sin(p.sway + p.age * 5) * p.swayAmp * dt * 3;
    } else {
      p.vy += p.g * dt;
      const drag = Math.exp(-2.2 * dt); p.vx *= drag; p.vy *= drag;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    }
    const pop = t < 0.15 ? t / 0.15 : 1;                    // 처음에 톡 튀어나오는 느낌
    const sc = p.type === 'heart' ? (0.4 + 0.6 * pop) : (1 - t * 0.5) * (0.5 + 0.5 * pop);
    const alpha = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;       // 끝에서 서서히 사라짐
    c.save();
    c.translate(p.x, p.y); c.rotate(p.rot); c.globalAlpha = Math.max(0, alpha);
    c.lineJoin = 'round'; c.lineWidth = Math.max(2, p.size * 0.18);
    c.strokeStyle = p.outline; c.fillStyle = p.color;
    if (p.type === 'heart') fxHeartPath(c, p.size * sc); else fxStarPath(c, p.size * sc);
    c.stroke(); c.fill();
    c.restore();
  }
  if (fxParticles.length) requestAnimationFrame(fxTick);
  else { fxRunning = false; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, fxCanvas.width, fxCanvas.height); }
}

