import Joi from "joi"
import verify, { videoId } from '../../verify'
export const schemaBullet = verify({
  videoId,
  text: Joi.string().required().min(1).max(32).error(new Error('弹幕')),
  time: Joi.number().required().min(0).error(new Error('无效时间')),
  color: Joi.string().max(16).error(new Error('无效颜色'))
})

export const schemaDelBullet = verify({
  id: Joi.number().required().error(new Error('无效id'))
})
