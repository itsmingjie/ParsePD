const express = require('express')
const exphbs = require('express-handlebars')
const path = require('path')
const sassMiddleware = require('node-sass-middleware')

const app = express()
const http = require('http').createServer(app)
const helpers = require('./lib/helpers')
const hbs = exphbs.create({ helpers: helpers, extname: '.hbs' })

const config = require('./config')

app.use(
  sassMiddleware({
    src: path.join(__dirname, './styles'),
    dest: path.join(__dirname, './static/assets/styles'),
    outputStyle: 'compressed',
    prefix: '/assets/styles/'
  })
)
app.engine('.hbs', hbs.engine)
app.set('view engine', '.hbs')

app.use(express.static(path.join(__dirname, './static')))

// manage all routes
app.use('/', require('./routes/index'))

// Launch Server
http.listen(config.port, () => {
  console.log(`ParsePD is running on *:${config.port}`)
})
