// @ts-ignore
import md5 from 'md5'
import { os } from '../../config'
import { admin, bullet, user, video } from '../../db/table'
import { NoResourcesError, PermissionError } from '../../error'
import { authAdmin, sing } from '../../utils/jwt'
import Router from '../../utils/Router'
import {
  schemaChangeNickname,
  schemaChangePassword,
  schemaChangePhoto,
  schemaEdit,
  schemaFromId,
  schemaList,
  schemaLogin,
  schemaRegister,
  schemaVideo,
  schemaVideoFromId,
} from './verify'

const router = new Router()

router.post('/register', schemaRegister, authAdmin({
  permission: 'adminList',
}), async (ctx) => {
  const { password, nickname } = ctx.verify
  const need = await admin.where({ nickname }).first()
  if(need) {
    throw new PermissionError('用户名已被占用')
  }
  const res = await admin.value({
    nickname,
    password: md5(password),
  }).add()
  ctx.succeed(res)
})

router.post('/login', schemaLogin, async (ctx) => {
  const { nickname, password } = ctx.verify
  const res = await admin.where({
    nickname,
    password: md5(password),
  }).first()
  if(!res) throw new NoResourcesError('账号或密码错误')
  const token = sing({ adminId: res.adminId, type: 'admin' })
  ctx.succeed({
    token,
    'authorization': 'Bearer ' + token,
  })
})

router.get('/info', authAdmin(), async (ctx) => {
  const { adminId } = ctx.authAdmin
  const data = await admin.where({ adminId }).vget([
    'permissionsDescription',
  ]).first()
  ctx.succeed(data)
})

router.put('/photo', schemaChangePhoto, authAdmin(), async (ctx) => {
  const { affectedRows } = await admin.where({
    adminId: ctx.authAdmin.adminId,
  }).set({
    photo: ctx.verify.photo,
  }).update()
  ctx.succeed()
})

router.put('/nickname', schemaChangeNickname, authAdmin(), async (ctx) => {
  const { affectedRows } = await admin.where({
    adminId: ctx.authAdmin.adminId,
  }).set({
    nickname: ctx.verify.nickname,
  }).update()
  ctx.succeed()
})

router.put('/password', schemaChangePassword, authAdmin(), async (ctx) => {
  const { oldPassword, newPassword } = ctx.verify
  const { adminId } = ctx.authAdmin
  const { affectedRows } = await admin.where({
    adminId: ctx.authAdmin.adminId,
    password: md5(oldPassword),
  }).set({
    password: md5(newPassword),
  }).update()
  if(!affectedRows) {
    throw new NoResourcesError('密码错误')
  }
  ctx.succeed()
})

router.put('/', schemaEdit, authAdmin({
  permission: 'adminEdit',
}), async (ctx) => {
  const { adminId } = ctx.authAdmin
  const { nickname, photo } = ctx.verify
  await admin.where({ adminId }).set({ nickname, photo }).update()
  ctx.succeed()
})

router.del('/', schemaFromId, authAdmin({
  permission: 'adminList',
}), async (ctx) => {
  const { adminId } = ctx.verify
  if(adminId === 1) throw new PermissionError('该账号为超级管理员，禁止操作')
  admin.where({ adminId }).remove()
  ctx.succeed()
})

function randomString(e = 8) {
  const t = 'abcdefhijkmnprstwxyz0123456789',
    l = t.length
  let n = ''
  for(let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * l))
  return n
}

router.post('/resetPassword', schemaFromId, authAdmin({
  permission: 'adminEdit',
}), async (ctx) => {
  const { adminId } = ctx.verify
  const np = randomString()
  const mnp = md5(np)
  await admin.where({
    adminId,
  }).set({ password: mnp }).update()
  ctx.succeed({ password: np })
})

router.get('/list', schemaList, authAdmin({
  permission: 'adminerList',
}), async (ctx) => {
  const { pageNumber, pageSize, keyWord, permission } = ctx.verify
  let flq = admin.vget([
    'permissionsDescription',
  ]).limit({
    size: pageSize,
    page: pageNumber,
  }).field([ 'adminId', 'nickname', 'permissions', 'photo' ])
  if(keyWord) {
    flq = flq.where({ nickname: `%${ keyWord }%` }, 'AND', 'LIKE')
  }
  if(permission) {
    flq = flq.where({ permissions: `%${ permission }%` }, 'AND', 'LIKE')
  }
  const data = await flq.findRows()
  ctx.succeed(data)
})

router.get('/fromId', schemaFromId, authAdmin({
  permission: 'adminerEdit',
}), async (ctx) => {
  const { adminId } = ctx.verify
  const data = await admin.where({ adminId }).field([ 'adminId', 'photo', 'nickname', 'permissions', 'authButton' ]).first()
  if(!data) throw new NoResourcesError('找不到管理员')
  ctx.succeed({ data })
})

router.get('/video', schemaVideo, async (ctx) => {
  const { pageNumber, pageSize, keyWord, state, userId, classify } = ctx.verify
  let flq = video.limit({
    size: pageSize,
    page: pageNumber,
  }).order({ sortValue: -1, createdAt: -1 }).vget([ 'user' ])
  if(keyWord) {
    flq = flq.where({ title: `%${ keyWord }%`, describe: `%${ keyWord }%` }, 'OR', 'LIKE')
  }
  if(typeof state === 'number') {
    flq = flq.where({ state })
  }
  if(userId) {
    flq = flq.where({ userId })
  }
  if(classify) {
    flq = flq.where({
      classify,
    })
  }
  const data = await flq.where({
    deleteAt: 0,
  }).findRows()
  ctx.succeed(data)
})

router.get('/video/fromId', schemaVideoFromId, authAdmin(), async (ctx) => {
  const { videoId } = ctx.verify
  const data = await video.where({ videoId }).vget([ 'user' ]).first()
  if(!data) throw new NoResourcesError('找不到视频')
  const bulletList = await bullet.where({ videoId }).order({ time: 1 }).find()
  data.bulletList = bulletList
  data.bulletCount = bulletList.length
  ctx.succeed({ data })
})

router.get('/video/cover', schemaVideoFromId, authAdmin(), async (ctx) => {
  const { videoId } = ctx.verify
  const data = await video.where({ videoId }).first()
  if(!data) throw new NoResourcesError('找不到视频')
  const coverPreview = data.cover.replace('!video.cover', '')
  ctx.succeed({ cover: coverPreview.replace(os.imageAsstesBaseUrl, ''), coverPreview })
})

export default router.routes()
