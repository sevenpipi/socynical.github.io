// 基于LRC格式的时间戳解析与歌词同步显示

const rawLyrics = `
[00:00.000] 
[00:00.001]Ba-ba-ba-ba-ba-ba-ba-ba-dum 
[00:09.702]모른 척해 유난이야 넌 왜 
[00:13.440]우린 어느새 
[00:15.261]심장이 뛰는데 
[00:16.941]That L-O-V-E 말로만 들었지 
[00:21.149]사랑은 Fictional 
[00:23.129]이럴 줄은 몰랐어 
[00:24.929]한 손으론 Tapping on it twice 
[00:26.886]표정은 왜 Try to hide 
[00:28.768]좋아요 그 세글자의 말 
[00:30.425]말로 하면 So uncool 
[00:32.506]서둘러 다 놓치기 전에 
[00:34.445]때론 과감한 게 나아 
[00:36.328]의심하지 마 
[00:36.970]You and I, right this moment 
[00:39.090]I want your lo-lo-lo-loving 
[00:41.521]아닌 척 좀 그만하자 
[00:43.807]Wa-wa-wa-want it 서로가 원하잖아 
[00:47.147]That ba-ba-ba-ba-ba-ba-ba-ba-dum 
[00:51.228]Ba-ba-ba-ba-ba-ba-ba-ba-dum 
[00:54.185]심장은 Kno-no-no-nocking 
[00:56.664]네게도 들리잖아 
[00:58.507]너 Lo-lo-lo-loving 
[01:00.403]그만 두려워하자 
[01:02.300]Like ba-ba-ba-ba-ba-ba-ba-ba-dum 
[01:06.307]Ba-ba-ba-ba-ba-ba-ba-ba-dum 
[01:10.100]Replay old days 그땐 나도 So afraid 
[01:13.868]다칠까 봐 닫힌 내 심장은 So blue 
[01:17.661]너도 Time to make a choice 
[01:19.543]결정 앞에 Don't avoid 
[01:21.440]딴청 피우지 말고 
[01:22.860]What you waiting for? 
[01:25.202]Cool한 사이를 좋아하지만 
[01:27.349]너랑은 아니란 말야 
[01:29.187]좋아요 그 세글자의 말 
[01:30.906]말로 하면 So uncool 
[01:33.008]서둘러 다 놓치기 전에 
[01:34.926]때론 과감한 게 나아 
[01:36.766]의심하지 마 You and I 
[01:38.446]Right this moment 
[01:39.606]I want your lo-lo-lo-loving 
[01:41.984]아닌 척 좀 그만하자 
[01:44.313]Wa-wa-wa-want it 서로가 원하잖아 
[01:47.624]That ba-ba-ba-ba-ba-ba-ba-ba-dum 
[01:51.680]Ba-ba-ba-ba-ba-ba-ba-ba-dum 
[01:54.687]심장은 Kno-no-no-nocking 
[01:57.105]네게도 들리잖아 너 
[01:59.441]Lo-lo-lo-loving 
[02:00.880]그만 두려워하자 
[02:02.783]Like ba-ba-ba-ba-ba-ba-ba-ba-dum 
[02:06.824]Ba-ba-ba-ba-ba-ba-ba-ba-dum 
[02:10.923]So cynical 
[02:12.505]이젠 그만할래 두려워 마 
[02:16.243]If your heart is beating 
[02:18.522]So cynical 망설이면 Too late 
[02:22.148]너 너와 Glowing 
[02:23.822]Ba-ba-ba-ba-ba-ba-ba-ba-dum`;

function parseLRC(raw) {
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const items = [];
  const rx = /^\[(\d{2}):(\d{2}\.\d{3})\]\s*(.*)$/;
  for (const line of lines) {
    const m = line.match(rx);
    if (!m) continue;
    const min = parseInt(m[1], 10);
    const sec = parseFloat(m[2]);
    const time = min * 60 + sec;
    const text = m[3].trim();
    items.push({ time, text });
  }
  items.sort((a, b) => a.time - b.time);
  return items;
}

function fmtTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const audio = document.getElementById("audio");
const overlay = document.getElementById("overlay");
const lyricEl = document.getElementById("lyric-line");
const timeEl = document.getElementById("timestamp");

const lyrics = parseLRC(rawLyrics);
let currentIndex = -1;

function showLine(idx) {
  const item = lyrics[idx];
  if (!item) return;
  // 触发过渡动画
  lyricEl.classList.remove("show");
  void lyricEl.offsetWidth; // 强制重排以重启动画
  lyricEl.textContent = item.text;
  lyricEl.classList.add("show");
  // timeEl.textContent = fmtTime(item.time);
  timeEl.textContent = "So Cynical";
}

function findIndexByTime(t) {
  if (!lyrics.length) return -1;
  // 初次或回退快进等情况
  if (currentIndex === -1 || t < lyrics[currentIndex].time) {
    let i = 0;
    while (i < lyrics.length && t >= lyrics[i].time) i++;
    return Math.max(0, i - 1);
  }
  // 正常向前推进
  let i = currentIndex;
  while (i + 1 < lyrics.length && t >= lyrics[i + 1].time) i++;
  return i;
}

function sync() {
  const t = audio.currentTime;
  const idx = findIndexByTime(t);
  if (idx !== currentIndex && idx >= 0) {
    currentIndex = idx;
    showLine(currentIndex);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // 一律显示 overlay，等待用户点击触发播放（兼容所有浏览器）
  overlay.classList.remove("hidden");
});

// 全屏功能函数
function enterFullscreen() {
  // 检测是否为iOS设备
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // iOS Safari不支持真正的全屏API，但可以隐藏地址栏
  if (isIOS) {
    // 在iOS上，滚动到顶部可以隐藏Safari的地址栏
    window.scrollTo(0, 1);
    setTimeout(() => window.scrollTo(0, 0), 100);
    return;
  }
  
  // 其他浏览器的全屏API
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { // Safari
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE11
    elem.msRequestFullscreen();
  } else if (elem.mozRequestFullScreen) { // Firefox
    elem.mozRequestFullScreen();
  }
}

overlay.addEventListener("click", () => {
  audio.muted = false;  // 恢复声音
  audio.play().then(() => {
    overlay.classList.add("hidden");
    setTimeout(enterFullscreen, 100);
  }).catch(err => console.log("播放失败:", err));
});

audio.addEventListener("loadedmetadata", () => {
  // 初始化显示
  currentIndex = findIndexByTime(audio.currentTime);
  if (currentIndex >= 0) showLine(currentIndex);
});

audio.addEventListener("timeupdate", sync);