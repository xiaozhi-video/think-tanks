import Joi from "joi"
import Koa from "koa"
import { ParameterError } from '../error'

export const imgUrl = Joi.string().required().min(16).max(50).error(new Error('无效图片路径'))

export default function verify(a: any): Koa.Middleware {
  const schema = Joi.object(a)
  return async (ctx, next) => {
    let d: any
    if(ctx.method === 'GET') {
      d = ctx.query
    } else {
      d = ctx.request.body
    }
    if(typeof d !== 'object') {
      throw new ParameterError('参数为空')
    }
    const { value, error } = schema.validate(d)
    if(error) {
      throw new ParameterError(error.message)
    } else {
      ctx.value = value
      await next()
    }
  }
}