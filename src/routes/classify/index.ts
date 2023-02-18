import { classify } from '../../db/table'
import { NoResourcesError, ParameterError } from '../../error'
import { authAdmin } from '../../utils/jwt'
import Router from '../../utils/Router'
import { schemaClassify, schemaRemoveClassify } from './verify'

const router = new Router

router.get('/', async (ctx) => {
  const data = await classify.vget([ 'count' ]).find()
  ctx.succeed({ data })
})

router.post('/', schemaClassify, authAdmin({ permission: 'videoClassify' }), async (ctx) => {
  const { name, icon } = ctx.verify
  const sed = await classify.where({ name }).count()
  if(sed) {
    throw new ParameterError('重复分类')
  }
  await classify.value({ name, icon }).add()
  ctx.succeed()
})

router.del('/', schemaRemoveClassify, authAdmin({ permission: 'videoClassify' }), async (ctx) => {
  const { name } = ctx.verify
  const { affectedRows } = await classify.where({ name }).remove()
  if(!affectedRows) throw new NoResourcesError()
  ctx.succeed()
})

export default router.routes()
