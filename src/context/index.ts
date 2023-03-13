import Koa from 'koa'

/**
 * 参数错误
 */
export function parameterError(this: Koa.Context, error: Error) {
  this.body = error.message
  this.status = 400
}

/**
 * 成功
 * @param body
 */
export function succeed(this: Koa.Context, body: any = {}) {
  this.body = body
  this.status = 200
}

export function custom(this: Koa.Context, status: number, body: any) {
  this.body = body
  this.status = status
}

declare module 'koa' {
  interface DefaultContext {
    parameterError: (data: any) => Promise<void>
    succeed: (data?: any) => Promise<void>
    custom: (status: number, body: any) => Promise<void>
    value: any
  }
}
