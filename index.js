const {parse, URL} = require('url');
const fetch = require('node-fetch').default;
const {json} = require('micro');

// Based on zeit/micro-proxy
// See: https://github.com/zeit/micro-proxy/blob/133e645bc675dc89405a2afcd988a40d7c15e034/index.js
async function proxyRequest (dest, body, req, res) {
  const url = new URL(dest);
  const proxyRes = await fetch(url, {
    method: req.method,
    headers: Object.assign({}, req.headers, {'Content-Type': 'application/json', 'host': url.host}),
    body,
    compress: false
  });

  res.statusCode = proxyRes.status;
  const headers = proxyRes.headers.raw();
  for (const key of Object.keys(headers)) {
    res.setHeader(key, headers[key]);
  }

  proxyRes.body.pipe(res);
  proxyRes.body.on('error', (err) => {
    console.error(`Error on proxying url: ${newUrl}`);
    console.error(err.stack);
    res.end();
  });

  req.on('abort', () => {
    proxyRes.body.destroy();
  });

  console.log('proxied %s', proxyRes.status);
}

module.exports = async (req, res) => {
  try {
    const query = parse(req.url, true).query;
    const dest = query.url;

    console.log(req.url);

    if (!dest) {
      console.log('404');
      res.statusCode = 404;
      res.end('Not found');
      return
    }

    let body;
    if (query.ref) {
      const data = await json(req);
      const {object_attributes: attr} = data;
      if (!attr || !attr.ref) {
        console.log('400');
        res.statusCode = 400;
        res.end('Bad request');
        return;
      }

      if (query.ref !== attr.ref) {
        console.log('202');
        res.statusCode = 202;
        res.end('Accepted');
        return;
      }
      body = JSON.stringify(data);
    } else {
      body = req;
    }

    await proxyRequest(dest, body, req, res);
  } catch (err) {
    console.error(err.stack);
    res.end();
  }
};
