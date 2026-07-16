// MasterChess Quick Play — MV3 service worker.
// Adds a right-click "Analyze on MasterChess" for selected FEN strings.

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "mc-analyze-fen",
    title: "Analyze FEN on MasterChess",
    contexts: ["selection"],
  });
  chrome.contextMenus.create({
    id: "mc-play-now",
    title: "Play chess now on MasterChess",
    contexts: ["page", "action"],
  });
});

const FEN_REGEX = /^([rnbqkpRNBQKP1-8]+\/){7}[rnbqkpRNBQKP1-8]+ [wb] (-|[KQkq]+) (-|[a-h][36]) \d+ \d+/;

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "mc-analyze-fen" && info.selectionText) {
    const fen = info.selectionText.trim();
    const isFen = FEN_REGEX.test(fen);
    const url = isFen
      ? `https://masterchess.live/analysis?fen=${encodeURIComponent(fen)}&utm_source=chrome_ext&utm_medium=context_menu`
      : `https://masterchess.live/analysis?utm_source=chrome_ext&utm_medium=context_menu`;
    chrome.tabs.create({ url });
  } else if (info.menuItemId === "mc-play-now") {
    chrome.tabs.create({
      url: "https://masterchess.live/play-guest?utm_source=chrome_ext&utm_medium=context_menu",
    });
  }
});
