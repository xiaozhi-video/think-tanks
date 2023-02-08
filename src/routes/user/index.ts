import Router from 'koa-router'
// @ts-ignore
import md5 from 'md5'
import { node_env } from '../../config'
import { user } from '../../db/table'
import { awaitTime, log } from '../../utils'
import authCode from '../../utils/code'
import sendCode from '../../utils/sendCode'
import { schemaEnroll, schemaSendCode } from './verify'

const router = new Router()

router.post('/enroll', schemaEnroll, async (ctx, next) => {
  const { phone, code, password, nickname } = ctx.value
  if(authCode.has(phone, code) || 1) {
    const res = await user.value({
      phone,
      nickname,
      password: md5(password),
    }).add()
    console.log(res.lastInsertId)
    ctx.succeed('success')
  } else {
    ctx.custom(401, '验证码错误')
  }
})

router.post('/sendCode', schemaSendCode, async (ctx, next) => {
  const { phone } = ctx.value
  const code = authCode.add(phone)
  const res = await sendCode(code)
  await awaitTime(100)
  if(res.body.code === 'OK') {
    ctx.succeed('OK')
    if(node_env) log('发送验证码', {
      phone,
      code,
    })
  } else {
    ctx.custom(401, res.body.message || '未知错误')
    authCode.destroy(phone)
  }
})

router.post('/myInfo', (ctx) => {
  
})

export default router.routes()