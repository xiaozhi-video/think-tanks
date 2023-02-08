// This file is auto-generated, don't edit it
import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525'
import { SendSmsResponse } from '@alicloud/dysmsapi20170525'
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
import * as $OpenApi from '@alicloud/openapi-client'
import * as $Util from '@alicloud/tea-util'
import { sms } from '../config'

const { accessKeyId, accessKeySecret } = sms

function createClient(accessKeyId: string, accessKeySecret: string): Dysmsapi20170525 {
  let config = new $OpenApi.Config({
    // 必填，您的 AccessKey ID
    accessKeyId: accessKeyId,
    // 必填，您的 AccessKey Secret
    accessKeySecret: accessKeySecret,
  })
  // 访问的域名
  // config.endpoint = `dysmsapi.aliyuncs.com`
  return new Dysmsapi20170525(config)
}

export default async function sendCode(code: string): Promise<SendSmsResponse> {
  // 工程代码泄露可能会导致AccessKey泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考，建议使用更安全的 STS 方式，更多鉴权访问方式请参见：https://help.aliyun.com/document_detail/378664.html
  let client = createClient(accessKeyId, accessKeySecret)
  let sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
    signName: "阿里云短信测试",
    templateCode: "SMS_154950909",
    phoneNumbers: "17652532583",
    templateParam: `{\"code\":\"${ code }"}`,
  })
  let runtime = new $Util.RuntimeOptions({})
  // 复制代码运行请自行打印 API 的返回值
  return await client.sendSmsWithOptions(sendSmsRequest, runtime)
}