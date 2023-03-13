import Joi from 'joi'
import verify, { page } from '../../verify'

const text = Joi.string().required().min(1).max(255).error(new Error('无效评论'))
const videoId = Joi.string().required().min(1).max(32).error(new Error('无效视频ID'))
const replyId = Joi.number().required().error(new Error('无效评论ID'))

export const schemaComment = verify({
  videoId,
  text,
})

export const schemaReply = verify({
  replyId,
  text,
})

export const schemaVideo = verify({
  videoId,
  ...page,
})

export const schemaGetReply = verify({
  commentId: replyId,
  ...page,
})


export const schemaDel = verify({
  commentId: Joi.number().error(new Error('无效评论')),
})
