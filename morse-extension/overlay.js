/* On-page result card. Injected on demand (no always-on content script),
   so the extension does not touch pages until the user asks. */
(function () {
  "use strict";
  if (window.__morseOverlay) return;

  var HOST_ID = "__morse_translator_host__";
  var player = MorsePlayer.create();
  var settings = { wpm: 15, freq: 600 };
  try {
    chrome.storage.local.get(settings, function (s) { if (s) settings = s; });
  } catch (e) { /* ignore */ }

  function remove() {
    player.stop();
    var old = document.getElementById(HOST_ID);
    if (old) old.remove();
  }

  function show(text) {
    remove();
    var isMorse = Morse.looksLikeMorse(text);
    var r = isMorse ? Morse.morseToText(text) : Morse.textToMorse(text);
    var morse = isMorse ? Morse.normaliseMorse(text).trim() : r.result;

    var host = document.createElement("div");
    host.id = HOST_ID;
    host.style.cssText = "all:initial;position:fixed;right:16px;bottom:16px;z-index:2147483647;";
    var root = host.attachShadow({ mode: "open" });

    root.innerHTML =
      '<style>' +
      ':host{all:initial}' +
      '.card{width:340px;max-height:60vh;overflow:auto;background:#0f1419;color:#e6edf3;border:1px solid #2a3441;' +
      'border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,.45);font:13px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:12px 14px}' +
      '.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}' +
      '.title{font-weight:650;color:#f5a524}' +
      '.x{background:none;border:0;color:#8b98a8;font-size:18px;cursor:pointer;line-height:1}' +
      '.x:hover{color:#fff}' +
      '.lbl{color:#8b98a8;font-size:11.5px;font-weight:600;margin:8px 0 3px}' +
      '.box{background:#171d25;border:1px solid #2a3441;border-radius:8px;padding:8px 10px;' +
      'font:13.5px/1.5 ui-monospace,Menlo,Consolas,monospace;word-break:break-word;white-space:pre-wrap}' +
      '.morse{color:#f5a524;letter-spacing:1px}' +
      '.warn{color:#ff6b6b;font-size:11.5px;margin-top:6px}' +
      '.row{display:flex;gap:8px;margin-top:10px}' +
      'button.b{flex:1;background:#171d25;border:1px solid #2a3441;color:#e6edf3;border-radius:8px;padding:7px 0;font:inherit;font-weight:600;cursor:pointer}' +
      'button.b:hover{border-color:#f5a524}' +
      'button.p{background:#f5a524;border-color:#f5a524;color:#1a1204}' +
      'button.p.on{background:#ff6b6b;border-color:#ff6b6b;color:#fff}' +
      '</style>' +
      '<div class="card" role="dialog" aria-label="Morse Translator">' +
      '<div class="top"><span class="title">' + (isMorse ? "Morse → English" : "English → Morse") + '</span>' +
      '<button class="x" aria-label="Close">×</button></div>' +
      '<div class="lbl">' + (isMorse ? "Morse" : "Selected text") + '</div><div class="box src"></div>' +
      '<div class="lbl">' + (isMorse ? "English" : "Morse") + '</div><div class="box out"></div>' +
      '<div class="warn" hidden></div>' +
      '<div class="row"><button class="b p play">▶ Play</button><button class="b copy">Copy</button></div>' +
      '</div>';

    var src = root.querySelector(".src");
    var out = root.querySelector(".out");
    var warn = root.querySelector(".warn");
    var play = root.querySelector(".play");
    var copy = root.querySelector(".copy");

    src.textContent = text.length > 600 ? text.slice(0, 600) + "…" : text;
    out.textContent = r.result || "(nothing to convert)";
    if (!isMorse) out.classList.add("morse");
    if (r.unknown.length) {
      warn.hidden = false;
      warn.textContent = isMorse
        ? r.unknown.length + " unknown code(s) shown as ?"
        : "Skipped unsupported characters: " + r.unknown.join(" ");
    }

    root.querySelector(".x").addEventListener("click", remove);

    function reset() { play.textContent = "▶ Play"; play.classList.remove("on"); }
    play.addEventListener("click", function () {
      if (player.isPlaying()) { player.stop(); reset(); return; }
      if (!morse) return;
      play.textContent = "■ Stop"; play.classList.add("on");
      player.play(morse, { wpm: settings.wpm, freq: settings.freq, onEnd: reset });
    });

    copy.addEventListener("click", function () {
      var val = r.result;
      if (!val) return;
      navigator.clipboard.writeText(val).then(function () {
        copy.textContent = "Copied";
        setTimeout(function () { copy.textContent = "Copy"; }, 1200);
      }, function () { copy.textContent = "Copy failed"; });
    });

    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") { remove(); document.removeEventListener("keydown", esc, true); }
    }, true);

    document.documentElement.appendChild(host);
  }

  window.__morseOverlay = { show: show, remove: remove };
})();
