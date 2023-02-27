import {MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017')

export default client.db('tts')
