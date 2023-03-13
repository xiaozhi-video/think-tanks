import Joi from 'joi'
import verify, { page, videoId } from '../../verify'

const submit = {
  cover: Joi.string().required().min(1).max(128).error(new Error('无效封面')),
  title: Joi.string().required().min(5).max(64).error(new Error('无效标题')),
  describe: Joi.string().required().min(2).max(255).error(new Error('无效描述')),
  classify: Joi.string().required().pattern(/^[\u4e00-\u9fa5\-_.a-z0-9]{2,8}$/i).error(new Error('无效分类')),
  videoUrl: Joi.string().required().min(1).max(128).error(new Error('无效视频')),
  collectionId: Joi.number().error(new Error('无效合集')),
}

export const schemaSubmit = verify(submit)

export const schemaModify = verify({
  ...submit,
  videoId,
})

export const schemaSchema = verify({
  keyWord: Joi.string().min(0).max(128).error(new Error('无效关键词')),
  classify: Joi.string().max(8).error(new Error('无效分类')),
  ...page,
})

export const schemaFromId = verify({
  videoId,
})
