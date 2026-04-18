import client from './client'

export const getChatMessages = (cvId) => client.get(`/cvs/${cvId}/chat/`)
export const createChatMessage = (cvId, data) => client.post(`/cvs/${cvId}/chat/`, data)
