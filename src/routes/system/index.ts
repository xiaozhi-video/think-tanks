import { authAdmin } from '../../utils/jwt'
import Router from '../../utils/Router'

const router = new Router

router.get('/homeInfo', authAdmin(), (ctx) => {

})

export default router.routes()
