// Turns Omalink's status file into what the bar shows. Kept free of QML so it
// can be tested on its own (tests/model.test.mjs).

// The phone's name comes from Bluetooth, which is to say from anyone nearby.
// The bar's tooltip may render rich text, so markup is defused before the
// name goes anywhere near it, and it is kept short.
function plain(text) {
  return String(text === undefined || text === null ? "" : text)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .slice(0, 60)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function count(value) {
  var n = Math.floor(Number(value))
  return isFinite(n) && n > 0 ? Math.min(n, 9999) : 0
}

// Anything unreadable is the same as Omalink not running.
function parse(text) {
  var data = null
  try { data = JSON.parse(String(text || "")) } catch (e) { data = null }
  if (!data || typeof data !== "object" || data.running !== true)
    return { running: false, connected: false, name: "", battery: -1, charging: false, unread: 0, notifications: 0, call: "idle" }
  var battery = Math.floor(Number(data.battery))
  var call = ["incoming", "dialing", "active"].indexOf(data.call) >= 0 ? data.call : "idle"
  return {
    running: true,
    connected: data.state === "connected",
    linked: data.state !== "none",
    name: plain(data.name),
    battery: isFinite(battery) && battery >= 0 && battery <= 100 ? battery : -1,
    charging: data.charging === true,
    unread: count(data.unread),
    notifications: count(data.notifications),
    call: call
  }
}
