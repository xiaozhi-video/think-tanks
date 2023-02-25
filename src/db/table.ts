import flq from './'

export const user = flq.from('user')

export const admin = flq.from('admin')

export const video = flq.from('video')

export const classify = flq.from('classify')

export const videoCollection = flq.from('video_collection')

export const comment = flq.from('comment')

export const collection = flq.from('collection')

export const permissions = flq.from('permissions')

export const carousel = flq.from('carousel')

export const bullet = flq.from('bullet')

export const like = flq.from('`like`').where({ deleteAt: 0 })

export const history = flq.from('history').where({ deleteAt: 0 })
