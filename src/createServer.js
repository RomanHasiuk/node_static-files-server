/* eslint-disable max-len */
'use strict';

const http = require('node:http');
const fsp = require('node:fs/promises');
const path = require('node:path');

function createServer() {
  return http.createServer(async (req, res) => {
    if (req.url.includes('//')) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Not Found');

      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const { pathname } = url;

    if (!pathname.startsWith('/file/')) {
      if (pathname === '/' || pathname === '/file') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');

        res.end(
          'To load files, use paths starting with /file/, e.g., /file/index.html',
        );

        return;
      }
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Bad Request');

      return;
    }

    let requestedPath = pathname.replace('/file/', '');

    if (!requestedPath || requestedPath === '/') {
      requestedPath = 'index.html';
    }

    const publicDir = path.resolve('public');
    const filePath = path.resolve(publicDir, requestedPath);

    if (!filePath.startsWith(publicDir + path.sep)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Bad Request');

      return;
    }

    try {
      const data = await fsp.readFile(filePath);
      const ext = path.extname(filePath);
      const contentType = ext === '.html' ? 'text/html' : 'text/plain';

      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.end(data);
    } catch (error) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Not Found');
    }
  });
}

module.exports = { createServer };
