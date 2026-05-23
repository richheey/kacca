import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Program, Instructor, Testimonial, SiteConfig } from '../lib/supabase'
import { fallbackPrograms, fallbackInstructors, fallbackSiteConfig } from '../data/fallback'

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>(fallbackPrograms)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.from('programs').select('*').order('order').then(({ data, error }) => {
      if (!error && data && data.length > 0) setPrograms(data)
      setLoading(false)
    })
  }, [])
  return { programs, loading, setPrograms }
}

export function useInstructors() {
  const [instructors, setInstructors] = useState<Instructor[]>(fallbackInstructors)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.from('instructors').select('*').order('order').then(({ data, error }) => {
      if (!error && data && data.length > 0) setInstructors(data)
      setLoading(false)
    })
  }, [])
  return { instructors, loading, setInstructors }
}

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    supabase.from('testimonials').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!error && data) setTestimonials(data)
      setLoading(false)
    })
  }, [])
  return { testimonials, loading, setTestimonials }
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(fallbackSiteConfig)
  useEffect(() => {
    supabase.from('site_config').select('*').single().then(({ data, error }) => {
      if (!error && data) setConfig(data)
    })
  }, [])
  return { config, setConfig }
}

export function useScrolled(threshold = 60) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [threshold])
  return scrolled
}

export function useIntersection(ref: React.RefObject<Element>) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref])
  return visible
}
