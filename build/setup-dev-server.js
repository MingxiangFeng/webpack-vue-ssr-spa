const path = require('path');
const webpack = require('webpack');
const MFS = require('memory-fs');
const clientConfig = require('./webpack.client.conf');
const serverConfig = require('./webpack.server.conf');

const readFile = (fs, file) => {
  try {
    return fs.readFileSync(path.join(clientConfig.output.path, file), 'utf-8')
  } catch (e) {
    console.log('readFile==', e);
  }
}

module.exports = function setupDevServer (app, cb) {
  let bundle;
  let template;

  const update = () => {
    if (bundle && template) {
      ready()
      cb(bundle, template)
    }
  }

  let ready
  const readyPromise = new Promise(r => { ready = r })
  
  clientConfig.entry.home = ['webpack-hot-middleware/client?reload=true', ...clientConfig.entry.home]

  const clientCompiler = webpack(clientConfig);
  
  const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    serverSideRender: true 
  })

  app.use(devMiddleware)

  clientCompiler.hooks.done.tap('client', () => {
    const fs = devMiddleware.fileSystem;

    const filePath = path.join(clientConfig.output.path, 'home.html');

    if (fs.existsSync(filePath)) {
      template = fs.readFileSync(filePath, 'utf-8');
      update()
    }
  });

  app.use(require('webpack-hot-middleware')(clientCompiler, { heartbeat: 5000 }))

  const serverCompiler = webpack(serverConfig);
  const mfs = new MFS();

  serverCompiler.outputFileSystem = mfs;
  serverCompiler.watch({}, (err, stats) => {
    if (err) {
      throw err;
    }
    stats = stats.toJson();
    stats.errors.forEach(err => console.error(err));
    stats.warnings.forEach(err => console.warn(err));

    bundle = JSON.parse(readFile(mfs, 'vue-ssr-server-bundle.json'))

    update();
  });

  return readyPromise
};
