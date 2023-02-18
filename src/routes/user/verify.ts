import Joi from "joi"
import verify, { imgUrl, page } from '../../verify'

const phone = Joi.string().required().pattern(/^1[3456789]\d{9}$/).error(new Error('无效手机号'))
const password = Joi.string().required().min(8).max(16).error(new Error('无效密码'))
const nickname = Joi.string().required().min(2).max(16).error(new Error('无效昵称'))

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

export const schemaMyVideo = verify({
  ...page,
  state: Joi.number().min(0).max(2).error(new Error('无效状态'))
})

export const schemaFromId = verify({
  videoId: Joi.string().max(64).error(new Error('无效视频'))
})
