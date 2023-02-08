import Joi from "joi"
import verify, { imgUrl } from '../../../verify'
// 注册
export const schemaEnroll = verify({
  // 昵称
  nickname: Joi.string().required().min(2).max(16).error(new Error('无效昵称')),
  // 密码
  password: Joi.string().required().min(8).max(16).error(new Error('无效密码')),
  // 电话
  phone: Joi.string().required().pattern(/^1[3456789]\d{9}$/).error(new Error('无效手机号')),
  // 验证码
  code: Joi.string().required().min(6).max(6).error(new Error('无效验证码')),
})

// 发送验证码
export const schemaSendCode = verify({
  phone: Joi.string().required().pattern(/^1[3456789]\d{9}$/).error(new Error('无效手机号')),
})

// 登录
export const schemaLogin = verify({
  // 手机号
  phone: Joi.string().required().pattern(/^1[3456789]\d{9}$/).error(new Error('无效手机号')),
  // 密码
  password: Joi.string().required().min(8).max(16).error(new Error('无效密码')),
})

// 修改头像
export const schemaChangeAvatar = verify({
  // 用户id
  user_id: Joi.string().required().error(new Error('无效用户id')),
  // 头像
  avatar: imgUrl,
})