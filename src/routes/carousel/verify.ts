import Joi from "joi"
import verify from '../../verify'
export const schemaCarousel = verify({
  carousel: Joi.array().items(Joi.object({
    image: Joi.string().max(64),
    url: Joi.string().max(255),
    id: Joi.string().max(32).error(new Error('无效id'))
  })).error(new Error('无效轮播')),
})
