import Joi from "joi"
import verify from '../../verify'

const name = Joi.string().required().min(2).max(8).error(new Error('无效分类'))

export const schemaClassify = verify({
  name,
  icon: Joi.string().required().max(128).error(new Error('无效图标'))
})

export const schemaRemoveClassify = verify({
  name
})
