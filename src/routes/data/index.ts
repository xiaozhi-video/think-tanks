import flq from '../../db'
import { authAdmin } from '../../utils/jwt'
import Router from '../../utils/Router'

const router = new Router

router.get('/hal7', authAdmin(), async (ctx) => {
  const ctn = await flq.getConnect()

  const history: any[] = await flq.query(`select date_format(createdAt, '%m月%d日') date, count(*) count
from \`history\`
WHERE date_sub(curdate(), interval 7 day) <= date(\`createdAt\`)
group by date_format(createdAt, '%Y-%m-%d')  ORDER BY \`createdAt\` -1;`, ctn)

  const like: any[] = await flq.query(`select date_format(createdAt, '%m月%d日') date, count(*) count
from \`like\`
WHERE date_sub(curdate(), interval 7 day) <= date(\`createdAt\`)
group by date_format(createdAt, '%Y-%m-%d')  ORDER BY \`createdAt\` -1;`, ctn)

  //@ts-ignore
  ctn.release()

  const dateSet = new Set([...like,...history].map(e => e.date))
  const sort = Array.from(dateSet).sort((a ,b) => a > b ? 1 : -1)
  const sortData = sort.map(date => {
    const data: any = {date}
    const ld = like.find(e => e.date === date)
    const hd = history.find(e => e.date === date)
    if(ld) data.like = ld.count
    else data.like = 0
    if(hd) data.history = hd.count
    else data.history = 0
    return data
  })
  ctx.succeed({
    data: sortData
  })
})

export default router.routes()
