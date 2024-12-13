import { createServer } from 'http';
import { existsSync, statSync, readFile } from 'fs';
import { resolve } from 'path';

const server = createServer((req, res) => {
  let file = req.url.replace(/^.*[\/]/, ''); // kill the heretic
  let filePath = resolve(__dirname + '/public/' + decodeURI(file));

  if (existsSync(filePath) && statSync(filePath).isFile()) {
    readFile(filePath, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('');
      } else {
        res.end(data);
        console.log(`File ${filePath} sent.`);
      }
    });
  } else {
    res.statusCode = 404;
    res.end('');
  }
});

server.listen(process.env.PORT || 3001, process.env.IP || '0.0.0.0', () => {
  const addr = server.address();
  console.log(`Server listening at ${addr.address}:${addr.port}!`);
});
