import { os } from '../../config'
import { comment, video } from '../../db/table'
import { NoResourcesError } from '../../error'
import { authUser, AuthUserContext } from '../../utils/jwt'
import Router from '../../utils/Router'
import {
  schemaComment,
  schemaDel,
  schemaGetReply,
  schemaReply,
  schemaVideo,
} from './verify'

const router = new Router

async function isAuthor(ctx: AuthUserContext, videoId: string) {
  const data = await video.where({ videoId }).first()
  if(!data) throw new NoResourcesError('视频不存在')
  return data.userId === ctx.authUser.userId
}

router.post('/component', schemaComment, authUser(), async (ctx) => {
  const { videoId, text } = ctx.verify
  const { userId } = ctx.authUser
  const ia = await isAuthor(ctx, videoId)
  await comment.value({ videoId, text, createdAt: new Date(), isAuthor: ia, userId }).add()
  ctx.succeed()
})

router.post('/reply', schemaReply, authUser(), async (ctx) => {
  const { replyId, text } = ctx.verify
  const { userId } = ctx.authUser
  const reply = await comment.where({ commentId: replyId }).field('videoId', 'topCommentId').first()
  if(!reply) throw new NoResourcesError('要回复的评论不存在')
  const { videoId } = reply
  let { topCommentId } = reply
  if(!topCommentId) {
    topCommentId = replyId
  }
  const ia = await isAuthor(ctx, videoId)
  await comment.value({
    createdAt: new Date(),
    replyId,
    text,
    videoId,
    userId,
    isAuthor: ia,
    topCommentId,
  }).add()
  ctx.succeed()
})

router.del('/', schemaDel, authUser(), async (ctx) => {
  const { userId } = ctx.authUser
  const { commentId } = ctx.verify
  const { affectedRows } = await video.where({ commentId, userId }).remove()
  if(!affectedRows) throw new NoResourcesError('找不到评论')
  ctx.succeed()
})

router.get('/video', schemaVideo, async (ctx) => {
  const { videoId, pageSize, pageNumber } = ctx.verify
  const data = await comment.where({ videoId, topCommentId: { com: 'IS NULL' } }).order({ createdAt: -1 }).limit({
    size: pageSize,
    page: pageNumber,
  }).vget([ 'topReply', 'user' ]).findRows()
  ctx.succeed(data)
})

router.get('/reply', schemaGetReply, async (ctx) => {
  const { commentId, pageSize, pageNumber } = ctx.verify
  const data = await comment.where({ topCommentId: commentId }).order({ createdAt: -1 }).vget([ 'user', 'replyUser' ]).limit({
    size: pageSize,
    page: pageNumber,
  }).findRows()
  ctx.succeed(data)
})

export default router.routes()

