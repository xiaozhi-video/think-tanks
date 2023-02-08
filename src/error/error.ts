import { Context } from "koa";
import { ParameterError, PermissionError } from './index'

export default async function(ctx: Context, error: any) {
  if(error instanceof ParameterError) {
    ctx.status = 400;
    ctx.body = {
      message: '参数校验错误',
      detail: error.message
    }
  } else if(error instanceof PermissionError) {
    ctx.status = 403;
    ctx.body = {
      message: '无权访问资源',
      detail: error.message
    }
  } else {
    ctx.status = 500;
    ctx.body = '未知错误'
  }
}