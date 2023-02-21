import { os } from '../../config'
import { carousel } from '../../db/table'
import { ParameterError } from '../../error'
import { authAdmin } from '../../utils/jwt'
import Router from '../../utils/Router'
import { schemaCarousel } from './verify'

const router = new Router

router.put('/', schemaCarousel, authAdmin({
  permission: 'carousel',
}), async (ctx) => {
  await carousel.remove()
  const { carousel: params } = ctx.verify
  await Promise.all(params.map((p, index) => {
    if(p.videoId) {
      delete p.url
    } else {
      if(!p.url) throw new ParameterError('外链和视频ID不能同时为空')
    }
    carousel.value({ ...p, index }).add()
  }))
  ctx.succeed()
})

router.get('/', async (ctx) => {
  const data = await carousel.vget(['imagePreview']).order({ index: 'ASC' }).find()
  data.forEach(e => {
    e.imagePreview = e.image
    e.image = e.image.replace(os.imageAsstesBaseUrl, '').replace('!video.cover', '')
  })
  ctx.succeed({ data })
})

export default router.routes()
