/* Web Audio Morse player. Shared by the popup and the page overlay.
   Usage: const p = MorsePlayer.create(); p.play(morseString, {wpm, freq, onEnd}); p.stop(); */
(function (root) {
  "use strict";

  function create() {
    var ctx = null;
    var osc = null;
    var gain = null;
    var timer = null;
    var playing = false;

    function stop() {
      playing = false;
      if (timer) { clearTimeout(timer); timer = null; }
      try { if (osc) osc.stop(); } catch (e) { /* already stopped */ }
      try { if (osc) osc.disconnect(); } catch (e) { /* ignore */ }
      osc = null;
    }

    function play(morse, opts) {
      opts = opts || {};
      var wpm = Math.max(5, Math.min(40, opts.wpm || 15));
      var freq = Math.max(300, Math.min(1000, opts.freq || 600));
      var onEnd = opts.onEnd || function () {};
      var onTone = opts.onTone || function () {};

      stop();
      var timeline = root.Morse.toTimeline(morse);
      if (!timeline.length) { onEnd(); return; }

      var AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) { onEnd(); return; }
      if (!ctx) ctx = new AC();
      if (ctx.state === "suspended") ctx.resume();

      var unit = 1.2 / wpm; // PARIS standard: one unit = 1.2 / wpm seconds
      gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(ctx.destination);
      osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start();

      var t = ctx.currentTime + 0.05;
      var ramp = 0.005; // 5 ms ramp avoids clicks
      timeline.forEach(function (seg) {
        var dur = seg.units * unit;
        if (seg.on) {
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.6, t + ramp);
          gain.gain.setValueAtTime(0.6, t + dur - ramp);
          gain.gain.linearRampToValueAtTime(0, t + dur);
        }
        t += dur;
      });
      osc.stop(t + 0.05);
      playing = true;

      var totalMs = (t - ctx.currentTime) * 1000 + 80;
      timer = setTimeout(function () { stop(); onEnd(); }, totalMs);
      onTone();
    }

    return { play: play, stop: stop, isPlaying: function () { return playing; } };
  }

  root.MorsePlayer = { create: create };
})(typeof globalThis !== "undefined" ? globalThis : this);
