import jwt from 'jsonwebtoken'
import Koa, { DefaultContext, DefaultState, Middleware } from 'koa'
import { jwtKey } from '../config'
import { admin, user } from '../db/table'
import { AccountBanningError, PermissionError } from '../error'

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

export function sing(a: string | Object) {
  return jwt.sign(a, jwtKey, { expiresIn: 60 * 60 * 24 * 7 })
}

export interface AuthUserOptions {
  permission?: string
  optional?: boolean,
  authButton?: string
}

export interface AuthUser {
  permissions?: string[]
  userId: number
  nickname: string
  phone: string
  avatar: string
  signature: string
}

export interface AuthAdmin {
  permissions?: string[]
  adminId: number
  nickname: string
  photo: string
}

export interface AuthUserContext extends Koa.DefaultContext {
  authUser: AuthUser
}

export interface AuthAdminContext extends DefaultContext {
  authAdmin: AuthAdmin
}

export function authUser<ContextT = Koa.DefaultContext>(options: AuthUserOptions = {}): Middleware<DefaultState, AuthUserContext> {
  return authToken(options, async ({ userId, type }, ctx) => {
    if(type !== 'user' && !options.optional) throw new PermissionError('无效用户组')
    const userInfo = await user.where({ userId }).field([ 'userId', 'phone', 'nickname', 'permissions' ]).first()
    if(userInfo.banned) {
      throw new AccountBanningError()
    }
    ctx.authUser = userInfo
    return userInfo
  })
}

export function authAdmin<ContextT = Koa.DefaultContext>(options: AuthUserOptions = {}): Middleware<DefaultState, AuthAdminContext> {
  return authToken(options, async ({ adminId, type }, ctx) => {
    if(type !== 'admin' && !options.optional) throw new PermissionError('无效用户组')
    const adminInfo = await admin.where({ adminId }).field([ 'adminId', 'permissions', 'nickname', 'authButton' ]).first()
    ctx.authAdmin = adminInfo
    return adminInfo
  })
}

function authToken(options: AuthUserOptions, callBack: (a: any, b: any) => Promise<any>) {
  return async (ctx: DefaultContext, next: () => Promise<void>) => {
    const token = getToken(ctx)
    const { permission, optional, authButton } = options
    if(!token) {
      if(!optional) {
        throw new PermissionError('未登录')
      }
      return await next()
    }
    let info: any
    try {
      info = jwt.verify(token, jwtKey)
    } catch(err: any) {
      if(!optional) {
        console.log(token, err.message)
        throw new PermissionError(err.message)
      } else {
        return await next()
      }
    }
    const userInfo = await callBack(info, ctx)
    if(!userInfo) {
      if(!optional) {
        throw new PermissionError('无效token')
      }
    }

    if(optional) return await next()

    if(permission && !userInfo.permissions.includes(permission) && !userInfo.permissions.includes('superAdmin')) {
      throw new PermissionError('权限不足')
    }
    if(authButton && !userInfo.authButton.includes(authButton)) {
      throw new PermissionError('权限不足')
    }
    await next()
  }
}
