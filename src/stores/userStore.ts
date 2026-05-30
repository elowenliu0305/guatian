import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { createAnonymousProfile } from '../services/api'

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

interface UserState {
  userId: string | null;
  isLoggedIn: boolean;
  nickname: string;
  avatar: string;
  level: number;
  title: string;
  guaziBalance: number;
  loading: boolean;
  loginAnonymous: () => Promise<void>;
  loginEmail: (email: string, password: string) => Promise<string | null>;
  signUpEmail: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  initFromStorage: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  isLoggedIn: false,
  nickname: '',
  avatar: '',
  level: 1,
  title: '新猹上路',
  guaziBalance: 100,
  loading: false,

  initFromStorage: () => {
    const stored = localStorage.getItem('guatian_user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        set({
          userId: user.id,
          isLoggedIn: true,
          nickname: user.nickname,
          avatar: user.avatar,
          level: user.level || 1,
          title: user.title || '新猹上路',
          guaziBalance: user.guazi_balance || 100,
        })
      } catch {
        localStorage.removeItem('guatian_user')
      }
    }
  },

  loginAnonymous: async () => {
    set({ loading: true })
    try {
      const names = ['momo', '猹猹', '吃瓜群众', '理性猹友', '瓜田守望者', '吃瓜猹', '瓜田李下']
      const randomName = names[Math.floor(Math.random() * names.length)]
      const avatar = `https://api.dicebear.com/7.x/thumbs/svg?seed=${randomName}`
      const id = generateId()

      try { await createAnonymousProfile(randomName) } catch {}

      const userData = {
        id,
        nickname: randomName,
        avatar,
        level: Math.floor(Math.random() * 8) + 1,
        title: ['吃瓜达人', '理性吃瓜人', '证据大师', '上古瓜王', '热心猹友'][Math.floor(Math.random() * 5)],
        guazi_balance: 100,
      }

      localStorage.setItem('guatian_user', JSON.stringify(userData))
      set({
        userId: id, isLoggedIn: true, nickname: randomName, avatar,
        level: userData.level, title: userData.title, guaziBalance: 100, loading: false,
      })
    } catch (err) {
      console.error('Login failed:', err)
      set({ loading: false })
    }
  },

  loginEmail: async (email: string, password: string): Promise<string | null> => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        set({ loading: false })
        return error.message
      }
      if (data.user) {
        const userData = {
          id: data.user.id,
          nickname: email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${email}`,
          level: 1,
          title: '新猹上路',
          guazi_balance: 100,
        }
        localStorage.setItem('guatian_user', JSON.stringify(userData))
        set({
          userId: data.user.id, isLoggedIn: true, nickname: userData.nickname,
          avatar: userData.avatar, level: 1, title: '新猹上路',
          guaziBalance: 100, loading: false,
        })
      }
      return null
    } catch (err: any) {
      set({ loading: false })
      return err.message || '登录失败'
    }
  },

  signUpEmail: async (email: string, password: string): Promise<string | null> => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        set({ loading: false })
        return error.message
      }
      if (data.user) {
        // Create profile in database
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            nickname: email.split('@')[0],
            guazi_balance: 100,
          })
        } catch {}

        const userData = {
          id: data.user.id,
          nickname: email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${email}`,
          level: 1,
          title: '新猹上路',
          guazi_balance: 100,
        }
        localStorage.setItem('guatian_user', JSON.stringify(userData))
        set({
          userId: data.user.id, isLoggedIn: true, nickname: userData.nickname,
          avatar: userData.avatar, level: 1, title: '新猹上路',
          guaziBalance: 100, loading: false,
        })
      }
      return null
    } catch (err: any) {
      set({ loading: false })
      return err.message || '注册失败'
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('guatian_user')
    set({
      userId: null, isLoggedIn: false, nickname: '', avatar: '',
      level: 1, title: '新猹上路', guaziBalance: 100,
    })
  },
}))
