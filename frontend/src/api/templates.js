import client from './client'

export const getTemplates = () => client.get('/templates/')
