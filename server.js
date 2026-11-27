'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { URL } = require('node:url');

const ROOT = __dirname;
const MENU_FILE = path.join(ROOT, 'data', 'menu.json');
const PORT = Number(process.env.PORT) || 3000;

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon'
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(payload));
}

async function readMenu() {
  const raw = await fs.readFile(MENU_FILE, 'utf8');
  return JSON.parse(raw);
}

async function handleApi(requestUrl, response) {
  try {
    const menu = await readMenu();
    const pathname = requestUrl.pathname;

    if (pathname === '/api/menu') {
      const group = requestUrl.searchParams.get('group');
      const data = group ? menu.filter((item) => item.group === group) : menu;
      return sendJson(response, 200, { success: true, count: data.length, data });
    }

    const itemId = decodeURIComponent(pathname.slice('/api/menu/'.length));
    const item = menu.find((product) => product.id === itemId);
    if (!item) {
      return sendJson(response, 404, { success: false, message: 'Menu tidak ditemukan.' });
    }
    return sendJson(response, 200, { success: true, data: item });
  } catch (error) {
    console.error('API menu error:', error);
    return sendJson(response, 500, { success: false, message: 'Data menu gagal dibaca.' });
  }
}

async function serveStatic(pathname, response) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    response.writeHead(400);
    return response.end('Bad Request');
  }

  const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
  const filePath = path.resolve(ROOT, relativePath);
  if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) {
    response.writeHead(403);
    return response.end('Forbidden');
  }
  if (filePath.includes(`${path.sep}node_modules${path.sep}`) || path.basename(filePath).startsWith('.')) {
    response.writeHead(404);
    return response.end('Not Found');
  }

  try {
    const stat = await fs.stat(filePath);
    const actualPath = stat.isDirectory() ? path.join(filePath, 'index.html') : filePath;
    const file = await fs.readFile(actualPath);
    const extension = path.extname(actualPath).toLowerCase();
    response.writeHead(200, {
      'Content-Type': CONTENT_TYPES[extension] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': extension === '.webp' ? 'public, max-age=86400' : 'no-cache'
    });
    response.end(file);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('File tidak ditemukan');
  }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    return response.end('Method Not Allowed');
  }
  if (requestUrl.pathname === '/api/menu' || requestUrl.pathname.startsWith('/api/menu/')) {
    return handleApi(requestUrl, response);
  }
  return serveStatic(requestUrl.pathname, response);
});

server.listen(PORT, () => {
  console.log(`Dimsum PJS berjalan di http://localhost:${PORT}`);
  console.log(`API menu tersedia di http://localhost:${PORT}/api/menu`);
});
