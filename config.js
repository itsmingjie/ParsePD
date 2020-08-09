require('dotenv').config()

module.exports = {
  port: process.env.PORT || 3000,
  googleKey: process.env.GOOGLE_KEY
}
