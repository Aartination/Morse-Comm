(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var input = $("input");
  var output = $("output");
  var status = $("status");
  var keys = $("keys");
  var playBtn = $("play");

  var player = MorsePlayer.create();

  /* ---------- settings persistence ---------- */
  var defaults = { wpm: 15, freq: 600, draft: "" };

  function save(patch) {
    try { chrome.storage.local.set(patch); } catch (e) { /* ignore */ }
  }

  function applySettings(s) {
    $("wpm").value = s.wpm; $("wpm-val").textContent = s.wpm;
    $("freq").value = s.freq; $("freq-val").textContent = s.freq;
    if (s.draft) input.value = s.draft;
    convert();
  }

  /* ---------- conversion ---------- */
  function setStatus(msg, warn) {
    status.textContent = msg || "";
    status.classList.toggle("warn", !!warn);
  }

  function updateUI(isMorse) {
    $("input-label").innerHTML = '<span class="label-icon">▸</span> ' + (isMorse ? "MORSE SIGNAL" : "PLAINTEXT INPUT");
    $("output-label").innerHTML = '<span class="label-icon">▸</span> ' + (isMorse ? "DECODED PLAINTEXT" : "ENCODED SIGNAL");
    input.style.letterSpacing = isMorse ? "1px" : "0";
    output.classList.toggle("is-text", isMorse);
  }

  function convert() {
    player.stop();
    resetPlayBtn();
    var text = input.value;
    save({ draft: text });

    if (!text.trim()) { output.value = ""; setStatus(""); updateUI(false); return; }

    var isMorse = Morse.looksLikeMorse(text);
    updateUI(isMorse);

    var r = isMorse ? Morse.morseToText(text) : Morse.textToMorse(text);
    output.value = r.result;

    if (r.unknown.length) {
      setStatus(!isMorse
        ? "Skipped: " + r.unknown.join(" ")
        : r.unknown.length + " unknown code" + (r.unknown.length > 1 ? "s" : "") + " shown as ?", true);
    } else {
      setStatus("");
    }
  }

  /* ---------- playback ---------- */
  function resetPlayBtn() {
    playBtn.textContent = "▶ TRANSMIT";
    playBtn.classList.remove("playing");
  }

  function currentMorse() {
    // In Morse->English mode the Morse is the input; otherwise it is the output.
    var isMorse = Morse.looksLikeMorse(input.value);
    return isMorse ? input.value : output.value;
  }

  playBtn.addEventListener("click", function () {
    if (player.isPlaying()) { player.stop(); resetPlayBtn(); return; }
    var morse = currentMorse();
    if (!morse.trim()) { setStatus("Nothing to play", true); return; }
    playBtn.textContent = "■ ABORT";
    playBtn.classList.add("playing");
    player.play(morse, {
      wpm: +$("wpm").value,
      freq: +$("freq").value,
      onEnd: resetPlayBtn
    });
  });

  /* ---------- buttons ---------- */
  $("copy").addEventListener("click", function () {
    if (!output.value) { setStatus("Nothing to copy", true); return; }
    navigator.clipboard.writeText(output.value).then(
      function () { setStatus("Copied"); setTimeout(function () { setStatus(""); }, 1200); },
      function () { output.select(); document.execCommand("copy"); setStatus("Copied"); }
    );
  });

  $("clear").addEventListener("click", function () {
    input.value = ""; output.value = ""; setStatus("");
    player.stop(); resetPlayBtn(); save({ draft: "" });
    input.focus();
  });

  $("swap").addEventListener("click", function () {
    input.value = output.value;
    convert();
  });

  // Tabs removed
  input.addEventListener("input", convert);

  // On-screen dot/dash keypad for Morse input
  keys.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var k = b.getAttribute("data-k");
    if (k === "back") input.value = input.value.slice(0, -1);
    else input.value += k;
    input.focus();
    convert();
  });

  // Pull whatever the user has selected on the active page
  $("grab").addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs && tabs[0];
      if (!tab || !tab.id) { setStatus("No active tab", true); return; }
      chrome.scripting.executeScript(
        { target: { tabId: tab.id, allFrames: true }, func: function () { return String(window.getSelection()); } },
        function (results) {
          if (chrome.runtime.lastError || !results) {
            setStatus("Can't read this page", true);
            return;
          }
          var sel = "";
          for (var i = 0; i < results.length; i++) {
            if (results[i] && results[i].result && results[i].result.trim()) { sel = results[i].result.trim(); break; }
          }
          if (!sel) { setStatus("Select some text on the page first", true); return; }
          input.value = sel;
          convert();
          setStatus("Loaded selection");
        }
      );
    });
  });

  /* ---------- sliders ---------- */
  $("wpm").addEventListener("input", function (e) {
    $("wpm-val").textContent = e.target.value; save({ wpm: +e.target.value });
  });
  $("freq").addEventListener("input", function (e) {
    $("freq-val").textContent = e.target.value; save({ freq: +e.target.value });
  });

  /* ---------- live clock ---------- */
  function tickClock() {
    var ts = $("timestamp");
    if (ts) {
      var d = new Date();
      var pad = function(n) { return n < 10 ? '0' + n : '' + n; };
      ts.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + ' UTC+' + (-(d.getTimezoneOffset()/60));
    }
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- boot ---------- */
  try {
    chrome.storage.local.get(defaults, applySettings);
  } catch (e) {
    applySettings(defaults);
  }
})();

