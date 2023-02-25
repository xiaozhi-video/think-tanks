import { history } from '../../db/table'
import { authUser } from '../../utils/jwt'
import Router from '../../utils/Router'
import verify, { page } from '../../verify'

const router = new Router

router.get('/', verify(page), authUser(), async (ctx) => {
  const { pageNumber, pageSize } = ctx.verify
  const { userId } = ctx.authUser
  const data = await history.where({
    userId,
  }).order({
    createdAt: -1,
  }).limit({
    size: pageSize,
    page: pageNumber,
  }).vget(['video']).findRows()
  ctx.succeed(data)
})

export default router.routes()
