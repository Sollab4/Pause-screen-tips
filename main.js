
class TipsConfig extends FormApplication {
  static get defaultOptions() {
  return mergeObject(super.defaultOptions, {
    id: "tips-config",
    title: "Configuration des Conseils",
    template: "modules/pause-screen-tips/tips-config.html",
    width: 700,
    height: 600,
    resizable: true
    });
  }

  getData() {
    return {
      tips: game.settings.get("pause-screen-tips", "tips")
    };
  }

  async _updateObject(event, formData) {
    const tips = Object.values(formData).filter(t => t.trim());
    await game.settings.set("pause-screen-tips", "tips", tips);
  }
}

Hooks.once("init", function () {
  game.settings.register("pause-screen-tips", "tips", {
    name: "Conseils",
    scope: "world",
    config: false,
    type: Array,
    default: ["Conseil 1", "Conseil 2"]
  });

  game.settings.registerMenu("pause-screen-tips", "tipsMenu", {
    name: "Modifier les conseils",
    label: "Ouvrir l’éditeur",
    icon: "fas fa-book",
    type: TipsConfig,
    restricted: true
  });

  game.settings.register("pause-screen-tips", "delay", {
    name: "Délai entre conseils (ms)",
    scope: "world",
    config: true,
    type: Number,
    default: 5000
  });
});

let tipInterval = null;

Hooks.on("pauseGame", function (paused) {
  if (paused) showTips();
  else hideTips();
});

function showTips() {
  const overlay = document.createElement("div");
  overlay.id = "loading-screen-overlay";
  overlay.innerHTML = `
    <div id="tip-box"><span id="loading-screen-tip"></span></div>
  `;
  document.body.appendChild(overlay);
  cycleTips();
}

function hideTips() {
  const el = document.getElementById("loading-screen-overlay");
  if (el) el.remove();
  if (tipInterval) clearInterval(tipInterval);
}

function cycleTips() {
  const tips = game.settings.get("pause-screen-tips", "tips");
  const delay = game.settings.get("pause-screen-tips", "delay");
  const tipBox = document.getElementById("pause-screen-tips");

  function updateTip() {
    const tip = tips[Math.floor(Math.random() * tips.length)];
    tipBox.textContent = tip;
    game.socket.emit("module.pause-screen-tips", tip);
  }

  updateTip();
  tipInterval = setInterval(updateTip, delay);

  game.socket.on("module.pause-screen-tips", (tip) => {
    tipBox.textContent = tip;
  });
}
