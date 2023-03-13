import { Context } from 'koa'
import { AccountBanningError, NoResourcesError, ParameterError, PermissionError } from './index'

export default async function (ctx: Context, error: any) {
  if(error instanceof ParameterError) {
    ctx.status = 400
    ctx.body = {
      message: '参数校验错误',
      detail: error.message,
    }
  } else if(error instanceof PermissionError) {
    console.log(error)
    ctx.status = 401
    ctx.body = {
      message: '无权访问资源',
      detail: error.message,
    }
  } else if(error instanceof NoResourcesError) {
    ctx.status = 405
    ctx.body = {
      message: '找不到资源',
      detail: error.message,
    }
  } else if(error instanceof AccountBanningError) {
    ctx.status = 406
    ctx.body = {
      message: '账户已被封禁',
      detail: error.message,
    }
  } else {
    // console.error(error.message)
    console.log(error)
    ctx.status = 500
    ctx.body = '未知错误'
  }
}
