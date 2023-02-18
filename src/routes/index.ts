import Router from 'koa-router'
import admin from './admin'
import carousel from './carousel'
import classify from './classify'
import comment from './comment'
import permission from './permission'
import upload from './upload'
import user from './user'
import video from './video'

const router = new Router()

router.use('/user', user)
router.use('/admin', admin)
router.use('/upload', upload)
router.use('/video', video)
router.use('/classify', classify)
router.use('/comment', comment)
router.use('/permission', permission)
router.use('/carousel', carousel)

export default router
