import http from 'node:http';
import { createReadStream, watch } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { root, render, manifest } from './render.mjs';

const production = process.argv.includes('--production');
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT || (production ? 4173 : 5173));
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
const assetTypes = new Map(manifest.assets.map(asset => [asset.local, asset.content_type]));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.wasm': 'application/wasm', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const streams = new Set();
const watchers = [];

function resolveInside(base, urlPath) {
  const result = path.resolve(base, '.' + urlPath);
  if (result !== base && !result.startsWith(base + path.sep)) return null;
  return result;
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      return response.end('Method not allowed');
    }
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
    catch { response.writeHead(400); return response.end('Bad request'); }
    if (pathname.includes('\0') || pathname.includes('\\') || pathname.split('/').includes('..')) {
      response.writeHead(400); return response.end('Bad path');
    }
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Robots-Tag', 'noindex, nofollow');
    response.setHeader('X-PhotoCraft-Local', '1');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (pathname === '/__health') {
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify({ app: 'photocraft-local', mode: production ? 'preview' : 'development', pages: manifest.routes.length }));
    }
    if (pathname === '/robots.txt') {
      response.setHeader('Content-Type', 'text/plain');
      return response.end('User-agent: *\nDisallow: /\n');
    }
    if (!production && pathname === '/__reload') {
      response.writeHead(200, { 'Content-Type': 'text/event-stream', Connection: 'keep-alive' });
      response.write(': connected\n\n');
      streams.add(response);
      request.on('close', () => streams.delete(response));
      return;
    }
    const route = pathname.replace(/\/$/, '') || '/';
    if (!production) {
      const html = await render(route, { liveReload: true });
      if (html) {
        response.setHeader('Content-Type', mime['.html']);
        return response.end(request.method === 'HEAD' ? undefined : html);
      }
    }
    let base = path.join(root, production ? 'dist' : 'public');
    let file = resolveInside(base, pathname);
    if (!production && /^\/(scripts|styles)\//.test(pathname)) {
      base = path.join(root, 'src');
      file = resolveInside(base, pathname);
    }
    if (!file) { response.writeHead(400); return response.end('Bad path'); }
    let info;
    try {
      info = await stat(file);
      if (info.isDirectory()) { file = path.join(file, 'index.html'); info = await stat(file); }
    } catch (error) {
      if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error;
      response.writeHead(404, { 'Content-Type': mime['.html'] });
      return response.end('<!doctype html><html lang="en"><meta charset="utf-8"><title>404 | PhotoCraft Online</title><body style="background:#0a0a0a;color:#fafafa;font:16px system-ui;padding:48px"><h1>Page not found</h1><a href="/" style="color:inherit">Back to home</a></body></html>');
    }
    response.setHeader('Content-Type', assetTypes.get(pathname) || mime[path.extname(file)] || 'application/octet-stream');
    response.setHeader('Content-Length', info.size);
    if (request.method === 'HEAD') return response.end();
    const stream = createReadStream(file);
    stream.on('error', error => { console.error(error); response.destroy(error); });
    stream.pipe(response);
  } catch (error) {
    console.error(error);
    if (!response.headersSent) response.writeHead(500);
    response.end('Local server error; see the terminal output.');
  }
});

if (!production) {
  let timer;
  for (const directory of ['src', 'public']) {
    watchers.push(watch(path.join(root, directory), { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => streams.forEach(stream => stream.write('data: reload\n\n')), 150);
    }));
  }
}
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is occupied. Stop this attempt or choose another explicit --port; no fallback port is used.` : error);
  process.exitCode = 1;
  watchers.forEach(watcher => watcher.close());
});
server.listen(port, '127.0.0.1', () => console.log(`PhotoCraft local ${production ? 'preview' : 'development'}: http://localhost:${port} (${manifest.routes.length} pages)`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  watchers.forEach(watcher => watcher.close());
  streams.forEach(stream => stream.end());
  server.close(() => process.exit(0));
});
