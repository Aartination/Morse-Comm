importScripts("morse.js");

var MENU_ID = "morse-convert-selection";

function setupMenu() {
  chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Morse Translator: convert “%s”",
      contexts: ["selection"]
    });
  });
}

chrome.runtime.onInstalled.addListener(setupMenu);
chrome.runtime.onStartup.addListener(setupMenu);

/** Inject the engine + overlay into the tab, then hand it the text. */
function showOverlay(tabId, text) {
  chrome.scripting.executeScript(
    { target: { tabId: tabId }, files: ["morse.js", "player.js", "overlay.js"] },
    function () {
      if (chrome.runtime.lastError) return; // e.g. chrome:// pages
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: function (t) { window.__morseOverlay && window.__morseOverlay.show(t); },
        args: [text]
      });
    }
  );
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === MENU_ID && tab && tab.id && info.selectionText) {
    showOverlay(tab.id, info.selectionText);
  }
});

chrome.commands.onCommand.addListener(function (command) {
  if (command !== "convert-selection") return;
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs && tabs[0];
    if (!tab || !tab.id) return;
    chrome.scripting.executeScript(
      { target: { tabId: tab.id }, func: function () { return String(window.getSelection()); } },
      function (results) {
        if (chrome.runtime.lastError || !results || !results[0]) return;
        var sel = (results[0].result || "").trim();
        if (sel) showOverlay(tab.id, sel);
      }
    );
  });
});
