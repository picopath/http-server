#!/usr/bin/env node
const commander = require('commander');
const path = require('path');
const package = require('./package.json');
const Server = require('./index');
require('colors');

commander
  .version(package.version)
  .usage('[options]')
  .option(
    '-r, --root <directory>',
    'Root directory - default: current directory',
    path.resolve('.')
  )
  .option('-p, --port <port>', 'Port', 5000)
  .option('--no-log', 'No logging')
  .option(
    '--level <level>',
    'Log level',
    /^(tiny|combined|common|dev|short)/,
    'common'
  )
  .option(
    '--no-spa',
    'Do not treat root directory as a single page application'
  )
  .option('--no-compression', 'Disable compression')
  .option('--no-redirect', 'Do not redirect http to https')
  .option('--https-port <port>', 'Port to use for https')
  .option('--https-cert <file>', 'Path to https cert file')
  .option('--https-key <file>', 'Path to https key file')
  .option('--no-http2', 'Do not use http2 protocol for https');

commander.parse(process.argv);

try {
  Server.start(commander);
} catch (error) {
  console.log('Failed to start server'.red);
  console.log('Error:'.red, error.message.red);
}
