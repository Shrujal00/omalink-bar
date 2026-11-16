// node tests/model.test.mjs
import { readFileSync } from "node:fs"
import assert from "node:assert/strict"

const source = readFileSync(new URL("../Model.js", import.meta.url), "utf8")
const Model = new Function(source + "; return { plain, count, parse }")()

// Not running, unreadable, or half-written: all the same thing.
for (const text of ["", "{", "null", "[]", '{"running":false}', '{"state":"connected"}'])
  assert.equal(Model.parse(text).running, false, text)

const ok = Model.parse(JSON.stringify({ running: true, state: "connected", name: "Pixel 9", battery: 78, charging: true, unread: 2, notifications: 4, call: "idle" }))
assert.deepEqual([ok.connected, ok.name, ok.battery, ok.charging, ok.unread, ok.call], [true, "Pixel 9", 78, true, 2, "idle"])

// A Bluetooth name is chosen by whoever owns the device: markup must not
// survive into the tooltip, and it must not be long.
const hostile = Model.parse(JSON.stringify({ running: true, state: "connected", name: '<img src="https://example.invalid/t">&<b>' + "x".repeat(500) }))
assert.ok(!/[<>]/.test(hostile.name), hostile.name)
assert.ok(hostile.name.startsWith("&lt;img"), hostile.name)
assert.ok(hostile.name.length <= 60 * 5)

// Numbers that aren't sensible numbers.
const odd = Model.parse(JSON.stringify({ running: true, state: "waiting", battery: 900, unread: -3, notifications: "many", call: "<b>" }))
assert.deepEqual([odd.connected, odd.battery, odd.unread, odd.notifications, odd.call], [false, -1, 0, 0, "idle"])
assert.equal(Model.count(1e12), 9999)

console.log("ok")