/* ═══════════════════════════════════════════════════
   HINDI TRANSLATOR — SIDE PANEL LOGIC
   ═══════════════════════════════════════════════════ */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var toggle = $("hindi-toggle");
  var panel = $("hindi-panel");
  var closeBtn = $("hindi-close");
  var hindiInput = $("hindi-input");
  var hindiOutput = $("hindi-output");
  var translateBtn = $("hindi-translate");
  var copyBtn = $("hindi-copy");
  var clearBtn = $("hindi-clear");
  var swapBtn = $("hindi-swap");
  var statusEl = $("hindi-status");

  var direction = "en|hi"; // "en|hi" or "hi|en"

  function setHindiStatus(msg, type) {
    statusEl.textContent = msg || "";
    statusEl.className = "hindi-status" + (type ? " " + type : "");
  }

  function updateLabels() {
    var isEnToHi = direction === "en|hi";
    $("hindi-input-label").innerHTML = '<span class="label-icon">▸</span> ' +
      (isEnToHi ? "ENGLISH INPUT" : "हिंदी INPUT");
    $("hindi-output-label").innerHTML = '<span class="label-icon">▸</span> ' +
      (isEnToHi ? "हिंदी OUTPUT" : "ENGLISH OUTPUT");
    hindiInput.placeholder = isEnToHi ? "TYPE ENGLISH TEXT…" : "हिंदी टेक्स्ट टाइप करें…";
    hindiOutput.placeholder = isEnToHi ? "अनुवाद यहां दिखेगा…" : "TRANSLATION APPEARS HERE…";
  }

  // Toggle panel visibility
  toggle.addEventListener("click", function () {
    var isOpen = !panel.hidden;
    panel.hidden = isOpen;
    toggle.classList.toggle("active", !isOpen);
  });

  closeBtn.addEventListener("click", function () {
    panel.hidden = true;
    toggle.classList.remove("active");
  });

  // Translation via MyMemory API (free, no key needed)
  function translateText() {
    var text = hindiInput.value.trim();
    if (!text) {
      hindiOutput.value = "";
      setHindiStatus("");
      return;
    }

    setHindiStatus("⚡ TRANSLATING…");
    translateBtn.classList.add("loading");

    var url = "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(text) + "&langpair=" + direction;

    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        translateBtn.classList.remove("loading");
        if (data.responseStatus === 200 && data.responseData) {
          hindiOutput.value = data.responseData.translatedText;
          setHindiStatus("✓ TRANSLATION COMPLETE", "ok");
          setTimeout(function () { setHindiStatus(""); }, 2000);
        } else {
          setHindiStatus("⚠ TRANSLATION FAILED", "error");
        }
      })
      .catch(function () {
        translateBtn.classList.remove("loading");
        setHindiStatus("⚠ NETWORK ERROR — CHECK CONNECTION", "error");
      });
  }

  translateBtn.addEventListener("click", translateText);

  // Auto-translate with debounce
  var debounceTimer;
  hindiInput.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(translateText, 600);
  });

  // Swap direction
  swapBtn.addEventListener("click", function () {
    direction = direction === "en|hi" ? "hi|en" : "en|hi";
    var oldOutput = hindiOutput.value;
    hindiOutput.value = "";
    hindiInput.value = oldOutput;
    updateLabels();
    if (oldOutput) translateText();
  });

  // Copy
  copyBtn.addEventListener("click", function () {
    if (!hindiOutput.value) { setHindiStatus("NOTHING TO EXTRACT", "error"); return; }
    navigator.clipboard.writeText(hindiOutput.value).then(
      function () { setHindiStatus("✓ COPIED TO CLIPBOARD", "ok"); setTimeout(function () { setHindiStatus(""); }, 1500); },
      function () { setHindiStatus("⚠ COPY FAILED", "error"); }
    );
  });

  // Clear
  clearBtn.addEventListener("click", function () {
    hindiInput.value = "";
    hindiOutput.value = "";
    setHindiStatus("");
    hindiInput.focus();
  });

  updateLabels();
})();
