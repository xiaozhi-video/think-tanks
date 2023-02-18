import Joi from "joi"
import Koa from "koa"
import { ParameterError } from '../error'

export const imgUrl = Joi.string().required().min(16).max(50).error(new Error('无效图片路径'))

export interface VerifyContext<V> extends Koa.DefaultContext {
  verify: V
}

export const page = {
  pageNumber: Joi.number().default(1).error(new Error('无效页码')),
  pageSize: Joi.number().default(10).error(new Error('无效每页大小')),
}

type Deduce<T> = T extends Joi.StringSchema ? string : T extends Joi.NumberSchema ? number : T extends Joi.ArraySchema ? any[] : unknown

export default function verify<V extends Object>(a: V): Koa.Middleware<Koa.DefaultState, VerifyContext<{ [K in keyof V]: Deduce<V[K]> }>> {
  const schema = Joi.object(a)
  return async (ctx, next) => {
    let d: any
    if(ctx.method === 'GET' || ctx.method === 'DELETE') {
      d = ctx.query
    } else {
      d = ctx.request.body
    }
    for(const dKey in d) {
      if(d[dKey] === null) {
        delete d[dKey]
      }
    }
    if(typeof d !== 'object') {
      throw new ParameterError('参数为空')
    }
    const { value, error } = schema.validate(d)
    if(error) {
      throw new ParameterError(error.message)
    } else {
      ctx.verify = value
      await next()
    }
  }
}

export const schemaVideoId = verify({
  videoId: Joi.string().required().max(32).error(new Error('无效视频')),
})
