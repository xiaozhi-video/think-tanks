import { Flq, hooks } from 'flq'
import { db, os } from '../config'
import { bullet, comment, history, permissions as ptable, video } from './table'

const
  flq = new Flq({
    pool: true, // 使用连接池 !推荐使用
    ...db,
    // @ts-ignore
    connectionLimit: 10,
  })

flq.setModel({
  user: {
    permissions: {
      toArray: true,
    },
    avatar: {
      postreat: value => os.asstesBaseUrl + value + '!user.avatar',
    },
    videoCount: {
      async get(row) {
        return await video.where({
          userId: row.userId,
          deleteAt: 0
        }).count()
      },
    },
  },
  admin: {
    photo: {
      postreat: value => os.asstesBaseUrl + value + '!user.avatar',
    },
    permissions: {
      toArray: true,
    },
    permissionsDescription: {
      async get(row) {
        const { permissions } = row
        if(permissions.length === 0) return []
        const ped = await ptable.where({
          permissionId: {
            com: 'IN',
            val: permissions,
          },
        }).find()
        const descriptions = ped.map(e => e.description)
        if(permissions.includes('superAdmin')) {
          descriptions.push('超级管理员')
        }
        return descriptions
      },
    },
    authButton: {
      toArray: true,
    },
  },
  video: {
    cover: {
      postreat: value => os.imageAsstesBaseUrl + value + '!video.cover',
    },
    videoUrl: {
      postreat: value => os.videoAsstesBaseUrl + value,
    },
    videoResolution: {
      get({ videoUrl }) {
        const path = videoUrl.replace(os.videoAsstesBaseUrl, '')
        return {
          '720p': '720p.' + os.videoAsstesBaseUrl + path,
        }
      },
    },
    user: {
      async get({ userId }) {
        return await flq.from('user').field('signature', 'nickname', 'avatar').where({ userId }).first()
      },
    },
  },
  classify: {
    icon: {
      postreat: value => os.imageAsstesBaseUrl + value + '!video.classify.icon',
    },
    count: {
      async get(row) {
        return await flq.from('video').where({ classify: row.name }).count()
      },
    },
  },
  comment: {
    topReply: {
      async get({ commentId }) {
        const fq: Flq = flq.from('comment').where({ topCommentId: commentId })
        return await fq.order([ 'isAuthor', 'createdAt' ], -1).first()
      },
    },
    replyUser: {
      async get({ replyId }) {
        const { userId } = await flq.from('comment').where({ commentId: replyId }).first()
        return await flq.from('user').field('signature', 'nickname', 'avatar').where({ userId }).first()
      },
    },
    user: {
      async get({ userId }) {
        return await flq.from('user').where({ userId }).field('nickname', 'avatar').first()
      },
    },
  },
  permissions: {},
  carousel: {
    image: {
      postreat: value => os.imageAsstesBaseUrl + value + '!video.cover',
    },
  },
  '`like`': {
    video: {
      async get(row) {
        const data = await flq.from('video').field(['videoId', 'title', 'describe', 'cover', 'classify', 'collectionId', 'likeCount', 'readCount', 'sortValue']).where({videoId: row.videoId, state: 2}).first()
        if(!data) return
        Object.assign(row, data)
      }
    }
  },
  bullet: {},
  history: {
    video: {
      async get(row) {
        const data = await flq.from('video').field(['videoId', 'title', 'describe', 'cover', 'classify', 'collectionId', 'likeCount', 'readCount', 'sortValue']).where({videoId: row.videoId, state: 2}).first()
        if(!data) return
        Object.assign(row, data)
      }
    }
  },
  collection: {},
  'auth-button': {},
  'system-settings': {},
  'video-collection': {}
})

hooks.on('format', (a: any) => {
  console.log(a)
})

export default flq
