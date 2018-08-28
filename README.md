`picoserver` is a HTTP/HTTPS/HTTP2 capable server. This server is for development purposes only and uses Nodejs (currently) experimental Http2 module.

Motivation: This is a simple rewrite of an older project of mine that used 'now deprecated' http2 and https npm modules. It was originally inspired from [simplehttp2server](https://github.com/GoogleChromeLabs/simplehttp2server).

# Installation

`picoserver` can be installed using npm or other nodejs package managers.

```
  npm install -g @picopath/http-server
```

# Usage

Run the picoserver command from the directory you want to serve and go to http://localhost:5000

```
  Usage: picoserver [options]

  Options:

    -V, --version           output the version number
    -r, --root <directory>  Root directory - default: current directory
    -p, --port <port>       Port (default: 5000)
    --no-log                No logging
    --level <level>         Log level (default: common)
    --no-spa                Do not treat root directory as a single page application
    --no-compression        Disable compression
    --no-redirect           Do not redirect http to https
    --https-port <port>     Port to use for https
    --https-cert <file>     Path to https cert file
    --https-key <file>      Path to https key file
    --no-http2              Do not use http2 protocol for https
    -h, --help              output usage information
```

# License

MIT
