import { sql } from 'flq'
import { history, like, video } from '../../db/table'
import { NoResourcesError, ParameterError } from '../../error'
import { authUser } from '../../utils/jwt'
import Router from '../../utils/Router'
import verify, { page, schemaVideoId } from '../../verify'

const router = new Router

router.post('/', schemaVideoId, authUser(), async (ctx) => {
  const { verify: { videoId }, authUser: { userId } } = ctx
  try {
    await like.value({
      videoId,
      userId,
      createdAt: new Date(),
    }).add()
    ctx.succeed()
  } catch(err) {
    console.log(err)
    throw new ParameterError('重复操作')
  }
  const { affectedRows } = await video.where({ videoId, state: 2, deleteAt: 0 }).set({
    likeCount: sql('likeCount + 1'),
  }).update()
  if(!affectedRows) {
    await like.where({
      videoId,
      userId,
    }).remove()
    throw new NoResourcesError('找不到视频')
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
  await video.where({ videoId, state: 2, deleteAt: 0 }).set({
    likeCount: sql('likeCount - 1'),
  }).update()
  ctx.succeed()
})

router.get('/', verify(page), authUser(), async (ctx) => {
  const { pageNumber, pageSize } = ctx.verify
  const { userId } = ctx.authUser
  const data = await like.where({
    userId,
  }).order({
    createdAt: -1,
  }).limit({
    size: pageSize,
    page: pageNumber,
  }).vget(['video']).findRows()
  ctx.succeed(data)
})

export default router.routes()
