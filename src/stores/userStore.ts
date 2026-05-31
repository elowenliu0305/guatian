import { create } from 'zustand'
import { supabase } from '../lib/supabase'

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
  loading: false,

  initFromStorage: () => {
    const stored = localStorage.getItem('luanbb_user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        set({
          userId: user.id,
          isLoggedIn: true,
          nickname: user.nickname,
          avatar: user.avatar,
        })
      } catch {
        localStorage.removeItem('luanbb_user')
      }
    }
  },

  loginAnonymous: async () => {
    set({ loading: true })
    try {
      const names = ['momo', '小透明', '吃瓜群众', '路过一下', '深夜bb机', '沉默是金', '你说得对']
      const randomName = names[Math.floor(Math.random() * names.length)]
      const avatar = `https://api.dicebear.com/7.x/thumbs/svg?seed=${randomName}`
      const id = generateId()

      const userData = {
        id,
        nickname: randomName,
        avatar,
      }

      localStorage.setItem('luanbb_user', JSON.stringify(userData))
      set({
        userId: id, isLoggedIn: true, nickname: randomName, avatar,
        loading: false,
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
        }
        localStorage.setItem('luanbb_user', JSON.stringify(userData))
        set({
          userId: data.user.id, isLoggedIn: true, nickname: userData.nickname,
          avatar: userData.avatar, loading: false,
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
        const userData = {
          id: data.user.id,
          nickname: email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${email}`,
        }
        localStorage.setItem('luanbb_user', JSON.stringify(userData))
        set({
          userId: data.user.id, isLoggedIn: true, nickname: userData.nickname,
          avatar: userData.avatar, loading: false,
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
    localStorage.removeItem('luanbb_user')
    set({
      userId: null, isLoggedIn: false, nickname: '', avatar: '',
    })
  },
}))
