const Router = require('express')
const router = new Router()
const lessonController = require('../controllers/lessonController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', checkRole('ADMIN'), lessonController.create)
router.post('/createSection', checkRole('ADMIN'), lessonController.createSection)
router.put('/:id', checkRole('ADMIN'), lessonController.changeLesson)
router.put('/guide/:id', checkRole('ADMIN'), lessonController.changeGuide)
router.post('/createStatusForNew', lessonController.createStatusForNew)
router.post('/:id', lessonController.createStatus)
router.get('/', lessonController.getAll)
router.get('/sections', lessonController.getAllSections)
router.get('/sortedSections', lessonController.getSortedSections)
router.get('/:id', lessonController.getOne)
router.get('/guide/:id', lessonController.getOneGuide)


module.exports = router