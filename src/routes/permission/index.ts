import { admin, permissions, permissions as ptable } from '../../db/table'
import { NoResourcesError, ParameterError } from '../../error'
import { authAdmin } from '../../utils/jwt'
import Router from '../../utils/Router'
import { schemaGetDescription, schemaPutPermissions } from './verify'

const router = new Router

router.get('/', authAdmin({
  permission: 'adminerEdit',
}), async (ctx) => {
  const data = await permissions.find()
  ctx.succeed({
    data,
  })
})

router.put('/', schemaPutPermissions, authAdmin({ permission: 'adminerEdit' }), async (ctx) => {
  const { adminId, permissions } = ctx.verify
  const ps = Array.from(new Set(permissions))
  const ped = await ptable.where({
    permissionId: {
      com: 'IN',
      val: ps,
    },
  }).count()
  if(ped !== ps.length) {
    throw new ParameterError('部分权限不存在')
  }
  if(ps.includes('common')) ps.unshift('common')
  const { affectedRows } = await admin.where({ adminId }).set({ permissions: ps.join(',') }).update()
  if(!affectedRows) {
    throw new NoResourcesError('指定用户不存在')
  }
  ctx.succeed()
})

export default router.routes()
