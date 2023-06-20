const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const lessonRouter = require('./lessonRouter')

router.use('/user', userRouter)
router.use('/lesson', lessonRouter)

module.exports = router