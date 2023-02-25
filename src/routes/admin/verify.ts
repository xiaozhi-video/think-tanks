import Joi from "joi"
import verify, { imgUrl, keyWord, page } from '../../verify'

const password = Joi.string().required().min(8).max(16).error(new Error('无效密码'))
const nickname = Joi.string().required().min(2).max(16).error(new Error('无效昵称'))

export const schemaLogin = verify({
  nickname,
  password,
})

export const schemaRegister = verify({
  nickname,
  password: Joi.string().required().min(8).max(16).error(new Error('无效密码')),
})

export const schemaEdit = verify({
  nickname,
  photo: Joi.string().required().max(64).error(new Error('无效头像')),
})

export const schemaChangePhoto = verify({
  photo: imgUrl,
})

export const schemaChangeNickname = verify({
  nickname,
})

export const schemaChangePassword = verify({
  oldPassword: password,
  newPassword: password
})

export const schemaList = verify({
  keyWord,
  permission: Joi.string().min(0).max(32).error(new Error('无效权限')),
  ...page,
})

export const schemaFromId = verify({
  adminId: Joi.number().required().error(new Error('无效管理员')),
})

export const schemaVideo = verify({
  keyWord,
  userId: Joi.number().error(new Error('无效用户')),
  classify: Joi.string().min(0).max(8).error(new Error('无效分类')),
  state: Joi.number().min(0).max(2).error(new Error('无效状态')),
  ...page,
})

export const schemaVideoFromId = verify({
  videoId: Joi.string().required().max(64).error(new Error('无效视频'))
})
