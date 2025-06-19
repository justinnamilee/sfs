import { createServer } from 'http';
import { existsSync, statSync, createReadStream } from 'fs';
import { resolve, join, basename } from 'path';
import { URL } from 'url';

const directory = resolve(process.env.DIRECTORY || 'public');
const alive = (process.env.ALIVE || 5) * 1000;
const timeout = (process.env.TIMEOUT || 1) * 60 * 1000;

if (existsSync(directory) && statSync(directory).isDirectory()) {
  const server = createServer((req, res) => {
    if (['HEAD', 'GET'].includes(req.method)) {
      let file;

      try {
        file = basename(
          decodeURIComponent((new URL(`http://${req.headers.host}${req.url}`)).pathname)
        );
      } catch (err) {
        res.statusCode = 400;
        res.end();
      }

      if (typeof file !== 'undefined') {
        let filePath = join(directory, file);

        if (existsSync(filePath)) {
          const stat = statSync(filePath);

          if (stat.isFile()) {
            res.statusCode = 200;
            res.setHeader('Content-Length', stat.size);

            //!! if you want more security (from yourself)
            // import mime from 'mime'; // after doing 'npm install mime'
            // ... ^ add this to top of file, ... v add these here
            // res.setHeader('Content-Type', mime.getType(filePath) || 'application/octet-stream');
            // res.setHeader('X-Content-Type-Options', 'nosniff');
            //!! end of important security things

            if (req.method === 'GET') {
              const stream = createReadStream(filePath);

              stream.on('error', (err) => {
                if (!res.headersSent) {
                  res.statusCode = 500;
                  res.end();
                } else {
                  res.destroy();
                }
              });

              stream.pipe(res);

              res.on('finish', () => {
                let remote = (
                  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? req.socket.remoteAddress
                ).replace(/^::ffff:/, '');

                console.log(` [HTTP] Served: ${file} => ${remote}`);
              });
            } else {
              res.end();
            }
          } else {
            res.statusCode = 400;
            res.end();
          }
        } else {
          res.statusCode = 404;
          res.end();
        }
      }
    } else {
      res.statusCode = 405;
      res.end();
    }
  });

  server.keepAliveTimeout = alive;
  server.headersTimeout = timeout;

  server.listen((process.env.PORT || 3001), (process.env.IP || '0.0.0.0'), () => {
    const addr = server.address();
    console.log(` [INFO] Serving: ${directory}`);
    console.log(` [INFO] Listening: ${addr.address}:${addr.port}`);
  });
} else {
  console.log(`[ERROR] No such directory: ${directory}`);
}
