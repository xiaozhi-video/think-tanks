import { Flq } from 'flq'
import {db} from '../config'
const flq = new Flq({
  pool: true, // 使用连接池 !推荐使用
  ...db
})

flq.setModel({
  user: {

  }
})

export default flq