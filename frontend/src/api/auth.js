import client from './client'

export const register = (data) => client.post('/auth/register', data)
export const login = (data) => client.post('/auth/login', data)
export const getMe = () => client.get('/auth/me')
export const refresh = (refreshToken) =>
  client.post('/auth/refresh', { refresh_token: refreshToken })