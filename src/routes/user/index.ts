// @ts-ignore
import md5 from 'md5'
import { node_env, os } from '../../config'
import { admin, user, video } from '../../db/table'
import { NoResourcesError, PermissionError } from '../../error'
import authCode from '../../utils/code'
import { authUser, sing } from '../../utils/jwt'
import Router from '../../utils/Router'
import sendCode from '../../utils/sendCode'
import {
  schemaChangeAvatar,
  schemaFromId,
  schemaLogin,
  schemaMyVideo,
  schemaRegister,
  schemaSendCode,
} from './verify'

const router = new Router()

router.post('/register', schemaRegister, async (ctx) => {
  const { phone, code, password, nickname } = ctx.verify
  const need = await admin.where({ nickname }).first()
  if(need) {
    throw new PermissionError('用户名已被占用')
  }
  const poed = await user.where({ phone }).first()
  if(poed) {
    throw new PermissionError('手机号已被占用')
  }
  if(authCode.has(phone, code)) {
    const res = await user.value({
      phone,
      nickname,
      password: md5(password),
    }).add()
    authCode.destroy(phone)
    ctx.succeed({ message: 'success' })
  } else {
    ctx.custom(401, { message: '验证码错误' })
  }
})

// router.post('/testNickname', schemaNickname, (ctx) => {
//
// })

router.post('/login', schemaLogin, async (ctx) => {
  const { phone, password } = ctx.verify
  const res = await user.where({
    phone,
    password: md5(password),
  }).first()
  if(!res) throw new NoResourcesError('账号或密码错误')
  const token = sing({ userId: res.userId, type: 'user' })
  ctx.succeed({
    token,
    'authorization': 'Bearer ' + token,
  })
})

router.post('/sendCode', schemaSendCode, async (ctx) => {
  const { phone } = ctx.verify
  const code = authCode.add(phone)
  if(node_env === 'development') {
    ctx.succeed({ code })
    return
  }
  const res = await sendCode(code)
  if(res.body.code === 'OK') {
    ctx.succeed('succeed')
  } else {
    ctx.custom(401, res.body.message || '未知错误')
    authCode.destroy(phone)
  }
})

router.get('/myInfo', authUser(), async (ctx) => {
  const { userId } = ctx.authUser
  ctx.succeed(ctx.authUser)
  const data = await user.where({ userId }).field([ 'userId', 'phone', 'nickname', 'avatar', 'permissions', 'signature' ]).vget([ 'videoCount' ]).first()
  ctx.succeed(data)
})

router.put('/avatar', schemaChangeAvatar, authUser(), async (ctx) => {
  const { affectedRows } = await user.where({
    userId: ctx.authUser.userId,
  }).set({
    avatar: ctx.verify.avatar,
  }).update()
  ctx.succeed()
})

router.get('/video', schemaMyVideo, authUser(), async (ctx) => {
  const { pageNumber, pageSize, state } = ctx.verify
  let flq = video.where({
    state,
    deleteAt: 0,
    userId: ctx.authUser.userId,
  }).limit({
    size: pageSize,
    page: pageNumber,
  })
  const data = await flq.findRows()
  ctx.succeed(data)
})

router.get('/video/fromId', schemaFromId, authUser(), async (ctx) => {
  const { videoId } = ctx.verify
  const { userId } = ctx.authUser
  const data = await video.where({ videoId, userId }).first()
  const { cover, videoUrl } = data as { cover: string, videoUrl: string }
  data.coverPreview = data.cover
  data.cover = cover.replace(os.imageAsstesBaseUrl, '')
  data.videoPreview = data.videoUrl
  data.videoUrl = videoUrl.replace(os.videoAsstesBaseUrl, '')
  if(!data) throw new NoResourcesError('找不到视频')
  ctx.succeed({ data })
})

export default router.routes()
