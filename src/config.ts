import dotenv from 'dotenv'
import path from 'path'

// 加载环境变量
dotenv.config({
  path: path.join(__dirname, './env/.env'),
})

if(process.env.ENV_PATH) {
  dotenv.config({
    path: path.resolve(__dirname, process.env.ENV_PATH),
  })
}
export const port = process.env.PORT || 7001
// 数据库
export const db = {
  host: process.env.MYSQL_HOST as string,
  port: Number(process.env.MYSQL_PORT) as number ,
  user: process.env.MYSQL_USER as string,
  password: process.env.MYSQL_PASS as string,
  database: process.env.MYSQL_DATABASE as string,
}

// 短信
export const sms = {
  accessKeyId: process.env.ACCESS_KEY_ID as string,
  accessKeySecret: process.env.ACCESS_KEY_SECRET as string
}

export const node_env = process.env.NODE_ENVs

export const jwtKey = process.env.JWT_KEY as string