import flq from '../../db'

export async function removeLike(videoId: string) {
  await flq.from('`like`').where({
    videoId,
  }).set({
    deleteAt: 1,
  }).update()
}

export async function recoveryLike(videoId: string) {
  await flq.from('`like`').where({
    videoId,
  }).set({
    deleteAt: 0,
  }).update()
}
