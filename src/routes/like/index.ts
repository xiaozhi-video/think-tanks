import { like } from '../../db/table'
import { ParameterError } from '../../error'
import { authUser } from '../../utils/jwt'
import Router from '../../utils/Router'
import { schemaVideoId } from '../../verify'

const router = new Router

router.post('/', schemaVideoId, authUser(), async (ctx) => {
  const { verify: { videoId }, authUser: { userId } } = ctx
  try {
    await like.value({
      videoId,
      userId,
    }).add()
    ctx.succeed()
  } catch(err) {
    throw new ParameterError('重复操作')
  }
})

router.del('/', schemaVideoId, authUser(), async (ctx) => {
  const { verify: { videoId }, authUser: { userId } } = ctx
  const { affectedRows } = await like.where({
    videoId,
    userId,
  }).remove()
  if(!affectedRows) {
    throw new ParameterError('重复操作')
  }
  ctx.succeed()
})

export default router.routes()
