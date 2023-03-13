import Joi from 'joi'
import verify from '../../verify'

const adminId = Joi.number().required().error(new Error('无效用户ID'))

export const schemaPutPermissions = verify({
  adminId,
  permissions: Joi.array().items(Joi.string().max(32)).required().error(new Error('无效权限列表')),
})

export const schemaGetDescription = verify({
  adminId,
})
