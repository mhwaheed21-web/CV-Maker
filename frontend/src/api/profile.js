import client from './client'

export const getFullProfile = () => client.get('/profile/')
export const updatePersonal = (data) => client.put('/profile/personal', data)

export const getExperience = () => client.get('/profile/experience')
export const addExperience = (data) => client.post('/profile/experience', data)
export const updateExperience = (id, data) => client.put(`/profile/experience/${id}`, data)
export const deleteExperience = (id) => client.delete(`/profile/experience/${id}`)

export const getEducation = () => client.get('/profile/education')
export const addEducation = (data) => client.post('/profile/education', data)
export const updateEducation = (id, data) => client.put(`/profile/education/${id}`, data)
export const deleteEducation = (id) => client.delete(`/profile/education/${id}`)

export const getSkills = () => client.get('/profile/skills')
export const upsertSkills = (data) => client.post('/profile/skills', data)

export const getProjects = () => client.get('/profile/projects')
export const addProject = (data) => client.post('/profile/projects', data)
export const updateProject = (id, data) => client.put(`/profile/projects/${id}`, data)
export const deleteProject = (id) => client.delete(`/profile/projects/${id}`)

export const getCertifications = () => client.get('/profile/certifications')
export const addCertification = (data) => client.post('/profile/certifications', data)
export const updateCertification = (id, data) => client.put(`/profile/certifications/${id}`, data)
export const deleteCertification = (id) => client.delete(`/profile/certifications/${id}`)