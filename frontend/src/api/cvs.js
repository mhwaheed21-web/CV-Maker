import client from './client'

export const generateCV = (data) => client.post('/cvs/generate', data)
export const listCVs = () => client.get('/cvs/')
export const getCV = (id) => client.get(`/cvs/${id}`)
export const getCVStatus = (id) => client.get(`/cvs/${id}/status`)
export const deleteCV = (id) => client.delete(`/cvs/${id}`)
export const downloadCV = (id) => client.get(`/cvs/${id}/download`, { responseType: 'blob' })
export const previewCVUrl = (id) => `/api/v1/cvs/${id}/preview`