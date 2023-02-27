import mdb from './index'

export interface UserField {
  userId: string
  nickname: string
  banned: boolean
  phone: string
  password: string
  createdAt: Date
  deleteAt: boolean
  state: number
}

export interface VideoField {
  videoId: string
  userId: string
  cover: string[]
  describe: string
  classify: string
  collectionId: string
  title: string
  updateAt: Date
  createdAt: Date
}

export const muser = mdb.collection<Partial<UserField>>('user')

export const mvideo = mdb.collection<Partial<VideoField>>('video')
