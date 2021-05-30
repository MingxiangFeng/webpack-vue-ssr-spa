const fs = require('fs')
const path = require('path')
const LRU = require('lru-cache')
const express = require('express')
// const favicon = require('serve-favicon')
const compression = require('compression')
const microcache = require('route-cache')
const resolve = file => path.resolve(__dirname, file)
const { createBundleRenderer } = require('vue-server-renderer')

const isProd = process.env.NODE_ENV === 'production'
const useMicroCache = process.env.MICRO_CACHE !== 'false'
const serverInfo =
  `express/${require('express/package.json').version} ` +
  `vue-server-r enderer/${require('vue-server-renderer/package.json').version}`

const app = express()

const serve = (path, cache) => express.static(resolve(path), {
  maxAge: cache && isProd ? 1000 * 60 * 60 * 24 * 30 : 0
})

function createRenderer(bundle, template) {
  return createBundleRenderer(bundle, {
    template,
    cache: require('lru-cache')({
        max: 1000,
        maxAge: 1000 * 60 * 15,
    }),
    basedir: resolve('./dist'),
    runInNewContext: false,
  });
}


let renderer
let readyPromise
// const templatePath = resolve('./src/index.template.html')
if (isProd) {
  // 生产环境下直接读取构造渲染器
  const bundle = require('./dist/vue-ssr-server-bundle.json');
  const template = fs.readFileSync(resolve('./dist/home.html'), 'utf-8');
  renderer = createRenderer(bundle, template);
  app.use(serve('./dist'));
  // app.use('/dist', serve('./dist', true))
  // app.use('/css', serve('./dist/css'))
  // app.use('/js', serve('./dist/js'))
} else {
  // // In development: setup the dev server with watch and hot-reload,
  // // and create a new renderer on bundle / index template update.
  // readyPromise = require('./build/setup-dev-server')(
  //   app,
  //   templatePath,
  //   (bundle, options) => {
  //     renderer = createRenderer(bundle, options)
  //   }
  // )
  // 开发环境下使用hot/dev middleware拿到bundle与template
  readyPromise = require('./build/setup-dev-server.js')(app, (bundle, template) => {
    try {
      renderer = createRenderer(bundle, template);  
    } catch (error) {
      console.log('error===', error);
    }
  });

  // console.log('renderer==development');
  // require('./build/setup-dev-server')(app, (bundle, template) => {
  //   renderer = createRenderer(bundle, template);
  // });
}

app.use(compression({ threshold: 0 }))
// app.use(favicon('./public/logo-48.png'))
// app.use('/dist', serve('./dist', true))
// app.use('/public', serve('./public', true))
// app.use('/manifest.json', serve('./manifest.json', true))
// app.use('/service-worker.js', serve('./dist/service-worker.js'))

// since this app has no user-specific content, every page is micro-cacheable.
// if your app involves user-specific content, you need to implement custom
// logic to determine whether a request is cacheable based on its url and
// headers.
// 1-second microcache.
// https://www.nginx.com/blog/benefits-of-microcaching-nginx/
app.use(microcache.cacheSeconds(1, req => useMicroCache && req.originalUrl))

function render (req, res) {
  const s = Date.now()

  res.setHeader("Content-Type", "text/html")
  res.setHeader("Server", serverInfo)

  const handleError = err => {
    if (err.url) {
      res.redirect(err.url)
    } else if(err.code === 404) {
      res.status(404).send('404 | Page Not Found')
    } else {
      // Render Error Page or Redirect
      res.status(500).send('500 | Internal Server Error')
      console.error(`error during render : ${req.url}`)
      console.error(err.stack)
    }
  }

  const context = {
    title: 'Vue HN 2.0', // default title
    url: req.url
  }
  renderer.renderToString(context, (err, html) => {
    if (err) {
      return handleError(err)
    }
    res.send(html)
    if (!isProd) {
      console.log(`whole request: ${Date.now() - s}ms`)
    }
  })
}

app.get('*', isProd ? render : (req, res) => {
  readyPromise.then(() => render(req, res))
})

const port = process.env.PORT || 9998
app.listen(port, () => {
  console.log(`server started at localhost:${port}`)
})
