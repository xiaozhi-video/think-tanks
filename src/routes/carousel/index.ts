import { os } from '../../config'
import { carousel } from '../../db/table'
import { authAdmin } from '../../utils/jwt'
import Router from '../../utils/Router'
import { schemaCarousel } from './verify'

const router = new Router

router.put('/', schemaCarousel, authAdmin({
  permission: 'carousel',
}), async (ctx) => {
  await carousel.remove()
  const { carousel: params } = ctx.verify
  await Promise.all(params.map(({ image, url, id }, index) => carousel.value({ image, url, index, id }).add()))
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
