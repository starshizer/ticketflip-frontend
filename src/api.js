import axios from 'axios'
import { supabase } from './supabase'
 
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  headers: { 'Content-Type': 'application/json' },
})
 
// Attach auth token to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})
 
// Opportunities
export const getOpportunities = (status) =>
  api.get('/opportunities', { params: status ? { status } : {} }).then(r => r.data)
 
export const getOpportunity = (id) =>
  api.get(`/opportunities/${id}`).then(r => r.data)
 
export const getNewCount = () =>
  api.get('/opportunities/new-count').then(r => r.data)
 
export const refreshOpportunityPrices = (id) =>
  api.post(`/opportunities/${id}/refresh-prices`).then(r => r.data)
 
// Actions
export const recordAction = (body) =>
  api.post('/actions', body).then(r => r.data)
 
export const getHistory = () =>
  api.get('/actions/history').then(r => r.data)
 
export const getPnlSummary = () =>
  api.get('/actions/pnl-summary').then(r => r.data)
 
// Artists
export const getArtists = () =>
  api.get('/artists/active').then(r => r.data)
 
export const getAllArtists = () =>
  api.get('/artists').then(r => r.data)
 
export const addArtist = (body) =>
  api.post('/artists', body).then(r => r.data)
 
export const removeArtist = (id) =>
  api.delete(`/artists/${id}`).then(r => r.data)
 
export const searchArtists = (name) =>
  api.post('/artists/search', { name }).then(r => r.data)
 
// Settings
export const getMySettings = () =>
  api.get('/settings/me').then(r => r.data)
 
export const updateMySettings = (body) =>
  api.patch('/settings/me', body).then(r => r.data)
 
export const getGmailAuthUrl = () =>
  api.get('/settings/gmail/auth-url').then(r => r.data)
 
export const getGmailAccounts = () =>
  api.get('/settings/gmail/accounts').then(r => r.data)
 
export const disconnectGmail = (id) =>
  api.delete(`/settings/gmail/${id}`).then(r => r.data)
 
export const getSpotifyAuthUrl = () =>
  api.get('/settings/spotify/auth-url').then(r => r.data)
 
export const syncSpotify = () =>
  api.post('/settings/spotify/sync').then(r => r.data)
 
export const triggerEmailPoll = () =>
  api.post('/admin/trigger-email-poll').then(r => r.data)
