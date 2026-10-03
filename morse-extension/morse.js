/* Morse engine: shared by the popup, the background worker and the page overlay.
   Works in browsers (attaches to globalThis.Morse) and in Node (module.exports). */
(function (root) {
  "use strict";

  var CHARS = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
    I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
    Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..",
    "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
    "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
    ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
    "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
    ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
    "\"": ".-..-.", "$": "...-..-", "@": ".--.-."
  };

  var REVERSE = {};
  Object.keys(CHARS).forEach(function (k) { REVERSE[CHARS[k]] = k; });

  // Normalise the many dash/dot look-alikes people paste in.
  function normaliseMorse(s) {
    return String(s)
      .replace(/[•·∙●]/g, ".")          // bullets -> dot
      .replace(/[‒–—―−─_]/g, "-") // dashes -> dash
      .replace(/\r\n?/g, "\n");
  }

  /** English -> Morse. Letters separated by a space, words by " / ". */
  function textToMorse(text) {
    var unknown = [];
    var words = String(text).toUpperCase().split(/\s+/).filter(Boolean);
    var out = words.map(function (word) {
      // Strip accents so "café" -> "CAFE".
      var plain = word.normalize("NFD").replace(/[̀-ͯ]/g, "");
      var letters = [];
      for (var i = 0; i < plain.length; i++) {
        var ch = plain[i];
        if (CHARS[ch]) letters.push(CHARS[ch]);
        else if (unknown.indexOf(ch) === -1) unknown.push(ch);
      }
      return letters.join(" ");
    }).filter(Boolean);
    return { result: out.join(" / "), unknown: unknown };
  }

  /** Morse -> English. Accepts "/" or 3+ spaces or a newline as a word break. */
  function morseToText(morse) {
    var unknown = [];
    var cleaned = normaliseMorse(morse).trim();
    if (!cleaned) return { result: "", unknown: unknown };

    var words = cleaned.split(/\s*\/\s*|\s{3,}|\n+/).filter(function (w) { return w.trim(); });
    var out = words.map(function (word) {
      return word.trim().split(/\s+/).map(function (code) {
        if (REVERSE[code]) return REVERSE[code];
        unknown.push(code);
        return "?";
      }).join("");
    });
    return { result: out.join(" "), unknown: unknown };
  }

  /** Looks like Morse if the text is only dots, dashes, slashes and whitespace. */
  function looksLikeMorse(s) {
    var t = normaliseMorse(s).trim();
    return t.length > 0 && /^[.\-\/\s]+$/.test(t) && /[.\-]/.test(t);
  }

  /**
   * Build a timeline of tone/silence segments for playback.
   * Standard timing: dot = 1 unit, dash = 3, gap in a letter = 1,
   * gap between letters = 3, gap between words = 7.
   * Returns [{on: bool, units: n}, ...]
   */
  function toTimeline(morse) {
    var tl = [];
    var m = normaliseMorse(morse).trim();
    var words = m.split(/\s*\/\s*|\s{3,}|\n+/).filter(function (w) { return w.trim(); });
    words.forEach(function (word, wi) {
      if (wi > 0) tl.push({ on: false, units: 7 });
      var letters = word.trim().split(/\s+/);
      letters.forEach(function (letter, li) {
        if (li > 0) tl.push({ on: false, units: 3 });
        for (var i = 0; i < letter.length; i++) {
          var c = letter[i];
          if (c !== "." && c !== "-") continue;
          if (i > 0) tl.push({ on: false, units: 1 });
          tl.push({ on: true, units: c === "." ? 1 : 3 });
        }
      });
    });
    return tl;
  }

  var api = {
    CHARS: CHARS,
    textToMorse: textToMorse,
    morseToText: morseToText,
    looksLikeMorse: looksLikeMorse,
    toTimeline: toTimeline,
    normaliseMorse: normaliseMorse
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Morse = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
