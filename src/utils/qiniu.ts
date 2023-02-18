import fs from 'fs/promises'
import { nanoid } from 'nanoid'
import { auth, conf, form_up, rs, zone } from 'qiniu'
import { os, baseUrl } from '../config'

const mac = new auth.digest.Mac(os.accessKey, os.secretKey)

const config = new conf.Config({ zone: zone.Zone_z0 })
// const bucketManager = new rs.BucketManager(mac, config)

export function geVideotToken() {
  const saveKey = 'video/' + nanoid() + '.mp4'
  const putPolicy = new rs.PutPolicy({
    scope: 'think-tanks',
    saveKey,
    callbackUrl: baseUrl + '/upload/succeed',
    callbackBody: 'key=$(key)&hash=$(etag)&avinfo=$(avinfo)',
    mimeLimit: 'video/mp4',
    fsizeLimit: 1048576 * 200,
  })
  return putPolicy.uploadToken(mac)
}

export function getImageToken() {
  const putPolicy = new rs.PutPolicy({
    scope: 'think-tanks',
    mimeLimit: 'image/*',
    fsizeLimit: 1048576 * 200,
  })
  return putPolicy.uploadToken(mac)
}

export function uploadImage(path: string): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const formUploader = new form_up.FormUploader(config)
    const putExtra = new form_up.PutExtra()
    const fileHandle = await fs.open(path, 'r')
    const readableStream = await fileHandle.createReadStream()
    formUploader.putStream(getImageToken(), 'image/' + nanoid(), readableStream, putExtra, async (respErr, respBody, respInfo) => {
      try {
        await fileHandle.close()
        await fs.rm(path)
      } catch(err) {
        reject(err)
      }
      if(respErr) {
        reject(respErr)
      }
      if(respInfo.statusCode == 200) {
        resolve(respInfo)
      } else {
        reject(respInfo.statusCode)
      }
    })
  })
}
