const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const url = 'http://127.0.0.1:47863';
const log = path.join(__dirname, 'nexo-start.log');
function ready() {
  return new Promise(resolve => {
    const request = http.get(url, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => body += chunk);
      response.on('end', () => resolve(response.statusCode === 200 && response.headers['x-nexo-app'] === 'nexo-local-v1' && body.includes('<title>Nexo')));
    });
    request.setTimeout(1500, () => request.destroy());
    request.on('error', () => resolve(false));
  });
}
(async () => {
  if (!await ready()) {
    const out = fs.openSync(log, 'a');
    const server = spawn(process.execPath, [path.join(__dirname, 'start-local.cjs')], {
      cwd: __dirname, detached: true, windowsHide: true, stdio: ['ignore', out, out]
    });
    server.unref();
    fs.closeSync(out);
    for (let attempt=0; attempt<20; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 250));
      if (await ready()) break;
    }
  }
  if (!await ready()) throw new Error('Não foi possível iniciar o Nexo na porta 47863.');
  const browser = spawn(path.join(process.env.SystemRoot || 'C:\\Windows', 'explorer.exe'), [url], {
    detached: true, windowsHide: true, stdio: 'ignore'
  });
  browser.unref();
  fs.appendFileSync(log, new Date().toISOString() + ' Site disponível; abertura solicitada.\n');
})().catch(error => {
  fs.appendFileSync(log, new Date().toISOString() + ' ' + error.stack + '\n');
  console.error(error.message);
  process.exitCode = 1;
});
