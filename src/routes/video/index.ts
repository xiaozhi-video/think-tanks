import { sql } from 'flq'
import { nanoid } from 'nanoid'
import { classify, video, videoCollection } from '../../db/table'
import { NoResourcesError, ParameterError } from '../../error'
import { authAdmin, authUser } from '../../utils/jwt'
import Router from '../../utils/Router'
import verify, { page, VerifyContext } from '../../verify'
import { schemaFromId, schemaModify, schemaSchema, schemaSubmit } from './verify'

const router = new Router

export async function existVideo(ctx: VerifyContext<{ videoId: string }>) {
  const data = await video.where({ videoId: ctx.verify.videoId }).find()
  if(!data) throw new NoResourcesError()
}

async function verifyDB(ctx: any) {
  const { classify: name, collectionId } = ctx.verify
  if(collectionId) {
    const ced = await videoCollection.where({ collectionId }).count()
    if(!ced) {
      throw new ParameterError('合集不存在')
    }
  }
  const ced = await classify.where({ name }).count()
  if(!ced) {
    throw new ParameterError('分类不存在')
  }
}

async function submit(state: number, ctx: any) {
  const videoId = nanoid()
  const { userId } = ctx.authUser
  const { title, describe, cover, classify: name, videoUrl, collectionId } = ctx.verify
  await verifyDB(ctx)
  await video.value({
    videoId,
    title,
    describe,
    cover,
    classify: name,
    videoUrl,
    state,
    userId,
    createdAt: new Date(),
  }).add()
  return { videoId }
}

router.post('/', schemaSubmit, authUser(), async (ctx) => {
  const data = await submit(1, ctx)
  ctx.succeed(data)
})

router.post('/draft', schemaSubmit, authUser(), async (ctx) => {
  const data = await submit(0, ctx)
  ctx.succeed(data)
})

router.put('/', schemaModify, authUser(), async (ctx) => {
  const { userId } = ctx.authUser
  const { title, describe, cover, classify: name, videoUrl, collectionId, videoId } = ctx.verify
  await existVideo(ctx)
  await verifyDB(ctx)
  const { affectedRows } = await video.where({ videoId, userId }).set({
    title,
    describe,
    cover,
    classify: name,
    videoUrl,
    collectionId,
    updateAt: new Date,
  }).update()
  if(!affectedRows) throw new NoResourcesError()
  ctx.succeed()
})

router.del('/', schemaFromId, authUser(), async (ctx) => {
  const { userId } = ctx.authUser
  const { videoId } = ctx.verify
  const { affectedRows } = await video.where({ videoId, userId }).set({
    updateAt: new Date,
    deleteAt: 1,
    state: 0,
  }).update()
  if(!affectedRows) throw new NoResourcesError()
  ctx.succeed()
})

router.get('/schema', schemaSchema, async (ctx) => {
  const { pageNumber, pageSize, keyWord, classify } = ctx.verify
  let flq = video.limit({
    size: pageSize,
    page: pageNumber,
  }).vget([ 'user' ])
  if(keyWord) {
    flq = flq.where({
      title: `%${ keyWord }%`,
      describe: `%${ keyWord }%`,
      classify: `%${ keyWord }%`,
    }, 'OR', 'LIKE')
  }
  if(classify) {
    flq = flq.where({ classify })
  }
  const data = await flq.where({
    state: 2,
  }).findRows()
  ctx.succeed(data)
})

router.get('/fromId', schemaFromId, authUser({
  optional: true,
}), async (ctx) => {
  const { videoId } = ctx.verify
  const data = await video.where({ videoId, state: 2 }).vget([ 'user' ]).first()
  if(!data) throw new NoResourcesError('找不到视频')
  await video.where({ videoId }).set({ readCount: sql(`readCount + 1`) })
  ctx.succeed({ data })
})

router.put('/audit', schemaFromId, authAdmin({
  permission: 'videoAudit',
}), async (ctx) => {
  const { videoId } = ctx.verify
  const { affectedRows } = await video.where({ videoId }).set({
    state: 2,
  }).update()
  if(!affectedRows) throw new NoResourcesError('找不到视频')
  ctx.succeed()
})

router.put('/cancel', schemaFromId, authUser(), async (ctx) => {
  const { userId } = ctx.authUser
  const { videoId } = ctx.verify
  const { affectedRows } = await video.where({ userId, videoId }).set({
    state: 0,
  }).update()
  if(!affectedRows) throw new NoResourcesError('找不到视频')
  ctx.succeed()
})

router.put('/unpush', schemaFromId, authAdmin({
  permission: 'videoList',
}), async (ctx) => {
  const { videoId } = ctx.verify
  const { affectedRows } = await video.where({ videoId }).set({
    state: 0,
  }).update()
  if(!affectedRows) throw new NoResourcesError('找不到视频')
  ctx.succeed()
})

router.get('/home', verify({
  ...page
}), async (ctx) => {
  const {pageNumber, pageSize} = ctx.verify
  const data = await video.where({
    state: 2,
    deleteAt: 0,
  }).order({ sortValue: '-1' }).limit({ page: pageNumber, size: pageSize }).find()
  ctx.succeed(data)
})

export default router.routes()
