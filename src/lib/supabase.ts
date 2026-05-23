import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Program {
  id: string
  title: string
  category: string
  emoji: string
  gradient_from: string
  gradient_to: string
  instructor_name: string
  sessions: number
  hours: number
  format: string
  target: string
  fee: string
  status: '모집중' | '마감임박' | '마감' | '준비중'
  detail_url: string
  recommendations: string[]
  goals: string[]
  curriculum: { week: number; title: string; content: string }[]
  is_featured: boolean
  order: number
  created_at: string
}

export interface Instructor {
  id: string
  name: string
  title: string
  initial: string
  gradient_from: string
  gradient_to: string
  tags: string[]
  intro: string
  bio: string
  career: string[]
  certifications: string[]
  course_ids: string[]
  order: number
  created_at: string
}

export interface Testimonial {
  id: string
  name: string
  affiliation: string
  rating: number
  content: string
  course_title: string
  created_at: string
}

export interface Contact {
  id: string
  type: 'course' | 'email'
  name: string
  phone: string
  email: string
  affiliation: string
  interested_course: string
  inquiry_type: string
  message: string
  status: '미확인' | '확인' | '답변완료'
  created_at: string
}

export interface SiteConfig {
  id: string
  naver_cafe_url: string
  kakao_channel_url: string
  phone: string
  email: string
  address: string
  business_number: string
  ceo_name: string
  operating_hours: string
}
