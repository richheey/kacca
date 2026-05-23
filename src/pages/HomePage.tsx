import { useState } from 'react'
import { usePrograms, useInstructors, useTestimonials, useSiteConfig } from '../hooks/useData'
import type { Program, Instructor } from '../lib/supabase'

// ── 유틸 ──
const esc = (s: string) =>
  (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

// ── 헤더 ──
function Header({ naverUrl, onContact, scrolled }: { naverUrl: string; onContact: () => void; scrolled: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <>
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 50, width: '100%',
          background: scrolled ? '#FAF7F2' : 'transparent',
          boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)' : 'none',
          transition: 'background .3s, box-shadow .3s',
        }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <button onClick={() => scrollTo('hero')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <span style={{ fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', color: scrolled ? '#1C1917' : '#FAF7F2', transition: 'color .3s', fontFamily: 'Pretendard, sans-serif' }}>한국AI창의융합협회</span>
          </button>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {['강의소개|programs', '강사진|instructors', '문의하기|contact', '협회소개|hero'].map(item => {
              const [label, id] = item.split('|')
              return (
                <button key={id} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 8, color: scrolled ? '#78716C' : 'rgba(250,247,242,.8)', transition: 'color .2s' }}>
                  {label}
                </button>
              )
            })}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <a href={naverUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#03C75A', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', textDecoration: 'none' }}>
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 900, fontSize: 13 }}>N</span>
              네이버 카페
            </a>
            <button onClick={onContact} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>
              강의 문의하기 →
            </button>
          </div>
        </div>
      </header>
    </>
  )
}

