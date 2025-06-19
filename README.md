# SFS – The Simplest (and still-kinda-dumb) File Server

Zero dependencies. Zero ceremony. All the power of Node’s core modules, with none of the *NPM guilt*.

---

## 🧐 About

* **Flat-file only**
  * Every request is reduced to its **basename**, so `GET /foo/bar/baz.txt` → `GET /baz.txt`.
  * This is done **post** URL-decode, and with only the `pathname` URL component.
  * No *exotic* sub-dirs, no funny business.

* **GET & HEAD**

  * `GET` streams your file in tiny 64 KB chunks (no more “OOM” surprises).
  * `HEAD` sends only headers (including `Content-Length`), then bails.

* **Built-in DoS guards**

  * **Keep-alive timeout** (`ALIVE` sec) kills idle sockets.
  * **Headers timeout** (`TIMEOUT` min) slays Slowloris.

* **Logging**
  Each successful send logs:

  ```
   [HTTP] Served: <filename> => <client-IP>
  ```

---

## ⚙️ ENV

| Variable    | Default       | What it does                            |
| ----------- | ------------- | --------------------------------------- |
| `IP`        | `0.0.0.0`     | The address to listen on                |
| `PORT`      | `3001`        | The port to listen on                   |
| `DIRECTORY` | `$PWD/public` | Folder to serve (must exist & be a dir) |
| `ALIVE`     | `5`           | **Keep-alive** timeout in **seconds**   |
| `TIMEOUT`   | `1`           | **Headers** timeout in **minutes**      |

---

## 🚀 Quickstart

```bash
# clone or drop server.mjs into your project

# defaults: serve ./public on 0.0.0.0:3001
node server.mjs

# override dir & port:
DIRECTORY=../static_files PORT=8080 node server.mjs

# tweak timeouts (in seconds/minutes):
ALIVE=2 TIMEOUT=5 node server.mjs
```

---

## 🔒 Security-Conscious Pick-Me-Ups

By default, every file is served with **no** `Content-Type` header. That means browsers will likely sniff for the `Content-Type`, which is potentially dangerous if **you** put dangerous files in that directory...or expose the directory to the public somehow (*don't* do that).

If you’d rather let browsers do their magic **SAFELY** (render images, show text, etc.), just:

1. `npm install mime`
2. Uncomment these lines in the code (see the commented section in `sfs.mjs`):

   ```js
   // * set this at the top of the file * //
   import mime from 'mime';

   // * set these under "res.setHeader('Content-Length', stat.size);" * //
   res.setHeader('Content-Type', mime.getType(filePath) || 'application/octet-stream');
   res.setHeader('X-Content-Type-Options', 'nosniff');
   ```

Voilà! Your files now sport the correct MIME types **and** remain protected from potential sniff-based XSS.

---

## 🚧 Caveats & Gotchas

* **No nested directories**
  * This is by design—if you need subfolders, grab a real static server.
* **Race conditions**
  * We do a quick check→stat→stream; a sneaky symlink swap is *theoretically* possible, but hey, your shared folder lives behind SSH+VPN+2FA, right?
* **No caching or Range support**
  * If you need byte-ranges, ETags, or fancy cache headers—time to graduate to something more full-featured.

---

## 🪙 Credits

* *README.md* by **ChatGPT (o4-mini-high)** because I'm insanely lazy.
* *The rest by me*, enjoy the trash-bin fire.

---

**Go forth and serve files with the reckless simplicity you deserve!** 🚀📂💥
