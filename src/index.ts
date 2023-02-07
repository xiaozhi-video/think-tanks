import Koa from 'koa'
import koaBody from 'koa-body'
import cors from 'koa2-cors'
import { port } from './config'
import * as context from './context/index'
// import { getUser } from './tool/user.js'
import router from './routes/index'
import { log } from './utils'

const app = new Koa()
app.use(
  cors({
    origin: '*',
  }),
)

Object.entries(context).forEach((e) => {
  app.context[e[0]] = e[1]
})

app.use(async (ctx, next) => {
  // ctx.state.user = await getUser(ctx)
  log(
    '发起请求',
    {
      ip: ctx.ip,
      method: ctx.method,
      url: ctx.path,
      user: ctx.state.user,
      'Content-Type': ctx.req.headers['content-type'],
    },
    true,
  )
  await next()
  if(!ctx.body) ctx.error(404)
})
app.use(koaBody())

app.use(router)

app.listen(port, () => {
  console.log(
    `项目运行到 http://localhodt:${ port }`,
  )
})
