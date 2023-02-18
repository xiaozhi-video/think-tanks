import KoaBody from 'koa-body'
import path from 'path'
import { os } from '../../config'
import { authAdmin, authUser } from '../../utils/jwt'
import { geVideotToken, uploadImage } from '../../utils/qiniu'
import Router from '../../utils/Router'

const router = new Router

router.post('/video', authUser() , (ctx) => {
  const token = geVideotToken()
  ctx.succeed({ token })
})

router.post('/succeed', (ctx) => {
  ctx.set('Content-Type', 'application/json')
  const { key, hash, avinfo } = ctx.request.body
  ctx.succeed({ path: key, hash: hash, url: os.videoAsstesBaseUrl + key })
})

router.post('/transcoded', (ctx) => {
  ctx.set('Content-Type', 'application/json')
  const { key, hash, avinfo } = ctx.request.body
  ctx.succeed({ path: key, hash: hash, url: os.videoAsstesBaseUrl + key })
})

router.post('/image', KoaBody({
  multipart: true,
  formidable: { uploadDir: path.resolve(__dirname, '../../../cache') },
}), async (ctx) => {
  const files = ctx.request.files as any
  const file = files.file
  const info = await uploadImage(file.filepath)
  const { key, hash } = info.data
  ctx.succeed({ path: key, hash: hash, url: os.asstesBaseUrl + key })
})

router.post('/clean', authAdmin({
  permission: 'cleanResource'
}), async (ctx) => {

})

export default router.routes()
