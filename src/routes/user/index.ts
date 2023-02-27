// @ts-ignore
import md5 from 'md5'
import { Filter } from 'mongodb'
import { nanoid } from 'nanoid'
import { node_env, os } from '../../config'
import { user, video } from '../../db/table'
import { AccountBanningError, NoResourcesError, PermissionError } from '../../error'
import { muser, mvideo, UserField } from '../../mdb/table'
import authCode from '../../utils/code'
import { authAdmin, authUser, sing } from '../../utils/jwt'
import Router from '../../utils/Router'
import sendCode from '../../utils/sendCode'
import {
  schemaBanned,
  schemaChangeAvatar,
  schemaChangeNickname,
  schemaChangeSignature,
  schemaList,
  schemaLogin,
  schemaMyVideo,
  schemaPutInfo,
  schemaRegister,
  schemaSendCode,
  schemaVideoFromId,
} from './verify'

const router = new Router()

router.post('/register', schemaRegister, async (ctx) => {
  const { phone, code, password, nickname } = ctx.verify
  const need = await muser.findOne({ nickname })
  if(need) {
    throw new PermissionError('用户名已被占用')
  }
  const poed = await muser.findOne({ phone })
  if(poed) {
    throw new PermissionError('手机号已被占用')
  }
  if(authCode.has(phone, code)) {
    const res = await muser.insertOne({
      userId: nanoid(),
      phone,
      nickname,
      password: md5(password),
      createdAt: new Date,
    })
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
  const res = await muser.findOne({
    phone,
    password: md5(password),
  })
  if(!res) throw new NoResourcesError('账号或密码错误')
  if(res.banned) {
    throw new AccountBanningError()
  }
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
  const res = await sendCode(code, phone)
  if(res.body.code === 'OK') {
    ctx.succeed({ code })
  } else {
    ctx.custom(401, res.body.message || '未知错误')
    authCode.destroy(phone)
  }
})

router.get('/myInfo', authUser(), async (ctx) => {
  const { userId } = ctx.authUser
  const data = await muser.findOne({ userId }, {
    projection: { _id: 0, password: 0, createdAt: 0 },
  })
  ctx.succeed(data)
})

router.put('/myInfo', schemaPutInfo, authUser(), async (ctx) => {
  const { userId } = ctx.authUser
  const { nickname, signature } = ctx.verify
  const data = await muser.updateOne({ userId }, {
    $set: {
      nickname,
      signature,
    },
  })
  ctx.succeed()
})

router.put('/avatar', schemaChangeAvatar, authUser(), async (ctx) => {
  const { acknowledged } = await muser.updateOne({
    userId: ctx.authUser.userId,
  }, {
    $set: {
      avatar: ctx.verify.avatar,
    },
  })
  ctx.succeed()
})

router.put('/nickname', schemaChangeNickname, authUser(), async (ctx) => {
  const { acknowledged } = await muser.updateOne({
    userId: ctx.authUser.userId,
  }, {
    $set: {
      nickname: ctx.verify.nickname,
    },
  })
  ctx.succeed()
})

router.put('/signature', schemaChangeSignature, authUser(), async (ctx) => {
  const { acknowledged } = await muser.updateOne({
    userId: ctx.authUser.userId,
  }, {
    $set: {
      signature: ctx.verify.signature,
    },
  })
  ctx.succeed()
})

router.get('/video', schemaMyVideo, authUser(), async (ctx) => {
  const { pageNumber, pageSize, state } = ctx.verify
  const where: Filter<Partial<UserField>> = {
    deleteAt: false,
    userId: ctx.authUser.userId,
  }
  if(typeof state === 'number') {
    where.state = state
  }
  const data = await mvideo.find(where).sort({
    updateAt: -1,
    createdAt: -1,
  }).limit(pageSize).skip((pageNumber - 1) * pageNumber).toArray()
  ctx.succeed(data)
})

router.get('/video/fromId', schemaVideoFromId, authUser(), async (ctx) => {
  const { videoId } = ctx.verify
  const { userId } = ctx.authUser
  const data = await video.where({ videoId, userId }).first()
  if(!data) throw new NoResourcesError('找不到视频')
  const { cover, videoUrl } = data as { cover: string, videoUrl: string }
  data.coverPreview = data.cover
  data.cover = cover.replace(os.imageAsstesBaseUrl, '').replace('!video.cover', '')
  data.videoPreview = data.videoUrl
  data.videoUrl = videoUrl.replace(os.videoAsstesBaseUrl, '')
  if(!data) throw new NoResourcesError('找不到视频')
  ctx.succeed({ data })
})

router.get('/list', schemaList, authAdmin({
  permission: 'userList',
}), async (ctx) => {
  const { pageNumber, pageSize, banned, keyWord } = ctx.verify
  let flq = await user.limit({ page: pageNumber, size: pageSize })
  if(keyWord) {
    flq = flq.where({
      nickname: `%${ keyWord }%`,
      signature: `%${ keyWord }%`,
    }, 'OR', 'LIKE')
  }
  if(typeof banned === 'number') {
    flq = flq.where({
      banned,
    })
  }
  const data = await flq.findRows()
  ctx.succeed(data)
})

router.put('/banned', schemaBanned, authAdmin({
  permission: 'userList',
}), async (ctx) => {
  const { userId, banned } = ctx.verify
  const { affectedRows } = await user.where({ userId }).set({
    banned,
  }).update()
  if(!affectedRows) throw new NoResourcesError('无效用户')
  ctx.succeed()
})

export default router.routes()
