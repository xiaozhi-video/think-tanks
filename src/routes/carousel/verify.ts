import Joi from 'joi'
import verify from '../../verify'

export const schemaCarousel = verify({
  carousel: Joi.array().items(Joi.object({
    id: Joi.string().max(32).error(new Error('无效id')),
    image: Joi.string().required().max(64).error(new Error('无效图片')),
    url: Joi.string().min(0).max(255).optional().error(new Error('无效外链')),
    videoId: Joi.string().min(0).max(32).optional().error(new Error('无效视频')),
  })),
})
