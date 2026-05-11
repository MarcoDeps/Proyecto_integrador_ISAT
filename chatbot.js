(function () {
  var el = document.getElementById('chatbot-placeholder');
  if (!el) return;
  el.innerHTML = `
    <button id="netbot-btn" onclick="toggleNetBot()" title="Chatear con NetBot">
      <svg viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
      </svg>
    </button>
    <div id="netbot-window">
      <div id="netbot-header">
        <div class="info">
          <div class="avatar">🎮</div>
          <div>
            <div class="name">NetBot</div>
            <div class="status">● Disponible 24/7</div>
          </div>
        </div>
        <button id="netbot-close" onclick="toggleNetBot()">&times;</button>
      </div>
      <div id="netbot-messages">
        <div class="netbot-msg bot">¡Hola! 👋</div>
        <div class="netbot-msg bot">Soy NetBot, el asistente de NetCraft Computer Store. ¿En qué te puedo ayudar hoy?</div>
      </div>
      <div id="netbot-typing">NetBot está escribiendo...</div>
      <div id="netbot-input-area">
        <input id="netbot-input" type="text" placeholder="Escríbeme lo que necesitas..." onkeydown="if(event.key==='Enter')sendNetBotMsg()" />
        <button id="netbot-send" onclick="sendNetBotMsg()">
          <svg viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  `;
})();

const NETBOT_WEBHOOK = "https://paneln8n.serviciosatumedidapro.com/webhook/3730d8bd-2059-48b9-a450-bfa589295b74/chat";
let netbotSession = "session_" + Math.random().toString(36).substr(2, 9);
let netbotOpen = false;

function toggleNetBot() {
  netbotOpen = !netbotOpen;
  var win = document.getElementById("netbot-window");
  if (!win) return;
  win.classList.toggle("open", netbotOpen);
  if (netbotOpen) {
    var input = document.getElementById("netbot-input");
    if (input) input.focus();
  }
}

function addNetBotMsg(text, role) {
  var box = document.getElementById("netbot-messages");
  if (!box) return;
  var div = document.createElement("div");
  div.className = "netbot-msg " + role;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

async function sendNetBotMsg() {
  var input = document.getElementById("netbot-input");
  if (!input) return;
  var text = input.value.trim();
  if (!text) return;

  input.value = "";
  addNetBotMsg(text, "user");

  var typing = document.getElementById("netbot-typing");
  if (typing) typing.style.display = "block";

  try {
    var res = await fetch(NETBOT_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sendMessage",
        sessionId: netbotSession,
        chatInput: text,
      }),
    });
    var data = await res.json();
    if (typing) typing.style.display = "none";
    var reply = data.output || data.text || data.message || "Sin respuesta del servidor.";
    addNetBotMsg(reply, "bot");
  } catch (e) {
    if (typing) typing.style.display = "none";
    addNetBotMsg("Ups, hubo un error de conexi\u00f3n. Intenta de nuevo 🙏", "bot");
  }
}
