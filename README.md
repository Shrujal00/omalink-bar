# Omalink for the Omarchy bar

A phone icon for the Omarchy bar, for use with
[Omalink](https://github.com/Shrujal00/omalink), the Android phone companion for
Omarchy.

- Bright when your phone is connected, dim when it isn't.
- Shows the number of unread texts, and lights up during a call.
- Hover for the phone's name and battery. Click to open Omalink.

It reads the small status file Omalink keeps in `$XDG_RUNTIME_DIR/omalink/`.
It makes no network requests and runs no commands except `omalink` when
clicked.

## Install

```sh
omarchy plugin add https://github.com/Shrujal00/omalink-bar.git --enable
```

Omalink itself has to be installed for the icon to do anything.

## Develop

```sh
node tests/model.test.mjs
omarchy plugin validate .
```

MIT.
