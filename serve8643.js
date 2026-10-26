const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
http.createServer((req, res) => {
  let f = path.join(__dirname, decodeURIComponent(req.url));
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  const ct = mime[path.extname(f)] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': ct, 'Access-Control-Allow-Origin': '*' });
  fs.createReadStream(f).pipe(res);
}).listen(8643, () => console.log('http://127.0.0.1:8643'));
