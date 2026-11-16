import QtQuick
import Quickshell
import Quickshell.Io
import qs.Commons
import qs.Commons as Commons
import qs.Ui
import "Model.js" as Model

// A phone in the bar. Bright when the phone is connected, dim when it isn't,
// highlighted when there is an unread text or a call. Click opens Omalink.
//
// It reads the one-line status file the Omalink app keeps up to date, so it
// costs nothing while nothing changes and makes no network or D-Bus calls.
BarWidget {
  id: root
  moduleName: "omalink.bar"

  property var phone: Model.parse("")
  readonly property string statusPath: (Quickshell.env("XDG_RUNTIME_DIR") || "/tmp") + "/omalink/status.json"

  readonly property string tooltip: {
    if (!phone.running) return strings.t("bar.notRunning")
    if (!phone.linked) return strings.t("bar.noPhone")
    var name = phone.name || strings.t("bar.phone")
    if (!phone.connected) return strings.t("bar.disconnected").arg(name)
    if (phone.call === "incoming") return strings.t("bar.incoming").arg(name)
    if (phone.call !== "idle") return strings.t("bar.onCall").arg(name)
    var parts = [phone.battery >= 0
      ? strings.t("bar.connectedBattery").arg(name).arg(Commons.I18n.formatNumber(phone.battery, 0))
      : strings.t("bar.connected").arg(name)]
    if (phone.unread > 0) parts.push(strings.tn("bar.unread", phone.unread).arg(Commons.I18n.formatNumber(phone.unread, 0)))
    return parts.join("  ·  ")
  }

  implicitWidth: button.implicitWidth
  implicitHeight: button.implicitHeight

  Commons.Translations { id: strings; directory: Qt.resolvedUrl("i18n") }

  FileView {
    id: file
    path: root.statusPath
    watchChanges: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: root.phone = Model.parse(text())
    onLoadFailed: root.phone = Model.parse("")
  }

  // The file doesn't exist until Omalink first runs, and a watch on a missing
  // file never fires; a slow look covers that without costing anything.
  Timer {
    interval: 20000
    running: true
    repeat: true
    onTriggered: file.reload()
  }

  BarIconButton {
    id: button
    anchors.fill: parent
    bar: root.bar
    text: "󰄜"
    labelText: root.phone.connected && root.phone.unread > 0 ? Commons.I18n.formatNumber(root.phone.unread, 0) : ""
    active: root.phone.connected && (root.phone.unread > 0 || root.phone.call !== "idle")
    opacity: root.phone.connected ? 1 : 0.45
    tooltipText: root.tooltip
    Behavior on opacity { NumberAnimation { duration: Style.duration(180); easing.type: Easing.OutCubic } }

    onPressed: function(b) {
      if (!root.bar) return
      // Starting Omalink again raises the window it already has.
      root.bar.run("omalink")
    }
  }
}
