import { useState, useEffect } from 'react'
import { usePrograms, useInstructors, useTestimonials, useSiteConfig } from '../hooks/useData'
import type { Program, Instructor } from '../lib/supabase'

// ── 유틸 ──
const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

const formatFee = (fee: string) => {
  const num = parseInt(fee.replace(/[^0-9]/g, ''))
  if (isNaN(num)) return fee
  return num.toLocaleString('ko-KR') + '원'
}

const formatDuration = (p: Program) => {
  const sessions = p.sessions || 0
  const hours = p.hours || 0
  const weeksPerSession = sessions >= 8 ? 2 : 1
  const weeks = weeksPerSession === 2 ? Math.ceil(sessions / 2) : sessions
  if (sessions && hours) return `${weeks}주 · 주${weeksPerSession}회 · 총 ${hours}시간`
  if (sessions) return `총 ${sessions}회`
  if (hours) return `총 ${hours}시간`
  return ''
}

// ── 현재 섹션 감지 ──
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('')
  useEffect(() => {
    const handler = () => {
      const scrollY = window.scrollY + 120
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i])
        if (el && el.offsetTop <= scrollY) { setActive(ids[i]); return }
      }
      setActive(ids[0])
    }
    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])
  return active
}

// ── 공통 스타일 상수 ──
const F = {
  // 폰트 크기
  xs: 12, sm: 13, base: 15, md: 17, lg: 20, xl: 24, xl2: 28, xl3: 32, xl4: 40,
  // 패딩
  p4: 4, p6: 6, p8: 8, p12: 12, p16: 16, p20: 20, p24: 24, p28: 28, p32: 32,
}

// ── 헤더 ──
function Header({ naverUrl, onContact, scrolled }: { naverUrl: string; onContact: () => void; scrolled: boolean }) {
  const activeSection = useActiveSection(['hero', 'programs', 'instructors', 'contact'])
  const navItems = [
    { label: '강의소개', id: 'programs' },
    { label: '강사진', id: 'instructors' },
    { label: '문의하기', id: 'contact' },
    { label: '협회소개', id: 'hero' },
  ]
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50, width: '100%',
      background: scrolled ? '#FAF7F2' : 'transparent',
      boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)' : 'none',
      transition: 'background .3s, box-shadow .3s',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 32px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <button onClick={() => scrollTo('hero')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
          <span style={{ fontSize: 26 }}>🤖</span>
          <span style={{ fontWeight: 800, fontSize: 17, whiteSpace: 'nowrap', color: scrolled ? '#1C1917' : '#FAF7F2', transition: 'color .3s', fontFamily: 'Pretendard, sans-serif' }}>한국AI창의융합협회</span>
        </button>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navItems.map(item => {
            const isActive = activeSection === item.id
            return (
              <button key={item.id} onClick={() => scrollTo(item.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'Pretendard, sans-serif', fontSize: 15, fontWeight: isActive ? 700 : 600,
                padding: '8px 14px', borderRadius: 8,
                color: isActive ? '#C84B0F' : scrolled ? '#78716C' : 'rgba(250,247,242,.85)',
                transition: 'color .2s', position: 'relative',
              }}>
                {item.label}
                {isActive && <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 2, background: '#C84B0F', borderRadius: 2, display: 'block' }} />}
              </button>
            )
          })}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <a href={naverUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#03C75A', color: '#fff', padding: '9px 18px', borderRadius: 999, fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 900, fontSize: 15 }}>N</span> 네이버 카페
          </a>
          <button onClick={onContact} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: '9px 18px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
            강의 문의하기 →
          </button>
        </div>
      </div>
    </header>
  )
}

