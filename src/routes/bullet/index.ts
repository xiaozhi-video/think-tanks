import { bullet } from '../../db/table'
import { ParameterError } from '../../error'
import { authAdmin, authUser } from '../../utils/jwt'
import Router from '../../utils/Router'
import { schemaVideoId } from '../../verify'
import { schemaBullet, schemaDelBullet } from './verify'

const router = new Router

router.post('/', schemaBullet, authUser(), async (ctx) => {
  const { videoId, text, color, time } = ctx.verify
  const { userId } = ctx.authUser
  await bullet.value({
    videoId,
    text,
    color,
    time,
    userId,
  }).add()
  ctx.succeed()
})

router.get('/', schemaVideoId, async (ctx) => {
  const { videoId } = ctx.verify
  const data = await bullet.where({ videoId }).order({ time: 1 }).find()
  ctx.succeed({ data })
})

router.del('/', schemaDelBullet, authAdmin(), async (ctx) => {
  const { id } = ctx.verify
  const { affectedRows } = await bullet.where({
    id,
  }).remove()
  if(!affectedRows) {
    throw new ParameterError('找不到弹幕')
  }
  ctx.succeed()
})

export default router.routes()
