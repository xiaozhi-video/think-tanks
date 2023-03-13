import Joi from 'joi'
import verify, { imgUrl, keyWord, page } from '../../verify'

const phone = Joi.string().required().pattern(/^1[3456789]\d{9}$/).error(new Error('无效手机号'))
const password = Joi.string().required().min(8).max(16).error(new Error('无效密码'))
const nickname = Joi.string().required().min(2).max(16).error(new Error('无效昵称'))
const signature = Joi.string().min(1).max(255).required().error(new Error('无效个签'))

// 注册
export const schemaRegister = verify({
  // 昵称
  nickname,
  // 密码
  password,
  // 电话
  phone,
  // 验证码
  code: Joi.string().required().min(6).max(6).error(new Error('无效验证码')),
})

export const schemaPutInfo = verify({
  nickname,
  signature,
})

// 发送验证码
export const schemaSendCode = verify({
  phone,
})

export const schemaNickname = verify({
  nickname,
})

// 登录
export const schemaLogin = verify({
  // 手机号
  phone,
  // 密码
  password,
})

// 修改头像
export const schemaChangeAvatar = verify({
  // 头像
  avatar: imgUrl,
})

// 修改昵称
export const schemaChangeNickname = verify({
  nickname,
})

// 修改个签
export const schemaChangeSignature = verify({
  signature,
})

export const schemaMyVideo = verify({
  ...page,
  state: Joi.number().min(0).max(2).error(new Error('无效状态')),
})

export const schemaVideoFromId = verify({
  videoId: Joi.string().max(64).error(new Error('无效视频')),
})

export const schemaList = verify({
  ...page,
  keyWord,
  banned: Joi.number().error(new Error('无效封禁')),
})

export const schemaBanned = verify({
  userId: Joi.number().required().error(new Error('无效用户')),
  banned: Joi.number().required().error(new Error('无效封禁')),
})