// ── 강의 모달 ──
function ProgramModal({ program, programs, onClose, onContact }: { program: Program; programs: Program[]; onClose: () => void; onContact: (title?: string) => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FAF7F2', borderRadius: 20, maxWidth: 580, width: '100%', maxHeight: '88vh', overflowY: 'auto', animation: 'modalSlide .3s ease' }}>
        <div style={{ background: `linear-gradient(135deg,${program.gradient_from},${program.gradient_to})`, padding: 24, borderRadius: '20px 20px 0 0', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,.2)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 15 }}>✕</button>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <span style={{ background: 'rgba(0,0,0,.2)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>{program.category}</span>
            <span style={{ background: program.status === '모집중' ? '#16a34a' : '#78716C', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999 }}>{program.status}</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#FAF7F2', marginBottom: 10, fontFamily: 'Pretendard, sans-serif' }}>{program.title}</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: 'rgba(250,247,242,.8)', fontSize: 11 }}>
            <span>📅 {program.sessions}회</span>
            <span>⏱ {program.hours}시간</span>
            <span>🖥 {program.format}</span>
            <span>👤 {program.target}</span>
            <span style={{ color: '#FAF7F2', fontWeight: 700 }}>💰 {program.fee}</span>
          </div>
        </div>
        <div style={{ padding: 22 }}>
          {program.recommendations?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontWeight: 900, fontSize: 13, color: '#1C1917', marginBottom: 8, fontFamily: 'Pretendard, sans-serif' }}>✅ 이런 분께 추천드려요</h4>
              {program.recommendations.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                  <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 12, color: '#1C1917' }}>{r}</span>
                </div>
              ))}
            </div>
          )}
          {program.goals?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontWeight: 900, fontSize: 13, color: '#1C1917', marginBottom: 8, fontFamily: 'Pretendard, sans-serif' }}>🎯 강의 목표</h4>
              {program.goals.map((g, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                  <span style={{ color: '#C84B0F', fontWeight: 900, fontSize: 12, flexShrink: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{i + 1}</span>
                  <span style={{ fontSize: 12, color: '#1C1917' }}>{g}</span>
                </div>
              ))}
            </div>
          )}
          {program.curriculum?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontWeight: 900, fontSize: 13, color: '#1C1917', marginBottom: 8, fontFamily: 'Pretendard, sans-serif' }}>📚 커리큘럼</h4>
              {program.curriculum.map((c, i) => (
                <div key={i} style={{ background: '#EDE8DF', borderRadius: 8, padding: '9px 12px', marginBottom: 6, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#C84B0F', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 12, color: '#1C1917', marginBottom: 2 }}>{c.title}</p>
                    {c.content && <p style={{ fontSize: 11, color: '#78716C' }}>{c.content}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {program.curriculum?.length === 0 && (
            <div style={{ background: 'rgba(245,183,48,.15)', border: '1px solid #F5B730', borderRadius: 10, padding: '12px 14px', marginBottom: 16, color: '#1C1917', fontSize: 13 }}>
              ⚠️ 현재 커리큘럼 준비 중입니다. 문의하시면 오픈 시 우선 안내해드립니다.
            </div>
          )}
          <div style={{ background: '#EDE8DF', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#C84B0F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>강</div>
            <div>
              <p style={{ fontSize: 10, color: '#78716C' }}>담당 강사</p>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#1C1917' }}>{program.instructor_name}</p>
            </div>
          </div>
        </div>
        <div style={{ position: 'sticky', bottom: 0, background: '#FAF7F2', borderTop: '1px solid #EDE8DF', padding: 12, borderRadius: '0 0 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => { onClose(); onContact(program.title) }} style={{ width: '100%', background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: 12, borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 13 }}>
            수강 문의하기
          </button>
          {program.detail_url ? (
            <a href={program.detail_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#1C1917', color: '#FAF7F2', textDecoration: 'none', padding: 12, borderRadius: 999, fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 13 }}>
              전체 상세 보기 ↗
            </a>
          ) : (
            <button disabled style={{ width: '100%', background: '#EDE8DF', color: '#A8A29E', border: 'none', padding: 12, borderRadius: 999, fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'default' }}>
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
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FAF7F2', borderRadius: 20, maxWidth: 520, width: '100%', maxHeight: '88vh', overflowY: 'auto', animation: 'modalSlide .3s ease' }}>
        <div style={{ background: '#0B0A09', padding: 28, borderRadius: '20px 20px 0 0', textAlign: 'center', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,.1)', border: 'none', color: '#FAF7F2', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 15 }}>✕</button>
          <div style={{ width: 92, height: 92, borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 900, background: `linear-gradient(135deg,${instructor.gradient_from},${instructor.gradient_to})` }}>
            {instructor.initial}
          </div>
          <h2 style={{ color: '#FAF7F2', fontSize: 20, fontWeight: 900, marginBottom: 3, fontFamily: 'Pretendard, sans-serif' }}>{instructor.name}</h2>
          <p style={{ color: 'rgba(250,247,242,.6)', fontSize: 13, marginBottom: 10 }}>{instructor.title}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
            {instructor.tags.map(t => (
              <span key={t} style={{ background: '#F5B730', color: '#1C1917', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999 }}>{t}</span>
            ))}
          </div>
        </div>
        <div style={{ padding: 22 }}>
          <h4 style={{ fontWeight: 900, fontSize: 13, color: '#1C1917', marginBottom: 8, fontFamily: 'Pretendard, sans-serif' }}>📝 강사 소개</h4>
          <p style={{ color: '#1C1917', fontSize: 13, lineHeight: 1.8, marginBottom: 16 }}>{instructor.bio}</p>
          <h4 style={{ fontWeight: 900, fontSize: 13, color: '#1C1917', marginBottom: 8, fontFamily: 'Pretendard, sans-serif' }}>📌 주요 경력</h4>
          <div style={{ borderLeft: '2px solid #C84B0F', paddingLeft: 12, marginBottom: 16 }}>
            {instructor.career.map((c, i) => <p key={i} style={{ fontSize: 12, color: '#1C1917', marginBottom: 6 }}>{c}</p>)}
          </div>
          <h4 style={{ fontWeight: 900, fontSize: 13, color: '#1C1917', marginBottom: 8, fontFamily: 'Pretendard, sans-serif' }}>🏆 자격 & 수상</h4>
          <div style={{ marginBottom: 16 }}>
            {instructor.certifications.map((c, i) => (
              <span key={i} style={{ background: '#EDE8DF', color: '#1C1917', fontSize: 11, padding: '5px 11px', borderRadius: 999, display: 'inline-block', margin: 3 }}>{c}</span>
            ))}
          </div>
          {myPrograms.length > 0 && (
            <>
              <h4 style={{ fontWeight: 900, fontSize: 13, color: '#1C1917', marginBottom: 8, fontFamily: 'Pretendard, sans-serif' }}>📚 담당 강의</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {myPrograms.map(p => (
                  <div key={p.id} style={{ background: '#EDE8DF', borderRadius: 8, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{p.emoji}</span>
                    <span style={{ fontWeight: 700, fontSize: 12, color: '#1C1917' }}>{p.title}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ position: 'sticky', bottom: 0, background: '#FAF7F2', borderTop: '1px solid #EDE8DF', padding: 12, borderRadius: '0 0 20px 20px' }}>
          <button onClick={() => { onClose(); onContact() }} style={{ width: '100%', background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: 12, borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 13 }}>
            이 강사 강의 문의하기
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 수강 문의 모달 ──
function ContactModal({ programs, defaultCourse, onClose }: { programs: Program[]; defaultCourse?: string; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', affiliation: '', course: defaultCourse || '', message: '' })
  const [agreed, setAgreed] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.email || !form.message) { alert('필수 항목을 모두 입력해주세요'); return }
    if (!agreed) { alert('개인정보 수집에 동의해주세요'); return }
    setSubmitting(true)
    const { supabase } = await import('../lib/supabase')
    await supabase.from('contacts').insert({ type: 'course', ...form, interested_course: form.course, inquiry_type: '강의 수강 문의', status: '미확인' })
    setSubmitting(false)
    setSuccess(true)
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#FAF7F2', borderRadius: 20, maxWidth: 480, width: '100%', animation: 'modalSlide .3s ease' }}>
        <div style={{ background: 'linear-gradient(135deg,#C84B0F,#F5B730)', padding: '22px 24px', borderRadius: '20px 20px 0 0', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,.2)', border: 'none', color: '#fff', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', fontSize: 14 }}>✕</button>
          <h3 style={{ color: '#FAF7F2', fontSize: 18, fontWeight: 900, fontFamily: 'Pretendard, sans-serif' }}>📝 강의 수강 문의</h3>
        </div>
        <div style={{ padding: 22 }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1C1917', marginBottom: 8, fontFamily: 'Pretendard, sans-serif' }}>문의가 접수되었습니다!</h3>
              <p style={{ color: '#78716C', marginBottom: 24, fontSize: 13, lineHeight: 1.6 }}>담당자가 1~2 영업일 내에 연락드리겠습니다.</p>
              <button onClick={onClose} style={{ background: '#EDE8DF', color: '#1C1917', border: 'none', padding: '12px 28px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 13 }}>닫기</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(['이름 *|name|text', '연락처 * (010-0000-0000)|phone|tel', '이메일 *|email|email', '소속·직책 (선택)|affiliation|text'] as const).map(field => {
                const [placeholder, key, type] = field.split('|') as [string, keyof typeof form, string]
                return <input key={key} type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', background: '#EDE8DF', border: '1.5px solid transparent', borderRadius: 10, padding: '9px 13px', fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#1C1917', outline: 'none' }} />
              })}
              <select value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} style={{ width: '100%', background: '#EDE8DF', border: '1.5px solid transparent', borderRadius: 10, padding: '9px 13px', fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#1C1917', outline: 'none', cursor: 'pointer' }}>
                <option value="">관심 강의 선택 (선택)</option>
                {programs.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
                <option value="기타">기타</option>
              </select>
              <textarea placeholder="문의 내용 *" rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ width: '100%', background: '#EDE8DF', border: '1.5px solid transparent', borderRadius: 10, padding: '9px 13px', fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#1C1917', outline: 'none', resize: 'none' }} />
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: '#C84B0F' }} />
                <span style={{ fontSize: 12, color: '#78716C', lineHeight: 1.5 }}>개인정보 수집·이용에 동의합니다<br /><span style={{ fontSize: 11, color: '#A8A29E' }}>(수집 항목: 이름·연락처·이메일 / 목적: 문의 답변 / 보유기간: 1년)</span></span>
              </label>
              <button onClick={handleSubmit} disabled={submitting} style={{ width: '100%', background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: 13, borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 13, opacity: submitting ? 0.6 : 1 }}>
                {submitting ? '접수 중...' : '문의 접수하기'}
              </button>
            </div>
          )}
        </div>
      </div>
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

  // 스크롤 감지
  useState(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  })

  const statusStyle = (status: string) =>
    status === '모집중' ? { background: '#16a34a', color: '#fff' } : { background: '#78716C', color: '#fff' }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header naverUrl={config.naver_cafe_url} onContact={() => openContact()} scrolled={scrolled} />

      {/* HERO */}
      <section id="hero" style={{ background: '#0B0A09', padding: '80px 32px', marginTop: -60, paddingTop: 120, position: 'relative', overflow: 'hidden', backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)', backgroundSize: '32px 32px' }}>
        <div style={{ position: 'absolute', top: 20, right: 32, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, opacity: .12 }}>
          {Array(9).fill('✕').map((x, i) => <span key={i} style={{ color: '#fff', fontSize: 20 }}>{x}</span>)}
        </div>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 40, alignItems: 'center' }}>
          <div>
            <span style={{ border: '1.5px solid #C84B0F', color: '#C84B0F', fontSize: 11, fontWeight: 700, letterSpacing: '.18em', padding: '6px 14px', borderRadius: 999, display: 'inline-block', marginBottom: 22, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>ABOUT KACCA</span>
            <h1 style={{ fontSize: 44, fontWeight: 900, color: '#FAF7F2', lineHeight: 1.1, marginBottom: 18, fontFamily: 'Pretendard, sans-serif' }}>AI 시대를 이끄는<br />창의적 융합의 힘</h1>
            <div style={{ background: '#F5B730', color: '#1C1917', borderRadius: 12, padding: '12px 16px', display: 'inline-block', marginBottom: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.5, fontFamily: 'Pretendard, sans-serif' }}>한국AI창의융합협회(KACCA)는<br />AI 교육의 새로운 기준을 만듭니다.</p>
            </div>
            <p style={{ color: 'rgba(250,247,242,.65)', lineHeight: 1.8, marginBottom: 26, fontSize: 14, fontFamily: 'Pretendard, sans-serif' }}>
              기초부터 실무 중심 커리큘럼으로 개인과 조직의 AI 역량을 높여드립니다.<br />
              2026년 설립된 AI 교육 전문 협회로, 검증된 프로그램과 커뮤니티를 제공합니다.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => scrollTo('programs')} style={{ background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: '10px 22px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 13 }}>강의 살펴보기 →</button>
              <a href={config.naver_cafe_url || '#'} target="_blank" rel="noopener noreferrer" style={{ background: '#03C75A', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 900 }}>N</span> 네이버 카페
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-end' }}>
            <div className="animate-float" style={{ background: '#FAF7F2', borderRadius: 16, padding: 18, width: 170, boxShadow: '0 8px 32px rgba(0,0,0,.3)' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🎓</div>
              <div style={{ fontWeight: 700, color: '#1C1917', fontSize: 14, fontFamily: 'Pretendard, sans-serif' }}>AI 교육 전문</div>
              <div style={{ color: '#78716C', fontSize: 12, marginTop: 2 }}>2026 창립</div>
            </div>
            <div className="animate-float-delayed" style={{ background: '#FAF7F2', borderRadius: 16, padding: 18, width: 170, boxShadow: '0 8px 32px rgba(0,0,0,.3)', marginLeft: 16 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>📚</div>
              <div style={{ fontWeight: 700, color: '#1C1917', fontSize: 14, fontFamily: 'Pretendard, sans-serif' }}>검증된 커리큘럼</div>
              <div style={{ color: '#78716C', fontSize: 12, marginTop: 2 }}>4개 과정 운영</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" style={{ background: '#EDE8DF', padding: '64px 32px', backgroundImage: 'linear-gradient(rgba(28,25,23,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(28,25,23,.05) 1px,transparent 1px)', backgroundSize: '32px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ color: '#C84B0F', fontSize: 11, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'block', marginBottom: 10 }}>PROGRAMS</span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#1C1917', marginBottom: 8, fontFamily: 'Pretendard, sans-serif' }}>강의 프로그램</h2>
            <p style={{ color: '#78716C', fontSize: 14, fontFamily: 'Pretendard, sans-serif' }}>AI 교육의 첫 걸음, 지금 시작하세요</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            {programs.map(p => (
              <div key={p.id} onClick={() => setSelectedProgram(p)} style={{ background: '#FAF7F2', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,.07)', cursor: 'pointer', transition: 'transform .25s, box-shadow .25s' }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,.12)' }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,.07)' }}>
                <div style={{ height: 120, background: `linear-gradient(135deg,${p.gradient_from},${p.gradient_to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, position: 'relative' }}>
                  {p.emoji}
                  <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: 'rgba(0,0,0,.2)', color: '#fff' }}>{p.category}</span>
                  <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 999, ...statusStyle(p.status) }}>{p.status}</span>
                </div>
                <div style={{ padding: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 900, color: '#1C1917', marginBottom: 3, fontFamily: 'Pretendard, sans-serif' }}>{p.title}</h3>
                  <p style={{ color: '#78716C', fontSize: 12, marginBottom: 10, fontFamily: 'Pretendard, sans-serif' }}>{p.instructor_name}</p>
                  <div style={{ borderTop: '1px solid #EDE8DF', paddingTop: 9, marginBottom: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ color: '#78716C', fontSize: 11 }}>📅 {p.sessions}회</span>
                    <span style={{ color: '#78716C', fontSize: 11 }}>🖥 {p.format}</span>
                    <span style={{ color: '#78716C', fontSize: 11 }}>👤 {p.target}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#C84B0F', fontWeight: 900, fontSize: 16, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{p.fee}</span>
                    <button style={{ background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: '7px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 11 }}>자세히 보기</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#C84B0F', borderRadius: 16, padding: '22px 28px', marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'Pretendard, sans-serif' }}>원하는 강의가 없으신가요? 맞춤 강의를 제안해드립니다.</p>
            <button onClick={() => openContact()} style={{ background: '#fff', color: '#C84B0F', border: 'none', padding: '10px 20px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>📝 강의 수강 문의하기 →</button>
          </div>
        </div>
      </section>

      {/* INSTRUCTORS */}
      <section id="instructors" style={{ background: '#FAF7F2', padding: '64px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ color: '#C84B0F', fontSize: 11, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'block', marginBottom: 10 }}>INSTRUCTORS</span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#1C1917', marginBottom: 8, fontFamily: 'Pretendard, sans-serif' }}>강사진 소개</h2>
            <p style={{ color: '#78716C', fontSize: 14 }}>현장 경험과 전문성을 갖춘 강사진이 함께합니다</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {instructors.map(inst => (
              <div key={inst.id} onClick={() => setSelectedInstructor(inst)} style={{ background: '#EDE8DF', borderRadius: 16, padding: 18, textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,.05)', transition: 'transform .25s' }}
                onMouseOver={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'}
                onMouseOut={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'}>
                <div style={{ width: 68, height: 68, borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 900, background: `linear-gradient(135deg,${inst.gradient_from},${inst.gradient_to})` }}>{inst.initial}</div>
                <h3 style={{ fontSize: 13, fontWeight: 900, color: '#1C1917', marginBottom: 2, fontFamily: 'Pretendard, sans-serif' }}>{inst.name}</h3>
                <p style={{ color: '#78716C', fontSize: 11, marginBottom: 8 }}>{inst.title}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3, marginBottom: 8 }}>
                  {inst.tags.map(t => <span key={t} style={{ background: '#FAF7F2', color: '#1C1917', fontSize: 10, padding: '3px 9px', borderRadius: 999 }}>{t}</span>)}
                </div>
                <p style={{ color: '#78716C', fontSize: 11, lineHeight: 1.5, marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{inst.intro}</p>
                <button style={{ width: '100%', border: '2px solid #C84B0F', color: '#C84B0F', background: 'transparent', padding: 7, borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 11 }}>프로필 보기</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" style={{ background: '#EDE8DF', padding: '64px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ color: '#C84B0F', fontSize: 11, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'block', marginBottom: 10 }}>REVIEWS</span>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#1C1917', marginBottom: 36, fontFamily: 'Pretendard, sans-serif' }}>수강생 후기</h2>
          {testimonials.length === 0 ? (
            <div style={{ background: '#FAF7F2', borderRadius: 20, padding: '48px 32px' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>⭐</div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1C1917', marginBottom: 8, fontFamily: 'Pretendard, sans-serif' }}>첫 번째 수강생의 후기를 기다리고 있습니다</h3>
              <p style={{ color: '#78716C', marginBottom: 24, fontSize: 13 }}>강의 수강 후 후기를 남겨주시면 소정의 혜택을 드립니다 😊</p>
              <button onClick={() => openContact()} style={{ background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: '10px 22px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 13 }}>강의 문의하기</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {testimonials.map(t => (
                <div key={t.id} style={{ background: '#FAF7F2', borderRadius: 16, padding: 24, textAlign: 'left', boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}>
                  <div style={{ fontSize: 32, color: '#C84B0F', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 10 }}>"</div>
                  <div style={{ marginBottom: 8 }}>{'⭐'.repeat(t.rating)}</div>
                  <p style={{ color: '#1C1917', fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{t.content}</p>
                  <div style={{ borderTop: '1px solid #EDE8DF', paddingTop: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#1C1917' }}>{t.name}</span>
                    <span style={{ color: '#78716C', fontSize: 12, marginLeft: 8 }}>{t.affiliation}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ background: '#EDE8DF', padding: '64px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ color: '#C84B0F', fontSize: 11, fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'block', marginBottom: 10 }}>CONTACT US</span>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#1C1917', marginBottom: 8, fontFamily: 'Pretendard, sans-serif' }}>언제든지 문의하세요</h2>
            <p style={{ color: '#78716C', fontSize: 14 }}>강의 수강, 기업 교육, 강사 섭외 등 어떤 문의도 친절하게 답변드립니다</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: 'N', bg: '#03C75A', title: '네이버 카페', desc: '회원 커뮤니티에 참여하고 최신 소식을 받아보세요', btnText: '카페 바로가기 ↗', btnBg: '#03C75A', btnColor: '#fff', href: config.naver_cafe_url || '#' },
                { icon: '💬', bg: '#FEE500', title: '카카오톡 문의', desc: '빠른 답변이 필요하신 분! 오픈채팅으로 실시간 상담', btnText: '카카오톡 문의 ↗', btnBg: '#FEE500', btnColor: '#1C1917', href: config.kakao_channel_url || '#' },
              ].map(c => (
                <div key={c.title} style={{ background: '#FAF7F2', borderRadius: 16, padding: 18, boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13, flexShrink: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{c.icon}</div>
                    <div><p style={{ fontWeight: 700, color: '#1C1917', marginBottom: 3 }}>{c.title}</p><p style={{ color: '#78716C', fontSize: 12, lineHeight: 1.5 }}>{c.desc}</p></div>
                  </div>
                  <a href={c.href} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', background: c.btnBg, color: c.btnColor, border: 'none', padding: 9, borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 12, textAlign: 'center', textDecoration: 'none' }}>{c.btnText}</a>
                </div>
              ))}
              <div style={{ background: '#0B0A09', borderRadius: 16, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FAF7F2', fontSize: 16, flexShrink: 0 }}>✉</div>
                  <div><p style={{ fontWeight: 700, color: '#FAF7F2', marginBottom: 3 }}>이메일 문의</p><p style={{ color: 'rgba(250,247,242,.55)', fontSize: 12, lineHeight: 1.5 }}>우측 폼을 통해 문의하시면 영업일 기준 1-2일 내 답변드립니다</p><p style={{ color: 'rgba(250,247,242,.35)', fontSize: 11, marginTop: 8 }}>⏰ {config.operating_hours} 운영</p></div>
                </div>
              </div>
            </div>
            <EmailForm programs={programs} />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#292524', padding: '36px 32px 0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ color: '#C84B0F', fontSize: 18 }}>🤖</span>
                <span style={{ color: '#FAF7F2', fontWeight: 700, fontFamily: 'Pretendard, sans-serif' }}>한국AI창의융합협회</span>
              </div>
              <p style={{ color: 'rgba(250,247,242,.4)', fontSize: 12, marginBottom: 14, fontFamily: 'Pretendard, sans-serif' }}>AI 교육의 새로운 기준, KACCA</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['▶', '◉', '💬'].map((icon, i) => (
                  <div key={i} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FAF7F2', fontSize: 12, cursor: 'pointer' }}>{icon}</div>
                ))}
                <a href={config.naver_cafe_url || '#'} target="_blank" rel="noopener noreferrer" style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FAF7F2', fontSize: 11, fontWeight: 900, cursor: 'pointer', textDecoration: 'none', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>N</a>
              </div>
            </div>
            <div>
              <p style={{ color: 'rgba(250,247,242,.35)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'Pretendard, sans-serif' }}>바로가기</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {['강의소개|programs', '강사진|instructors', '문의하기|contact', '협회소개|hero'].map(item => {
                  const [label, id] = item.split('|')
                  return <button key={id} onClick={() => scrollTo(id)} style={{ textAlign: 'left', background: 'none', border: 'none', color: 'rgba(250,247,242,.55)', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: 13, padding: 0 }}>{label}</button>
                })}
              </div>
            </div>
          </div>
        </div>
        <div style={{ background: '#1C1917', padding: '12px 32px', margin: '0 -32px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {[`사업자등록번호: ${config.business_number}`, `대표자: ${config.ceo_name}`, '개인정보처리방침', '이용약관'].map(t => (
                <span key={t} style={{ color: 'rgba(250,247,242,.25)', fontSize: 11, fontFamily: 'Pretendard, sans-serif', cursor: 'pointer' }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ color: 'rgba(250,247,242,.25)', fontSize: 11 }}>© 2026 한국AI창의융합협회</span>
              <button onClick={() => window.location.href = '/admin'} style={{ background: 'none', border: 'none', color: 'rgba(250,247,242,.18)', cursor: 'pointer', fontSize: 11, fontFamily: 'Pretendard, sans-serif' }}>관리자</button>
            </div>
          </div>
        </div>
      </footer>

      {/* 모달 */}
      {selectedProgram && <ProgramModal program={selectedProgram} programs={programs} onClose={() => setSelectedProgram(null)} onContact={openContact} />}
      {selectedInstructor && <InstructorModal instructor={selectedInstructor} programs={programs} onClose={() => setSelectedInstructor(null)} onContact={() => openContact()} />}
      {contactOpen && <ContactModal programs={programs} defaultCourse={contactCourse} onClose={() => setContactOpen(false)} />}
    </div>
  )
}

// ── 이메일 폼 ──
function EmailForm({ programs }: { programs: Program[] }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: '', message: '' })
  const [count, setCount] = useState(0)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!form.name || !form.email || !form.type || !form.message) { alert('필수 항목을 모두 입력해주세요'); return }
    setSubmitting(true)
    const { supabase } = await import('../lib/supabase')
    await supabase.from('contacts').insert({ type: 'email', name: form.name, email: form.email, phone: form.phone, inquiry_type: form.type, message: form.message, affiliation: '', interested_course: '', status: '미확인' })
    setSubmitting(false)
    setSuccess(true)
  }

  if (success) return (
    <div style={{ background: '#FAF7F2', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1C1917', marginBottom: 6, fontFamily: 'Pretendard, sans-serif' }}>문의가 접수되었습니다!</h3>
        <p style={{ color: '#78716C', fontSize: 13 }}>1~2 영업일 내에 답변드리겠습니다.</p>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#FAF7F2', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,.07)' }}>
      <h3 style={{ fontWeight: 700, color: '#1C1917', marginBottom: 18, fontSize: 15, fontFamily: 'Pretendard, sans-serif' }}>📧 이메일 문의하기</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <input placeholder="이름 *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ background: '#EDE8DF', border: '1.5px solid transparent', borderRadius: 10, padding: '9px 13px', fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#1C1917', outline: 'none', width: '100%' }} />
        <input type="email" placeholder="이메일 *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ background: '#EDE8DF', border: '1.5px solid transparent', borderRadius: 10, padding: '9px 13px', fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#1C1917', outline: 'none', width: '100%' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <input type="tel" placeholder="연락처" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={{ background: '#EDE8DF', border: '1.5px solid transparent', borderRadius: 10, padding: '9px 13px', fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#1C1917', outline: 'none', width: '100%' }} />
        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ background: '#EDE8DF', border: '1.5px solid transparent', borderRadius: 10, padding: '9px 13px', fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#1C1917', outline: 'none', width: '100%', cursor: 'pointer' }}>
          <option value="">문의 유형 *</option>
          <option>강의 수강 문의</option><option>기업 교육 문의</option><option>강사 섭외</option><option>협업 제안</option><option>기타</option>
        </select>
      </div>
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <textarea placeholder="문의 내용 *" rows={5} maxLength={500} value={form.message} onChange={e => { setForm(f => ({ ...f, message: e.target.value })); setCount(e.target.value.length) }} style={{ background: '#EDE8DF', border: '1.5px solid transparent', borderRadius: 10, padding: '9px 13px', fontFamily: 'Pretendard, sans-serif', fontSize: 13, color: '#1C1917', outline: 'none', width: '100%', resize: 'none' }} />
        <span style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 11, color: '#78716C' }}>{count}/500</span>
      </div>
      <button onClick={submit} disabled={submitting} style={{ width: '100%', background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: 13, borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 13, opacity: submitting ? 0.6 : 1 }}>
        {submitting ? '전송 중...' : '✈ 문의 보내기'}
      </button>
    </div>
  )
}
