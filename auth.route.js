const express = require (`express`)
const router = express()
const {authenticate} = require(`../controllers/auth.controllers`)

router.post(`/`, authenticate)
module.exports = router