// ── 강의 모달 ──
function ProgramModal({ program, onClose, onContact }: { program: Program; onClose: () => void; onContact: (title?: string) => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FAF7F2', borderRadius: 24, maxWidth: 660, width: '100%', maxHeight: '90vh', overflowY: 'auto', animation: 'modalSlide .3s ease' }}>

        {/* 모달 헤더 */}
        <div style={{ background: `linear-gradient(135deg,${program.gradient_from},${program.gradient_to})`, padding: '32px 32px 28px', borderRadius: '24px 24px 0 0', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,.25)', border: 'none', color: '#fff', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <span style={{ background: 'rgba(0,0,0,.22)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>{program.category}</span>
            <span style={{ background: program.status === '모집중' ? '#16a34a' : '#78716C', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>{program.status}</span>
          </div>
          <div style={{ fontSize: 52, marginBottom: 14 }}>{program.emoji}</div>
          <h2 style={{ fontSize: 30, fontWeight: 900, color: '#FAF7F2', marginBottom: 14, fontFamily: 'Pretendard, sans-serif', lineHeight: 1.2 }}>{program.title}</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: 'rgba(250,247,242,.85)', fontSize: 14, fontWeight: 500 }}>
            <span>📅 {formatDuration(program)}</span>
            <span>🖥 {program.format}</span>
            <span>👤 {program.target}</span>
            <span style={{ color: '#FAF7F2', fontWeight: 800 }}>💰 {formatFee(program.fee)}</span>
          </div>
        </div>

        {/* 모달 본문 */}
        <div style={{ padding: '28px 32px' }}>

          {/* 추천 대상 */}
          {program.recommendations?.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h4 style={{ fontWeight: 900, fontSize: 18, color: '#1C1917', marginBottom: 14, fontFamily: 'Pretendard, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#16a34a' }}>✅</span> 이런 분께 추천드려요
              </h4>
              {program.recommendations.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0, fontSize: 16 }}>✓</span>
                  <span style={{ fontSize: 15, color: '#1C1917', lineHeight: 1.6 }}>{r}</span>
                </div>
              ))}
            </div>
          )}

          {/* 강의 목표 */}
          {program.goals?.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h4 style={{ fontWeight: 900, fontSize: 18, color: '#1C1917', marginBottom: 14, fontFamily: 'Pretendard, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🎯</span> 강의 목표
              </h4>
              {program.goals.map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#FAF7F2', border: '1px solid #EDE8DF', borderRadius: 12, padding: '14px 16px', marginBottom: 10, boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
                  <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(200,75,15,.12)', color: '#C84B0F', fontWeight: 900, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{i + 1}</span>
                  <span style={{ fontSize: 15, color: '#1C1917', fontWeight: 600 }}>{g}</span>
                </div>
              ))}
            </div>
          )}

          {/* 커리큘럼 */}
          {program.curriculum?.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h4 style={{ fontWeight: 900, fontSize: 18, color: '#1C1917', marginBottom: 14, fontFamily: 'Pretendard, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>📚</span> 커리큘럼
              </h4>
              {program.curriculum.map((c, i) => (
                <div key={i} style={{ background: '#EDE8DF', borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#C84B0F', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#1C1917', marginBottom: 4 }}>{c.title}</p>
                    {c.content && <p style={{ fontSize: 13, color: '#78716C', lineHeight: 1.6 }}>{c.content}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {program.curriculum?.length === 0 && (
            <div style={{ background: 'rgba(245,183,48,.15)', border: '1px solid #F5B730', borderRadius: 12, padding: '16px 18px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <p style={{ fontSize: 15, color: '#1C1917', lineHeight: 1.6 }}>현재 커리큘럼 준비 중입니다. 문의하시면 오픈 시 우선 안내해드립니다.</p>
            </div>
          )}

          {/* 담당 강사 */}
          <div style={{ background: '#EDE8DF', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,${program.gradient_from},${program.gradient_to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>강</div>
            <div>
              <p style={{ fontSize: 12, color: '#78716C', marginBottom: 3 }}>담당 강사</p>
              <p style={{ fontWeight: 700, fontSize: 16, color: '#1C1917' }}>{program.instructor_name}</p>
            </div>
          </div>
        </div>

        {/* 모달 하단 버튼 */}
        <div style={{ position: 'sticky', bottom: 0, background: '#FAF7F2', borderTop: '1px solid #EDE8DF', padding: '16px 24px', borderRadius: '0 0 24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => { onClose(); onContact(program.title) }}
            style={{ width: '100%', background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: 14, borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 15 }}>
            수강 문의하기
          </button>
          {program.detail_url ? (
            <a href={program.detail_url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#1C1917', color: '#FAF7F2', textDecoration: 'none', padding: 14, borderRadius: 999, fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 15 }}>
              전체 상세 보기 ↗
            </a>
          ) : (
            <button disabled style={{ width: '100%', background: '#EDE8DF', color: '#A8A29E', border: 'none', padding: 14, borderRadius: 999, fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'default' }}>
              전체 상세 보기 (준비 중)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 강사 모달 ──
function InstructorModal({ instructor, programs, onClose, onContact }: { instructor: Instructor; programs: Program[]; onClose: () => void; onContact: () => void }) {
  const myPrograms = programs.filter(p => instructor.course_ids?.includes(p.id))
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FAF7F2', borderRadius: 24, maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto', animation: 'modalSlide .3s ease' }}>

        {/* 강사 모달 헤더 */}
        <div style={{ background: '#0B0A09', padding: '36px 32px', borderRadius: '24px 24px 0 0', textAlign: 'center', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.12)', border: 'none', color: '#FAF7F2', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          <div style={{ width: 110, height: 110, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 36, fontWeight: 900, background: `linear-gradient(135deg,${instructor.gradient_from},${instructor.gradient_to})`, boxShadow: '0 8px 24px rgba(0,0,0,.3)' }}>
            {instructor.initial}
          </div>
          <h2 style={{ color: '#FAF7F2', fontSize: 26, fontWeight: 900, marginBottom: 6, fontFamily: 'Pretendard, sans-serif' }}>{instructor.name}</h2>
          <p style={{ color: 'rgba(250,247,242,.6)', fontSize: 16, marginBottom: 16 }}>{instructor.title}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {instructor.tags.map(t => (
              <span key={t} style={{ background: '#F5B730', color: '#1C1917', fontSize: 13, fontWeight: 700, padding: '5px 12px', borderRadius: 999 }}>{t}</span>
            ))}
          </div>
        </div>

        {/* 강사 모달 본문 */}
        <div style={{ padding: '28px 32px' }}>
          <h4 style={{ fontWeight: 900, fontSize: 18, color: '#1C1917', marginBottom: 12, fontFamily: 'Pretendard, sans-serif' }}>📝 강사 소개</h4>
          <p style={{ color: '#1C1917', fontSize: 15, lineHeight: 1.85, marginBottom: 28 }}>{instructor.bio}</p>

          <h4 style={{ fontWeight: 900, fontSize: 18, color: '#1C1917', marginBottom: 12, fontFamily: 'Pretendard, sans-serif' }}>📌 주요 경력</h4>
          <div style={{ borderLeft: '3px solid #C84B0F', paddingLeft: 16, marginBottom: 28 }}>
            {instructor.career.map((c, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 15, color: '#1C1917', lineHeight: 1.6 }}>{c}</p>
              </div>
            ))}
          </div>

          <h4 style={{ fontWeight: 900, fontSize: 18, color: '#1C1917', marginBottom: 12, fontFamily: 'Pretendard, sans-serif' }}>🏆 자격 & 수상</h4>
          <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {instructor.certifications.map((c, i) => (
              <span key={i} style={{ background: '#EDE8DF', color: '#1C1917', fontSize: 13, padding: '7px 14px', borderRadius: 999, fontWeight: 600 }}>{c}</span>
            ))}
          </div>

          {myPrograms.length > 0 && (
            <>
              <h4 style={{ fontWeight: 900, fontSize: 18, color: '#1C1917', marginBottom: 12, fontFamily: 'Pretendard, sans-serif' }}>📚 담당 강의</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {myPrograms.map(p => (
                  <div key={p.id} style={{ background: '#EDE8DF', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{p.emoji}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#1C1917' }}>{p.title}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ position: 'sticky', bottom: 0, background: '#FAF7F2', borderTop: '1px solid #EDE8DF', padding: '16px 24px', borderRadius: '0 0 24px 24px' }}>
          <button onClick={() => { onClose(); onContact() }}
            style={{ width: '100%', background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: 14, borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 15 }}>
            이 강사 강의 문의하기
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 수강 문의 모달 ──
function ContactModal({ programs, defaultCourse, onClose, adminEmail }: { programs: Program[]; defaultCourse?: string; onClose: () => void; adminEmail?: string }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', affiliation: '', course: defaultCourse || '', message: '' })
  const [agreed, setAgreed] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.email || !form.message) { alert('필수 항목을 모두 입력해주세요'); return }
    if (!agreed) { alert('개인정보 수집에 동의해주세요'); return }
    setSubmitting(true)
    const { supabase } = await import('../lib/supabase')
    await supabase.from('contacts').insert({
      type: 'course', name: form.name, phone: form.phone, email: form.email,
      affiliation: form.affiliation, interested_course: form.course,
      inquiry_type: '강의 수강 문의', message: form.message, status: '미확인',
    })
    setSubmitting(false)
    setSuccess(true)
    // 관리자에게 알림용 이메일 (새창 없이 mailto 구성만)
    if (adminEmail) {
      const subject = encodeURIComponent(`[KACCA 문의] ${form.name}님의 강의 수강 문의`)
      const body = encodeURIComponent(`이름: ${form.name}\n연락처: ${form.phone}\n이메일: ${form.email}\n소속: ${form.affiliation}\n관심 강의: ${form.course}\n\n문의 내용:\n${form.message}`)
      const a = document.createElement('a')
      a.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`
      a.click()
    }
  }

  const iStyle = { width: '100%', background: '#EDE8DF', border: '1.5px solid transparent', borderRadius: 12, padding: '12px 16px', fontFamily: 'Pretendard, sans-serif', fontSize: 15, color: '#1C1917', outline: 'none' }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FAF7F2', borderRadius: 24, maxWidth: 500, width: '100%', animation: 'modalSlide .3s ease', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ background: 'linear-gradient(135deg,#C84B0F,#F5B730)', padding: '26px 28px', borderRadius: '24px 24px 0 0', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,.2)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          <h3 style={{ color: '#FAF7F2', fontSize: 22, fontWeight: 900, fontFamily: 'Pretendard, sans-serif' }}>📝 강의 수강 문의</h3>
        </div>
        <div style={{ padding: '24px 28px' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#1C1917', marginBottom: 10, fontFamily: 'Pretendard, sans-serif' }}>문의가 접수되었습니다!</h3>
              <p style={{ color: '#78716C', marginBottom: 28, fontSize: 15, lineHeight: 1.7 }}>담당자가 1~2 영업일 내에 연락드리겠습니다.</p>
              <button onClick={onClose} style={{ background: '#EDE8DF', color: '#1C1917', border: 'none', padding: '13px 32px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 15 }}>닫기</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input type="text" placeholder="이름 *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={iStyle} />
              <input type="tel" placeholder="연락처 * (010-0000-0000)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={iStyle} />
              <input type="email" placeholder="이메일 *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={iStyle} />
              <input type="text" placeholder="소속·직책 (선택)" value={form.affiliation} onChange={e => setForm(f => ({ ...f, affiliation: e.target.value }))} style={iStyle} />
              <select value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} style={{ ...iStyle, cursor: 'pointer' }}>
                <option value="">관심 강의 선택 (선택)</option>
                {programs.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
                <option value="기타">기타</option>
              </select>
              <textarea placeholder="문의 내용 *" rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ ...iStyle, resize: 'none' }} />
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 3, accentColor: '#C84B0F', width: 16, height: 16 }} />
                <span style={{ fontSize: 13, color: '#78716C', lineHeight: 1.6 }}>개인정보 수집·이용에 동의합니다<br /><span style={{ fontSize: 12, color: '#A8A29E' }}>(수집 항목: 이름·연락처·이메일 / 목적: 문의 답변 / 보유기간: 1년)</span></span>
              </label>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ width: '100%', background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: 14, borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 15, opacity: submitting ? 0.6 : 1, marginTop: 4 }}>
                {submitting ? '접수 중...' : '문의 접수하기'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 이메일 폼 ──
function EmailForm({ programs, adminEmail }: { programs: Program[]; adminEmail?: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: '', message: '' })
  const [count, setCount] = useState(0)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!form.name || !form.email || !form.type || !form.message) { alert('필수 항목을 모두 입력해주세요'); return }
    setSubmitting(true)
    const { supabase } = await import('../lib/supabase')
    await supabase.from('contacts').insert({
      type: 'email', name: form.name, email: form.email, phone: form.phone,
      inquiry_type: form.type, message: form.message,
      affiliation: '', interested_course: '', status: '미확인',
    })
    // 관리자 이메일 알림 (새창 없이)
    if (adminEmail) {
      const subject = encodeURIComponent(`[KACCA 문의] ${form.name}님의 ${form.type}`)
      const body = encodeURIComponent(`이름: ${form.name}\n이메일: ${form.email}\n연락처: ${form.phone}\n유형: ${form.type}\n\n문의 내용:\n${form.message}`)
      const a = document.createElement('a')
      a.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`
      a.click()
    }
    setSubmitting(false)
    setSuccess(true)
  }

  const iStyle = { background: '#fff', border: '1.5px solid #D4CFC8', borderRadius: 12, padding: '12px 16px', fontFamily: 'Pretendard, sans-serif', fontSize: 15, color: '#1C1917', outline: 'none', width: '100%', transition: 'border-color .2s' }

  if (success) return (
    <div style={{ background: '#FAF7F2', borderRadius: 20, padding: '48px 32px', boxShadow: '0 4px 20px rgba(0,0,0,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
        <h3 style={{ fontSize: 22, fontWeight: 900, color: '#1C1917', marginBottom: 8, fontFamily: 'Pretendard, sans-serif' }}>문의가 접수되었습니다!</h3>
        <p style={{ color: '#78716C', fontSize: 15 }}>1~2 영업일 내에 답변드리겠습니다.</p>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#FAF7F2', borderRadius: 20, padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}>
      <h3 style={{ fontWeight: 700, color: '#1C1917', marginBottom: 24, fontSize: 20, fontFamily: 'Pretendard, sans-serif' }}>📧 이메일 문의하기</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>이름 <span style={{ color: '#C84B0F' }}>*</span></label>
          <input placeholder="이름" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={iStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>이메일 <span style={{ color: '#C84B0F' }}>*</span></label>
          <input type="email" placeholder="이메일" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={iStyle} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>연락처</label>
          <input type="tel" placeholder="010-0000-0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={iStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>문의 유형 <span style={{ color: '#C84B0F' }}>*</span></label>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...iStyle, cursor: 'pointer' }}>
            <option value="">선택해주세요</option>
            <option>강의 수강 문의</option><option>기업 교육 문의</option><option>강사 섭외</option><option>협업 제안</option><option>기타</option>
          </select>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1C1917', marginBottom: 6 }}>문의 내용 <span style={{ color: '#C84B0F' }}>*</span></label>
        <div style={{ position: 'relative' }}>
          <textarea placeholder="문의 내용을 자유롭게 작성해 주세요" rows={5} maxLength={500} value={form.message}
            onChange={e => { setForm(f => ({ ...f, message: e.target.value })); setCount(e.target.value.length) }}
            style={{ ...iStyle, resize: 'none' }} />
          <span style={{ position: 'absolute', bottom: 10, right: 14, fontSize: 12, color: '#A8A29E' }}>{count}/500</span>
        </div>
      </div>
      <button onClick={submit} disabled={submitting}
        style={{ width: '100%', background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: 15, borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 16, opacity: submitting ? 0.6 : 1 }}>
        {submitting ? '전송 중...' : '✈ 문의 보내기'}
      </button>
    </div>
  )
}

// ── 메인 홈페이지 ──
export default function HomePage() {
  const { programs } = usePrograms()
  const { instructors } = useInstructors()
  const { testimonials } = useTestimonials()
  const { config } = useSiteConfig()
  const [scrolled, setScrolled] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
  const [contactOpen, setContactOpen] = useState(false)
  const [contactCourse, setContactCourse] = useState<string | undefined>()

  const openContact = (course?: string) => { setContactCourse(course); setContactOpen(true) }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const statusStyle = (status: string) =>
    status === '모집중' ? { background: '#16a34a', color: '#fff' }
    : status === '마감임박' ? { background: '#dc2626', color: '#fff' }
    : { background: '#78716C', color: '#fff' }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header naverUrl={config.naver_cafe_url} onContact={() => openContact()} scrolled={scrolled} />

      {/* ── HERO ── */}
      <section id="hero" style={{ background: '#0B0A09', padding: '80px 32px', marginTop: -68, paddingTop: 130, position: 'relative', overflow: 'hidden', backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)', backgroundSize: '32px 32px' }}>
        <div style={{ position: 'absolute', top: 24, right: 36, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, opacity: .12 }}>
          {Array(9).fill('✕').map((x, i) => <span key={i} style={{ color: '#fff', fontSize: 22 }}>{x}</span>)}
        </div>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 48, alignItems: 'center' }}>
          <div>
            <span style={{ border: '1.5px solid #C84B0F', color: '#C84B0F', fontSize: 12, fontWeight: 700, letterSpacing: '.18em', padding: '7px 16px', borderRadius: 999, display: 'inline-block', marginBottom: 26, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>ABOUT KACCA</span>
            <h1 style={{ fontSize: 52, fontWeight: 900, color: '#FAF7F2', lineHeight: 1.1, marginBottom: 22, fontFamily: 'Pretendard, sans-serif' }}>AI 시대를 이끄는<br />창의적 융합의 힘</h1>
            <div style={{ background: '#F5B730', color: '#1C1917', borderRadius: 14, padding: '14px 20px', display: 'inline-block', marginBottom: 20 }}>
              <p style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.6, fontFamily: 'Pretendard, sans-serif' }}>한국AI창의융합협회(KACCA)는<br />AI 교육의 새로운 기준을 만듭니다.</p>
            </div>
            <p style={{ color: 'rgba(250,247,242,.65)', lineHeight: 1.85, marginBottom: 30, fontSize: 16, fontFamily: 'Pretendard, sans-serif' }}>
              기초부터 실무 중심 커리큘럼으로 개인과 조직의 AI 역량을 높여드립니다.<br />
              AI 교육 전문 협회로, 검증된 프로그램과 커뮤니티를 제공합니다.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => scrollTo('programs')} style={{ background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: '12px 26px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 15 }}>강의 살펴보기 →</button>
              <a href={config.naver_cafe_url || '#'} target="_blank" rel="noopener noreferrer" style={{ background: '#03C75A', color: '#fff', padding: '12px 24px', borderRadius: 999, fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 900 }}>N</span> 네이버 카페
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-end' }}>
            <div style={{ background: '#FAF7F2', borderRadius: 20, padding: 24, width: 190, boxShadow: '0 8px 32px rgba(0,0,0,.3)', animation: 'float 4s ease-in-out infinite' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🎓</div>
              <div style={{ fontWeight: 700, color: '#1C1917', fontSize: 16, fontFamily: 'Pretendard, sans-serif' }}>AI 교육 전문</div>
              <div style={{ color: '#78716C', fontSize: 14, marginTop: 4 }}> </div>
            </div>
            <div style={{ background: '#FAF7F2', borderRadius: 20, padding: 24, width: 190, boxShadow: '0 8px 32px rgba(0,0,0,.3)', marginLeft: 20, animation: 'float 4s ease-in-out 1.5s infinite' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📚</div>
              <div style={{ fontWeight: 700, color: '#1C1917', fontSize: 16, fontFamily: 'Pretendard, sans-serif' }}>검증된 커리큘럼</div>
              <div style={{ color: '#78716C', fontSize: 14, marginTop: 4 }}> </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section id="programs" style={{ background: '#EDE8DF', padding: '80px 32px', backgroundImage: 'linear-gradient(rgba(28,25,23,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(28,25,23,.05) 1px,transparent 1px)', backgroundSize: '32px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ color: '#C84B0F', fontSize: 12, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'block', marginBottom: 12 }}>PROGRAMS</span>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: '#1C1917', marginBottom: 10, fontFamily: 'Pretendard, sans-serif' }}>강의 프로그램</h2>
            <p style={{ color: '#78716C', fontSize: 17, fontFamily: 'Pretendard, sans-serif' }}>AI 교육의 첫 걸음, 지금 시작하세요</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
            {programs.map(p => (
              <div key={p.id} onClick={() => setSelectedProgram(p)}
                style={{ background: '#FAF7F2', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.07)', cursor: 'pointer', transition: 'transform .25s, box-shadow .25s', display: 'flex', flexDirection: 'column' }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 40px rgba(0,0,0,.13)' }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,.07)' }}>

                {/* 카드 상단 */}
                <div style={{ height: 160, background: `linear-gradient(135deg,${p.gradient_from},${p.gradient_to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, position: 'relative' }}>
                  {p.emoji}
                  <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: 'rgba(0,0,0,.22)', color: '#fff' }}>{p.category}</span>
                  <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, ...statusStyle(p.status) }}>{p.status}</span>
                </div>

                {/* 카드 본문 */}
                <div style={{ padding: '22px 22px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1C1917', marginBottom: 4, fontFamily: 'Pretendard, sans-serif' }}>{p.title}</h3>
                  <p style={{ color: '#78716C', fontSize: 14, marginBottom: 16, fontFamily: 'Pretendard, sans-serif' }}>{p.instructor_name}</p>

                  {/* 기간 정보 */}
                  <div style={{ borderTop: '1px solid #EDE8DF', paddingTop: 14, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 15 }}>📅</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1C1917', fontFamily: 'Pretendard, sans-serif' }}>{formatDuration(p)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ background: '#EDE8DF', color: '#78716C', fontSize: 13, padding: '4px 10px', borderRadius: 8 }}>🖥 {p.format}</span>
                      <span style={{ background: '#EDE8DF', color: '#78716C', fontSize: 13, padding: '4px 10px', borderRadius: 8 }}>👤 {p.target}</span>
                    </div>
                  </div>

                  {/* 금액 + 버튼 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div>
                      <span style={{ fontSize: 12, color: '#78716C', display: 'block', marginBottom: 3, fontFamily: 'Pretendard, sans-serif' }}>수강료</span>
                      <span style={{ color: '#C84B0F', fontWeight: 900, fontSize: 24, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-.5px' }}>
                        {formatFee(p.fee)}
                      </span>
                    </div>
                    <button style={{ background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: '11px 20px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 14 }}>
                      자세히 보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 CTA 배너 */}
          <div style={{ background: '#C84B0F', borderRadius: 20, padding: '26px 32px', marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 17, fontFamily: 'Pretendard, sans-serif' }}>원하는 강의가 없으신가요? 맞춤 강의를 제안해드립니다.</p>
            <button onClick={() => openContact()} style={{ background: '#fff', color: '#C84B0F', border: 'none', padding: '12px 24px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' }}>📝 강의 수강 문의하기 →</button>
          </div>
        </div>
      </section>

      {/* ── INSTRUCTORS ── */}
      <section id="instructors" style={{ background: '#FAF7F2', padding: '80px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ color: '#C84B0F', fontSize: 12, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'block', marginBottom: 12 }}>INSTRUCTORS</span>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: '#1C1917', marginBottom: 10, fontFamily: 'Pretendard, sans-serif' }}>강사진 소개</h2>
            <p style={{ color: '#78716C', fontSize: 17 }}>현장 경험과 전문성을 갖춘 강사진이 함께합니다</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
            {instructors.map(inst => (
              <div key={inst.id} onClick={() => setSelectedInstructor(inst)}
                style={{ background: '#EDE8DF', borderRadius: 20, padding: '24px 20px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,.05)', transition: 'transform .25s' }}
                onMouseOver={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'}
                onMouseOut={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'}>
                {/* 아바타 */}
                <div style={{ width: 88, height: 88, borderRadius: '50%', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 900, background: `linear-gradient(135deg,${inst.gradient_from},${inst.gradient_to})`, boxShadow: '0 4px 14px rgba(0,0,0,.15)' }}>{inst.initial}</div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#1C1917', marginBottom: 4, fontFamily: 'Pretendard, sans-serif' }}>{inst.name}</h3>
                <p style={{ color: '#78716C', fontSize: 13, marginBottom: 12 }}>{inst.title}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
                  {inst.tags.map(t => <span key={t} style={{ background: '#FAF7F2', color: '#1C1917', fontSize: 11, padding: '4px 10px', borderRadius: 999, fontWeight: 600 }}>{t}</span>)}
                </div>
                <p style={{ color: '#78716C', fontSize: 13, lineHeight: 1.6, marginBottom: 16, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{inst.intro}</p>
                <button style={{ width: '100%', border: '2px solid #C84B0F', color: '#C84B0F', background: 'transparent', padding: '9px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 13 }}>프로필 보기</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" style={{ background: '#EDE8DF', padding: '80px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: '#C84B0F', fontSize: 12, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'block', marginBottom: 12 }}>REVIEWS</span>
          <h2 style={{ fontSize: 38, fontWeight: 900, color: '#1C1917', marginBottom: 48, fontFamily: 'Pretendard, sans-serif' }}>수강생 후기</h2>
          {testimonials.length === 0 ? (
            <div style={{ background: '#FAF7F2', borderRadius: 24, padding: '60px 40px' }}>
              <div style={{ fontSize: 56, marginBottom: 18 }}>⭐</div>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#1C1917', marginBottom: 10, fontFamily: 'Pretendard, sans-serif' }}>첫 번째 수강생의 후기를 기다리고 있습니다</h3>
              <p style={{ color: '#78716C', marginBottom: 28, fontSize: 16 }}>강의 수강 후 후기를 남겨주시면 소정의 혜택을 드립니다 😊</p>
              <button onClick={() => openContact()} style={{ background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: '12px 28px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 15 }}>강의 문의하기</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {testimonials.map(t => (
                <div key={t.id} style={{ background: '#FAF7F2', borderRadius: 20, padding: '28px 24px', textAlign: 'left', boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}>
                  <div style={{ fontSize: 38, color: '#C84B0F', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 12, opacity: .25 }}>"</div>
                  <div style={{ marginBottom: 10, fontSize: 16 }}>{'⭐'.repeat(t.rating)}</div>
                  <p style={{ color: '#1C1917', fontSize: 15, lineHeight: 1.75, marginBottom: 16 }}>{t.content}</p>
                  <div style={{ borderTop: '1px solid #EDE8DF', paddingTop: 14 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#1C1917' }}>{t.name}</span>
                    <span style={{ color: '#78716C', fontSize: 13, marginLeft: 10 }}>{t.affiliation}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ background: '#EDE8DF', padding: '80px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ color: '#C84B0F', fontSize: 12, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'block', marginBottom: 12 }}>CONTACT US</span>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: '#1C1917', marginBottom: 10, fontFamily: 'Pretendard, sans-serif' }}>언제든지 문의하세요</h2>
            <p style={{ color: '#78716C', fontSize: 17 }}>강의 수강, 기업 교육, 강사 섭외 등 어떤 문의도 친절하게 답변드립니다</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: 'N', bg: '#03C75A', title: '네이버 카페', desc: '회원 커뮤니티에 참여하고 최신 소식을 받아보세요', btnText: '카페 바로가기 ↗', btnBg: '#03C75A', btnColor: '#fff', href: config.naver_cafe_url || '#' },
                { icon: '💬', bg: '#FEE500', title: '카카오톡 문의', desc: '빠른 답변이 필요하신 분! 오픈채팅으로 실시간 상담', btnText: '카카오톡 문의 ↗', btnBg: '#FEE500', btnColor: '#1C1917', href: config.kakao_channel_url || '#' },
              ].map(c => (
                <div key={c.title} style={{ background: '#FAF7F2', borderRadius: 18, padding: '22px', boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16, flexShrink: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{c.icon}</div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#1C1917', marginBottom: 4, fontSize: 16 }}>{c.title}</p>
                      <p style={{ color: '#78716C', fontSize: 14, lineHeight: 1.6 }}>{c.desc}</p>
                    </div>
                  </div>
                  <a href={c.href} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', background: c.btnBg, color: c.btnColor, padding: '11px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 14, textAlign: 'center', textDecoration: 'none' }}>{c.btnText}</a>
                </div>
              ))}
              <div style={{ background: '#0B0A09', borderRadius: 18, padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FAF7F2', fontSize: 18, flexShrink: 0 }}>✉</div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#FAF7F2', marginBottom: 4, fontSize: 16 }}>이메일 문의</p>
                    <p style={{ color: 'rgba(250,247,242,.55)', fontSize: 14, lineHeight: 1.6 }}>우측 폼을 통해 문의하시면 영업일 기준 1-2일 내 답변드립니다</p>
                    <p style={{ color: 'rgba(250,247,242,.35)', fontSize: 13, marginTop: 10 }}>⏰ {config.operating_hours} 운영</p>
                  </div>
                </div>
              </div>
            </div>
            <EmailForm programs={programs} adminEmail={config.email} />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#292524', padding: '44px 32px 0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 36 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ color: '#C84B0F', fontSize: 22 }}>🤖</span>
                <span style={{ color: '#FAF7F2', fontWeight: 700, fontSize: 18, fontFamily: 'Pretendard, sans-serif' }}>한국AI창의융합협회</span>
              </div>
              <p style={{ color: 'rgba(250,247,242,.4)', fontSize: 14, marginBottom: 18, fontFamily: 'Pretendard, sans-serif' }}>AI 교육의 새로운 기준, KACCA</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {['▶', '◉', '💬'].map((icon, i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FAF7F2', fontSize: 13, cursor: 'pointer' }}>{icon}</div>
                ))}
                <a href={config.naver_cafe_url || '#'} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FAF7F2', fontSize: 12, fontWeight: 900, cursor: 'pointer', textDecoration: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>N</a>
              </div>
            </div>
            <div>
              <p style={{ color: 'rgba(250,247,242,.35)', fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'Pretendard, sans-serif' }}>바로가기</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['강의소개|programs', '강사진|instructors', '문의하기|contact', '협회소개|hero'].map(item => {
                  const [label, id] = item.split('|')
                  return <button key={id} onClick={() => scrollTo(id)} style={{ textAlign: 'left', background: 'none', border: 'none', color: 'rgba(250,247,242,.55)', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: 15, padding: 0 }}>{label}</button>
                })}
              </div>
            </div>
          </div>
        </div>
        <div style={{ background: '#1C1917', padding: '14px 32px', margin: '0 -32px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[`사업자등록번호: ${config.business_number}`, `대표자: ${config.ceo_name}`, '개인정보처리방침', '이용약관'].map(t => (
                <span key={t} style={{ color: 'rgba(250,247,242,.25)', fontSize: 12, fontFamily: 'Pretendard, sans-serif', cursor: 'pointer' }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ color: 'rgba(250,247,242,.25)', fontSize: 12 }}>© 2026 한국AI창의융합협회</span>
              <button onClick={() => window.location.href = '/admin'} style={{ background: 'none', border: 'none', color: 'rgba(250,247,242,.18)', cursor: 'pointer', fontSize: 12, fontFamily: 'Pretendard, sans-serif' }}>관리자</button>
            </div>
          </div>
        </div>
      </footer>

      {/* ── 모달 ── */}
      {selectedProgram && <ProgramModal program={selectedProgram} onClose={() => setSelectedProgram(null)} onContact={openContact} />}
      {selectedInstructor && <InstructorModal instructor={selectedInstructor} programs={programs} onClose={() => setSelectedInstructor(null)} onContact={() => openContact()} />}
      {contactOpen && <ContactModal programs={programs} defaultCourse={contactCourse} onClose={() => setContactOpen(false)} adminEmail={config.email} />}
    </div>
  )
}
