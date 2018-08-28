const fs = require('fs');
const connect = require('connect'); // Http middleware framework
const http = require('http');
const https = require('https');
const http2 = require('http2');
const compression = require('compression'); // Response compression
const morgan = require('morgan'); // Logging middleware
const serveStatic = require('serve-static'); // Expressjs middleware
const history = require('connect-history-api-fallback');

require('colors');

function errorHandler(error) {
  console.error('Unexpected error:'.red, error);
}

function createRequestHandler(options) {
  const requestHandler = connect();
  if (options.compression) {
    requestHandler.use(compression());
  }

  if (options.log) {
    requestHandler.use(morgan(options.level));
  }

  if (options.spa) {
    requestHandler.use(
      history({
        index: '/index.html'
      })
    );
  }

  requestHandler.use(serveStatic(options.root));
  requestHandler.use(errorHandler);
  return requestHandler;
}

function getHttpsOptions(options) {
  const httpsOptions = {};
  if (!options.httpsCert) {
    throw new Error('Https certificate file required');
  }

  if (!options.httpsKey) {
    throw new Error('Https certificate key file required');
  }

  try {
    httpsOptions.cert = fs.readFileSync(options.httpsCert);
  } catch (error) {
    throw new Error(
      `Failed to read certificate file: $${options.httpsCert}`,
      error
    );
  }

  try {
    httpsOptions.key = fs.readFileSync(options.httpsKey);
  } catch (error) {
    throw new Error(
      `Failed to read certificate key file: ${options.httpsKey}`,
      error
    );
  }

  return httpsOptions;
}

function startHttpRedirect(options) {
  http
    .createServer((req, res) => {
      let host = req.headers.host;
      if (options.port == 80 && options.httpsPort != 443) {
        host = host + ':' + options.httpsPort;
      } else if (options.port != 80 && options.httpsPort == 443) {
        host = host.replace(':' + options.port, '');
      } else {
        host = host.replace(options.port, options.httpsPort);
      }

      res.writeHead(307, {
        Location: 'https://' + host + req.url
      });
      res.end();
    })
    .listen(options.port)
    .on('listening', () => {
      console.log(
        `HTTP Server is listening on ${options.port}`.green,
        '[Redirecting to HTTPS]'.blue
      );
    })
    .on('error', error => {
      console.log(
        `Failed to start http server for redirection, cause: ${error.message}`
          .red
      );
    });
}

function startHttp(options, requestHandler) {
  http
    .createServer(requestHandler)
    .listen(options.port)
    .on('listening', () => {
      console.log(`HTTP Server is listening on ${options.port}`.green);
    })
    .on('error', error => {
      console.log(`Failed to start http server, cause: ${error.message}`.red);
    });
}

function startHttps(options, httpsOptions, requestHandler) {
  https
    .createServer(httpsOptions, requestHandler)
    .listen(options.httpsPort)
    .on('listening', () => {
      console.log(
        'HTTPS Server is listening on'.green,
        `${options.httpsPort}`.green
      );
    })
    .on('error', error => {
      console.log('Failed to start https server'.red, error);
    });
}

function startHttp2(options, httpsOptions, requestHandler) {
  http2
    .createSecureServer(httpsOptions, requestHandler)
    .listen(options.httpsPort)
    .on('listening', () => {
      console.log(
        'HTTP/2 Server is listening on'.green,
        `${options.httpsPort}`.green
      );
    })
    .on('error', error => {
      console.log('Failed to start http/2 server'.red, error);
    });
}

function start(options) {
  const requestHandler = createRequestHandler(options);
  let httpRedirecting = false;
  if (options.httpsPort) {
    const httpsOptions = getHttpsOptions(options);
    if (options.http2) {
      startHttp2(options, httpsOptions, requestHandler);
    } else {
      startHttps(options, httpsOptions, requestHandler);
    }

    if (options.redirect) {
      startHttpRedirect(options);
      httpRedirecting = true;
    }
  }

  if (!httpRedirecting) {
    startHttp(options, requestHandler);
  }
}

module.exports = { start, createRequestHandler };
