import Router from 'koa-router'
import admin from './admin'
import bullet from './bullet'
import carousel from './carousel'
import classify from './classify'
import comment from './comment'
import history from './history'
import like from './like'
import permission from './permission'
import upload from './upload'
import user from './user'
import video from './video'

const router = new Router()

router.use('/user', user)
router.use('/admin', admin)
router.use('/upload', upload)
router.use('/video', video)
router.use('/like', like)
router.use('/classify', classify)
router.use('/comment', comment)
router.use('/permission', permission)
router.use('/carousel', carousel)
router.use('/bullet', bullet)
router.use('/history', history)

export default router
