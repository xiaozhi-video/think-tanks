import jsonwebtoken from 'jsonwebtoken'
import Koa, { DefaultContext, DefaultState } from "koa"
import { jwtKey } from '../config'
import { PermissionError } from '../error'
import { user } from '../db/table'

function getToken(ctx: DefaultState): string | void {
  const field = 'Bearer '
  const { authorization } = ctx.request.headers
  if(typeof authorization !== 'string') return
  const si = authorization.indexOf(field)
  if(si === -1) return
  let token
  const ei = authorization.indexOf(' ', si + field.length)
  if(ei === -1) {
    token = authorization.slice(si + field.length)
  } else {
    token = authorization.slice(si + field.length, ei)
  }
  return token
}

export interface AuthUserOptions {
  permission?: string
  optional?: boolean
}

export interface AuthUser {
  // permissions?: string[]
  userId: number
  nickname: string
  phone: string
}

export type AuthUserContext = DefaultContext & { authUser: AuthUser }

export default function authUser(options: AuthUserOptions): Koa.Middleware<DefaultState, AuthUserContext, any> {
  return async (ctx: AuthUserContext, next: () => Promise<void>) => {
    const token = getToken(ctx)
    const { permission, optional } = options
    if(!token) {
      if(optional) {
        throw new PermissionError()
      } else {
        return next()
      }
    }
    let info: any
    try {
      info = jsonwebtoken.verify(jwtKey, token)
    } catch(err: any) {
      if(optional) {
        throw new PermissionError(err.message)
      } else {
        return next()
      }
    }
    const { id } = info
    const userInfo = await user.where({ user_id: id }).first()
    if(!userInfo) {
      if(optional) {
        throw new PermissionError('无效token')
      } else {
        return next()
      }
    }
  }
}
