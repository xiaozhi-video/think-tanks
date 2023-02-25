import { createReadStream, ReadStream } from 'fs'
import fs from 'fs/promises'
import { nanoid } from 'nanoid'
import { auth, conf, form_up, rs, zone } from 'qiniu'
import { baseUrl, os } from '../config'

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

function imagePutStream(readableStream: ReadStream) {
  return new Promise((resolve, reject) => {
    const formUploader = new form_up.FormUploader(config)
    const putExtra = new form_up.PutExtra()
    formUploader.putStream(getImageToken(), 'image/' + nanoid(), readableStream, putExtra, async (respErr, respBody, respInfo) => {
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

export async function uploadImage(path1: string) {

  let error
  let info: any
  let readableStream: ReadStream | void
  try {
    readableStream = createReadStream(path1)
    info = await imagePutStream(readableStream)
  } catch(err) {
    error = err
  }
  if(readableStream) readableStream.close()
  await fs.rm(path1)
  if(error) throw error
  return info
}
