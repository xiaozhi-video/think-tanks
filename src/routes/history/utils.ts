import flq from '../../db'
import { history } from '../../db/table'

export async function removeHistory(videoId: string) {
  await flq.from('history').where({
    videoId,
  }).set({
    deleteAt: 1,
  }).update()
}

export async function recoveryHistory(videoId: string) {
  await flq.from('history').where({
    videoId,
  }).set({
    deleteAt: 0,
  }).update()
}
