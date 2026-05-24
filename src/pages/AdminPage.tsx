import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Program, Instructor, Testimonial, Contact, SiteConfig } from '../lib/supabase'
import { fallbackPrograms, fallbackInstructors, fallbackSiteConfig } from '../data/fallback'

// ── 공통 스타일 ──
const inp: React.CSSProperties = { width: '100%', background: '#EDE8DF', border: '1.5px solid transparent', borderRadius: 8, padding: '8px 11px', fontFamily: 'Pretendard, sans-serif', fontSize: 12, color: '#1C1917', outline: 'none' }
const btnO: React.CSSProperties = { background: '#C84B0F', color: '#FAF7F2', border: 'none', padding: '7px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 12 }
const btnG: React.CSSProperties = { background: '#EDE8DF', color: '#1C1917', border: 'none', padding: '7px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 12 }
const card: React.CSSProperties = { background: '#FAF7F2', borderRadius: 12, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,.06)' }
const lbl: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 700, color: '#78716C', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'Pretendard, sans-serif' }

function Toast({ msg }: { msg: string }) {
  return msg ? <div style={{ position: 'fixed', bottom: 16, right: 16, background: '#1C1917', color: '#FAF7F2', padding: '10px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, zIndex: 999, fontFamily: 'Pretendard, sans-serif' }}>{msg}</div> : null
}

// ── 로그인 ──
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
    if (error) setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    else onLogin()
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B0A09', backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize: '32px 32px' }}>
      <form onSubmit={login} style={{ background: '#FAF7F2', borderRadius: 18, padding: '32px 28px', width: 320, boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>🤖</div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1C1917', marginBottom: 3, fontFamily: 'Pretendard, sans-serif' }}>KACCA 관리자</h2>
          <p style={{ color: '#78716C', fontSize: 11, fontFamily: 'Pretendard, sans-serif' }}>한국AI창의융합협회 관리자 페이지</p>
        </div>
        <div style={{ marginBottom: 10 }}><label style={lbl}>이메일</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@kacca.or.kr" style={inp} /></div>
        <div style={{ marginBottom: 6 }}><label style={lbl}>비밀번호</label><input type="password" value={pw} onChange={e => setPw(e.target.value)} style={inp} /></div>
        {error && <p style={{ color: '#dc2626', fontSize: 11, marginBottom: 8, textAlign: 'center', fontFamily: 'Pretendard, sans-serif' }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ ...btnO, width: '100%', padding: 12, fontSize: 13, marginTop: 12 }}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
        <div style={{ background: '#EDE8DF', borderRadius: 8, padding: '9px 12px', marginTop: 14, textAlign: 'center' }}>
          <p style={{ color: '#78716C', fontSize: 11, fontFamily: 'Pretendard, sans-serif' }}>Supabase Auth 계정으로 로그인하세요</p>
        </div>
      </form>
    </div>
  )
}

// ── 대시보드 ──
function Dashboard() {
  const [counts, setCounts] = useState({ programs: 0, instructors: 0, unread: 0, reviews: 0 })
  const [recent, setRecent] = useState<Contact[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('programs').select('id', { count: 'exact', head: true }),
      supabase.from('instructors').select('id', { count: 'exact', head: true }),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('status', '미확인'),
      supabase.from('testimonials').select('id', { count: 'exact', head: true }),
      supabase.from('contacts').select('*').order('created_at', { ascending: false }).limit(5),
    ]).then(([p, i, c, t, r]) => {
      setCounts({ programs: p.count || fallbackPrograms.length, instructors: i.count || fallbackInstructors.length, unread: c.count || 0, reviews: t.count || 0 })
      setRecent(r.data || [])
    })
  }, [])

  const statCards = [
    { label: '등록 강의', value: counts.programs, icon: '📚', color: '#C84B0F' },
    { label: '등록 강사', value: counts.instructors, icon: '👨‍🏫', color: '#F5B730' },
    { label: '미확인 문의', value: counts.unread, icon: '📩', color: '#0B0A09', valueColor: '#C84B0F' },
    { label: '수강 후기', value: counts.reviews, icon: '💬', color: '#78716C' },
  ]

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 4, fontFamily: 'Pretendard, sans-serif' }}>대시보드</h2>
      <p style={{ color: '#78716C', fontSize: 12, marginBottom: 16, fontFamily: 'Pretendard, sans-serif' }}>KACCA 홈페이지 현황을 확인하세요</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {statCards.map(s => (
          <div key={s.label} style={card}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.valueColor || '#1C1917', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.value}</div>
            <div style={{ color: '#78716C', fontSize: 11, marginTop: 2, fontFamily: 'Pretendard, sans-serif' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={card}>
        <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, fontFamily: 'Pretendard, sans-serif' }}>최근 문의</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['이름', '유형', '연락처', '상태', '접수일'].map(h => <th key={h} style={{ textAlign: 'left', padding: '9px 10px', fontSize: 10, color: '#78716C', fontWeight: 700, borderBottom: '1px solid #EDE8DF', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'Pretendard, sans-serif' }}>{h}</th>)}</tr></thead>
          <tbody>
            {recent.map(c => (
              <tr key={c.id}>
                <td style={{ padding: '10px', borderBottom: '1px solid #EDE8DF', fontWeight: 700, fontSize: 12 }}>{c.name}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #EDE8DF', color: '#78716C', fontSize: 12 }}>{c.inquiry_type || c.type}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #EDE8DF', color: '#78716C', fontSize: 12 }}>{c.phone}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #EDE8DF' }}><span style={{ background: c.status === '미확인' ? '#fee2e2' : '#dcfce7', color: c.status === '미확인' ? '#dc2626' : '#16a34a', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{c.status}</span></td>
                <td style={{ padding: '10px', borderBottom: '1px solid #EDE8DF', color: '#78716C', fontSize: 11 }}>{new Date(c.created_at).toLocaleDateString('ko-KR')}</td>
              </tr>
            ))}
            {recent.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#78716C', fontSize: 13 }}>아직 문의가 없습니다</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── 강의 관리 ──
function ProgramsManager({ toast }: { toast: (m: string) => void }) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [editing, setEditing] = useState<Partial<Program> | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [recs, setRecs] = useState<string[]>([])
  const [goals, setGoals] = useState<string[]>([])
  const [cur, setCur] = useState<{ title: string; content: string }[]>([])
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data, error } = await supabase.from('programs').select('*').order('order')
    if (!error && data) setPrograms(data)
    else setPrograms(fallbackPrograms)
  }

  useEffect(() => { load() }, [])

  const openForm = (p: Program | null) => {
    if (p) {
      setEditing({ ...p })
      setRecs(Array.isArray(p.recommendations) ? [...p.recommendations] : [])
      setGoals(Array.isArray(p.goals) ? [...p.goals] : [])
      setCur(Array.isArray(p.curriculum) ? p.curriculum.map(c => ({ title: c.title, content: c.content })) : [])
    } else {
      setEditing({ title: '', category: 'AI 기초', instructor_name: '', fee: '', sessions: 4, hours: 8, format: '온라인', target: '', status: '준비중', detail_url: '', emoji: '🎓', gradient_from: '#C84B0F', gradient_to: '#F5B730' })
      setRecs([]); setGoals([]); setCur([])
    }
    setActiveTab('basic')
  }

  const save = async () => {
    if (!editing || !editing.title) { alert('강의명을 입력해주세요'); return }
    setSaving(true)
    // Supabase에 보낼 데이터만 추출 (id, created_at 제외)
    const payload = {
      title: editing.title,
      category: editing.category || 'AI 기초',
      emoji: editing.emoji || '🎓',
      gradient_from: editing.gradient_from || '#C84B0F',
      gradient_to: editing.gradient_to || '#F5B730',
      instructor_name: editing.instructor_name || '',
      sessions: editing.sessions || 0,
      hours: editing.hours || 0,
      format: editing.format || '온라인',
      target: editing.target || '',
      fee: editing.fee || '',
      status: editing.status || '준비중',
      detail_url: editing.detail_url || '',
      recommendations: recs.filter(r => r.trim()),
      goals: goals.filter(g => g.trim()),
      curriculum: cur.filter(c => c.title.trim()).map((c, i) => ({ week: i + 1, title: c.title, content: c.content })),
      is_featured: true,
    }
    let err
    if (editing.id) {
      const { error } = await supabase.from('programs').update(payload).eq('id', editing.id)
      err = error
      if (!error) toast('✓ 강의가 수정되었습니다')
    } else {
      const { error } = await supabase.from('programs').insert({ ...payload, order: programs.length + 1 })
      err = error
      if (!error) toast('✓ 강의가 추가되었습니다')
    }
    if (err) {
      alert(`저장 오류: ${err.message}`)
      setSaving(false)
      return
    }
    await load()
    setEditing(null)
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const { error } = await supabase.from('programs').delete().eq('id', id)
    if (error) { alert(`삭제 오류: ${error.message}`); return }
    await load()
    toast('삭제되었습니다')
  }

  const tabs = [
    { id: 'basic', label: '📋 기본 정보' },
    { id: 'recs', label: '✅ 추천 대상' },
    { id: 'goals', label: '🎯 강의 목표' },
    { id: 'cur', label: '📚 커리큘럼' },
    { id: 'link', label: '🔗 상세 링크' },
  ]

  const emojiOptions = ['🎓', '🤖', '📖', '🛠️', '💡', '🚀', '📊', '🎯']
  const colorOptions = [
    { label: '오렌지-앰버', from: '#C84B0F', to: '#F5B730' },
    { label: '블랙-오렌지', from: '#1C1917', to: '#C84B0F' },
    { label: '앰버-그레이', from: '#F5B730', to: '#78716C' },
    { label: '골드-오렌지', from: '#F5B730', to: '#C84B0F' },
    { label: '그린-블랙', from: '#16a34a', to: '#1C1917' },
    { label: '블루-블랙', from: '#1d4ed8', to: '#1C1917' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 3, fontFamily: 'Pretendard, sans-serif' }}>강의 관리</h2>
          <p style={{ color: '#78716C', fontSize: 12, fontFamily: 'Pretendard, sans-serif' }}>강의를 추가·수정·삭제할 수 있습니다</p>
        </div>
        <button style={btnO} onClick={() => openForm(null)}>+ 새 강의 추가</button>
      </div>

      {editing !== null && (
        <div style={{ ...card, marginBottom: 14, borderLeft: '3px solid #C84B0F' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 13, fontFamily: 'Pretendard, sans-serif' }}>
              {editing.id ? `강의 수정 — ${editing.title}` : '새 강의 추가'}
            </span>
            <button style={{ ...btnG, fontSize: 11, padding: '5px 12px' }} onClick={() => setEditing(null)}>✕ 닫기</button>
          </div>

          {/* 탭 */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid #EDE8DF', overflowX: 'auto' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 700, color: activeTab === t.id ? '#C84B0F' : '#78716C', borderBottom: activeTab === t.id ? '2px solid #C84B0F' : '2px solid transparent', marginBottom: -2, whiteSpace: 'nowrap' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* 기본 정보 */}
          {activeTab === 'basic' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={lbl}>강의명 *</label>
                  <input style={inp} value={editing.title || ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} placeholder="강의명 입력" />
                </div>
                <div>
                  <label style={lbl}>카테고리</label>
                  <select style={{ ...inp, cursor: 'pointer' }} value={editing.category || ''} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))}>
                    {['AI 기초', '생성형 AI', 'AI 리터러시', 'AI 활용', '기업 교육'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={lbl}>담당 강사명</label>
                  <input style={inp} value={editing.instructor_name || ''} onChange={e => setEditing(p => ({ ...p, instructor_name: e.target.value }))} placeholder="이OO 강사" />
                </div>
                <div>
                  <label style={lbl}>수강료</label>
                  <input style={inp} value={editing.fee || ''} onChange={e => setEditing(p => ({ ...p, fee: e.target.value }))} placeholder="120,000원" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={lbl}>회차</label>
                  <input type="number" style={inp} value={editing.sessions || ''} onChange={e => setEditing(p => ({ ...p, sessions: +e.target.value }))} placeholder="4" />
                </div>
                <div>
                  <label style={lbl}>총 시간</label>
                  <input type="number" style={inp} value={editing.hours || ''} onChange={e => setEditing(p => ({ ...p, hours: +e.target.value }))} placeholder="8" />
                </div>
                <div>
                  <label style={lbl}>진행 방식</label>
                  <select style={{ ...inp, cursor: 'pointer' }} value={editing.format || ''} onChange={e => setEditing(p => ({ ...p, format: e.target.value }))}>
                    {['온라인', '오프라인', '혼합'].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={lbl}>수강 대상</label>
                  <input style={inp} value={editing.target || ''} onChange={e => setEditing(p => ({ ...p, target: e.target.value }))} placeholder="일반인·교사" />
                </div>
                <div>
                  <label style={lbl}>모집 상태</label>
                  <select style={{ ...inp, cursor: 'pointer' }} value={editing.status || ''} onChange={e => setEditing(p => ({ ...p, status: e.target.value as any }))}>
                    {['모집중', '마감임박', '마감', '준비중'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={lbl}>이모지</label>
                  <select style={{ ...inp, cursor: 'pointer' }} value={editing.emoji || '🎓'} onChange={e => setEditing(p => ({ ...p, emoji: e.target.value }))}>
                    {emojiOptions.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>카드 색상</label>
                  <select style={{ ...inp, cursor: 'pointer' }}
                    value={`${editing.gradient_from || '#C84B0F'},${editing.gradient_to || '#F5B730'}`}
                    onChange={e => {
                      const [from, to] = e.target.value.split(',')
                      setEditing(p => ({ ...p, gradient_from: from, gradient_to: to }))
                    }}>
                    {colorOptions.map(c => <option key={c.label} value={`${c.from},${c.to}`}>{c.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 추천 대상 */}
          {activeTab === 'recs' && (
            <div>
              <p style={{ color: '#78716C', fontSize: 11, marginBottom: 12, fontFamily: 'Pretendard, sans-serif' }}>수강을 추천하는 대상을 입력하세요. 모달에 체크리스트로 표시됩니다.</p>
              {recs.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input style={{ ...inp, flex: 1 }} value={r} onChange={e => setRecs(arr => arr.map((x, j) => j === i ? e.target.value : x))} placeholder={`추천 대상 ${i + 1}`} />
                  <button onClick={() => setRecs(arr => arr.filter((_, j) => j !== i))} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>×</button>
                </div>
              ))}
              <button onClick={() => setRecs(arr => [...arr, ''])} style={{ width: '100%', background: 'none', border: '1.5px dashed #C84B0F', color: '#C84B0F', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 700, marginTop: 4 }}>+ 추천 항목 추가</button>
            </div>
          )}

          {/* 강의 목표 */}
          {activeTab === 'goals' && (
            <div>
              <p style={{ color: '#78716C', fontSize: 11, marginBottom: 12, fontFamily: 'Pretendard, sans-serif' }}>수강 후 달성할 목표를 입력하세요. 번호 리스트로 표시됩니다.</p>
              {goals.map((g, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input style={{ ...inp, flex: 1 }} value={g} onChange={e => setGoals(arr => arr.map((x, j) => j === i ? e.target.value : x))} placeholder={`목표 ${i + 1}`} />
                  <button onClick={() => setGoals(arr => arr.filter((_, j) => j !== i))} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>×</button>
                </div>
              ))}
              <button onClick={() => setGoals(arr => [...arr, ''])} style={{ width: '100%', background: 'none', border: '1.5px dashed #C84B0F', color: '#C84B0F', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 700, marginTop: 4 }}>+ 목표 추가</button>
            </div>
          )}

          {/* 커리큘럼 */}
          {activeTab === 'cur' && (
            <div>
              <p style={{ color: '#78716C', fontSize: 11, marginBottom: 12, fontFamily: 'Pretendard, sans-serif' }}>회차별 강의 내용을 입력하세요. 아코디언으로 표시됩니다.</p>
              {cur.map((c, i) => (
                <div key={i} style={{ background: '#EDE8DF', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#C84B0F', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                    <input style={{ ...inp, flex: 1, background: '#FAF7F2' }} value={c.title} onChange={e => setCur(arr => arr.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} placeholder="회차 제목 (예: ChatGPT 제대로 쓰기)" />
                    <button onClick={() => setCur(arr => arr.filter((_, j) => j !== i))} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>×</button>
                  </div>
                  <textarea style={{ ...inp, background: '#FAF7F2', resize: 'none' }} rows={2} value={c.content} onChange={e => setCur(arr => arr.map((x, j) => j === i ? { ...x, content: e.target.value } : x))} placeholder="내용 (예: 프롬프트 기초, 실전 활용 실습)" />
                </div>
              ))}
              <button onClick={() => setCur(arr => [...arr, { title: '', content: '' }])} style={{ width: '100%', background: 'none', border: '1.5px dashed #C84B0F', color: '#C84B0F', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 700, marginTop: 4 }}>+ 회차 추가</button>
            </div>
          )}

          {/* 상세 링크 */}
          {activeTab === 'link' && (
            <div>
              <div style={{ background: '#fff0eb', border: '1px solid #C84B0F', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                <p style={{ color: '#C84B0F', fontSize: 12, fontWeight: 700, marginBottom: 4, fontFamily: 'Pretendard, sans-serif' }}>🔗 상세 페이지 링크란?</p>
                <p style={{ color: '#78716C', fontSize: 11, lineHeight: 1.6, fontFamily: 'Pretendard, sans-serif' }}>
                  모달 하단에 "전체 상세 보기 ↗" 버튼이 생깁니다.<br />
                  Notion, 네이버 블로그, 구글 문서 등 어떤 URL이든 가능합니다.<br />
                  URL이 없으면 버튼이 "준비 중" 비활성 상태로 표시됩니다.
                </p>
              </div>
              <label style={lbl}>상세 페이지 URL</label>
              <input style={{ ...inp, border: '1.5px solid #C84B0F' }} value={editing.detail_url || ''} onChange={e => setEditing(p => ({ ...p, detail_url: e.target.value }))} placeholder="https://notion.so/... 또는 https://blog.naver.com/..." />
              {editing.detail_url && (
                <div style={{ marginTop: 8, padding: '8px 12px', background: '#dcfce7', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#16a34a', fontSize: 12, fontWeight: 700 }}>✓ 링크 설정됨</span>
                  <span style={{ color: '#78716C', fontSize: 11 }}>{editing.detail_url}</span>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #EDE8DF', display: 'flex', gap: 8 }}>
            <button style={{ ...btnO, opacity: saving ? 0.6 : 1 }} onClick={save} disabled={saving}>
              {saving ? '저장 중...' : '저장하기'}
            </button>
            <button style={btnG} onClick={() => setEditing(null)}>취소</button>
          </div>
        </div>
      )}

      {/* 강의 목록 테이블 */}
      <div style={card}>
        {programs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📚</div>
            <p style={{ fontWeight: 700, color: '#1C1917', marginBottom: 4, fontFamily: 'Pretendard, sans-serif' }}>등록된 강의가 없습니다</p>
            <p style={{ color: '#78716C', fontSize: 12, fontFamily: 'Pretendard, sans-serif' }}>위 버튼을 눌러 첫 강의를 추가해보세요</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['강의명', '카테고리', '강사', '상태', '수강료', '상세링크', '관리'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '9px 10px', fontSize: 10, color: '#78716C', fontWeight: 700, borderBottom: '1px solid #EDE8DF', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'Pretendard, sans-serif' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {programs.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: 10, borderBottom: '1px solid #EDE8DF', fontWeight: 700, fontSize: 12, fontFamily: 'Pretendard, sans-serif' }}>{p.emoji} {p.title}</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #EDE8DF' }}><span style={{ background: '#fff0eb', color: '#C84B0F', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{p.category}</span></td>
                  <td style={{ padding: 10, borderBottom: '1px solid #EDE8DF', color: '#78716C', fontSize: 12 }}>{p.instructor_name}</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #EDE8DF' }}>
                    <span style={{ background: p.status === '모집중' ? '#dcfce7' : p.status === '마감임박' ? '#fee2e2' : '#f1f5f9', color: p.status === '모집중' ? '#16a34a' : p.status === '마감임박' ? '#dc2626' : '#64748b', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{p.status}</span>
                  </td>
                  <td style={{ padding: 10, borderBottom: '1px solid #EDE8DF', color: '#C84B0F', fontWeight: 700, fontSize: 12 }}>{p.fee}</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #EDE8DF' }}>
                    {p.detail_url
                      ? <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>✓ 있음</span>
                      : <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>미설정</span>}
                  </td>
                  <td style={{ padding: 10, borderBottom: '1px solid #EDE8DF', whiteSpace: 'nowrap' }}>
                    <button onClick={() => openForm(p)} style={{ color: '#C84B0F', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'Pretendard, sans-serif' }}>수정</button>{' '}
                    <button onClick={() => del(p.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'Pretendard, sans-serif' }}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── 강사 관리 ──
function InstructorsManager({ toast }: { toast: (m: string) => void }) {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [editing, setEditing] = useState<Partial<Instructor> | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data, error } = await supabase.from('instructors').select('*').order('order')
    if (!error && data) setInstructors(data)
    else setInstructors(fallbackInstructors)
  }

  useEffect(() => { load() }, [])

  const openForm = (inst: Instructor | null) => {
    if (inst) {
      setEditing({
        ...inst,
        tags: Array.isArray(inst.tags) ? inst.tags : [],
        career: Array.isArray(inst.career) ? inst.career : [],
        certifications: Array.isArray(inst.certifications) ? inst.certifications : [],
      })
    } else {
      setEditing({ name: '', title: '', initial: '', gradient_from: '#C84B0F', gradient_to: '#F5B730', tags: [], intro: '', bio: '', career: [], certifications: [], course_ids: [] })
    }
  }

  const save = async () => {
    if (!editing || !editing.name) { alert('이름을 입력해주세요'); return }
    setSaving(true)
    const tagsRaw = editing.tags
    const careerRaw = editing.career
    const certsRaw = editing.certifications

    const payload = {
      name: editing.name,
      title: editing.title || '',
      initial: editing.initial || editing.name.charAt(0),
      gradient_from: editing.gradient_from || '#C84B0F',
      gradient_to: editing.gradient_to || '#F5B730',
      tags: typeof tagsRaw === 'string'
        ? (tagsRaw as string).split(',').map((t: string) => t.trim()).filter(Boolean)
        : (tagsRaw || []),
      intro: editing.intro || '',
      bio: editing.bio || '',
      career: typeof careerRaw === 'string'
        ? (careerRaw as string).split('\n').filter(Boolean)
        : (careerRaw || []),
      certifications: typeof certsRaw === 'string'
        ? (certsRaw as string).split('\n').filter(Boolean)
        : (certsRaw || []),
      course_ids: editing.course_ids || [],
      order: editing.order || instructors.length + 1,
    }

    let err
    if (editing.id) {
      const { error } = await supabase.from('instructors').update(payload).eq('id', editing.id)
      err = error
      if (!error) toast('✓ 강사 정보가 수정되었습니다')
    } else {
      const { error } = await supabase.from('instructors').insert(payload)
      err = error
      if (!error) toast('✓ 강사가 추가되었습니다')
    }
    if (err) { alert(`저장 오류: ${err.message}`); setSaving(false); return }
    await load()
    setEditing(null)
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const { error } = await supabase.from('instructors').delete().eq('id', id)
    if (error) { alert(`삭제 오류: ${error.message}`); return }
    await load()
    toast('삭제되었습니다')
  }

  const colorOptions = [
    { label: '오렌지-앰버', from: '#C84B0F', to: '#F5B730' },
    { label: '블랙-오렌지', from: '#1C1917', to: '#C84B0F' },
    { label: '앰버-그레이', from: '#F5B730', to: '#78716C' },
    { label: '골드-오렌지', from: '#F5B730', to: '#C84B0F' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 3, fontFamily: 'Pretendard, sans-serif' }}>강사 관리</h2>
          <p style={{ color: '#78716C', fontSize: 12, fontFamily: 'Pretendard, sans-serif' }}>강사를 추가·수정·삭제할 수 있습니다</p>
        </div>
        <button style={btnO} onClick={() => openForm(null)}>+ 새 강사 추가</button>
      </div>

      {editing !== null && (
        <div style={{ ...card, marginBottom: 14, borderLeft: '3px solid #C84B0F' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 13, fontFamily: 'Pretendard, sans-serif' }}>{editing.id ? `강사 수정 — ${editing.name}` : '새 강사 추가'}</span>
            <button style={{ ...btnG, fontSize: 11, padding: '5px 12px' }} onClick={() => setEditing(null)}>✕ 닫기</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={lbl}>이름 *</label><input style={inp} value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} placeholder="홍OO 강사" /></div>
            <div><label style={lbl}>직함</label><input style={inp} value={editing.title || ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} placeholder="AI 교육 전문가" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={lbl}>이니셜 (최대 2자)</label>
              <input style={inp} maxLength={2} value={editing.initial || ''} onChange={e => setEditing(p => ({ ...p, initial: e.target.value }))} placeholder="홍" />
            </div>
            <div>
              <label style={lbl}>아바타 색상</label>
              <select style={{ ...inp, cursor: 'pointer' }}
                value={`${editing.gradient_from || '#C84B0F'},${editing.gradient_to || '#F5B730'}`}
                onChange={e => { const [from, to] = e.target.value.split(','); setEditing(p => ({ ...p, gradient_from: from, gradient_to: to })) }}>
                {colorOptions.map(c => <option key={c.label} value={`${c.from},${c.to}`}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={lbl}>전문 분야 태그 (쉼표로 구분)</label>
            <input style={inp}
              value={Array.isArray(editing.tags) ? editing.tags.join(', ') : (editing.tags as any) || ''}
              onChange={e => setEditing(p => ({ ...p, tags: e.target.value as any }))}
              placeholder="생성형AI, 교사연수, AI리터러시" />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={lbl}>한 줄 소개</label>
            <input style={inp} value={editing.intro || ''} onChange={e => setEditing(p => ({ ...p, intro: e.target.value }))} placeholder="강사 소개를 한 줄로 입력하세요" />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={lbl}>강사 소개 (전문)</label>
            <textarea style={{ ...inp, resize: 'none' }} rows={3} value={editing.bio || ''} onChange={e => setEditing(p => ({ ...p, bio: e.target.value }))} placeholder="강사의 상세 소개를 입력하세요" />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={lbl}>주요 경력 (줄바꿈으로 구분)</label>
            <textarea style={{ ...inp, resize: 'none' }} rows={3}
              value={Array.isArray(editing.career) ? editing.career.join('\n') : (editing.career as any) || ''}
              onChange={e => setEditing(p => ({ ...p, career: e.target.value as any }))}
              placeholder={'2020~2024  OO기관 근무\n2026~현재  한국AI창의융합협회 강사'} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>자격 & 수상 (줄바꿈으로 구분)</label>
            <textarea style={{ ...inp, resize: 'none' }} rows={2}
              value={Array.isArray(editing.certifications) ? editing.certifications.join('\n') : (editing.certifications as any) || ''}
              onChange={e => setEditing(p => ({ ...p, certifications: e.target.value as any }))}
              placeholder={'자격증명 (취득연도)\n수상내역 (연도)'} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...btnO, opacity: saving ? 0.6 : 1 }} onClick={save} disabled={saving}>{saving ? '저장 중...' : '저장하기'}</button>
            <button style={btnG} onClick={() => setEditing(null)}>취소</button>
          </div>
        </div>
      )}

      {instructors.length === 0 && editing === null && (
        <div style={{ ...card, textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>👨‍🏫</div>
          <p style={{ fontWeight: 700, color: '#1C1917', marginBottom: 4, fontFamily: 'Pretendard, sans-serif' }}>등록된 강사가 없습니다</p>
          <p style={{ color: '#78716C', fontSize: 12, fontFamily: 'Pretendard, sans-serif' }}>위 버튼을 눌러 첫 강사를 추가해보세요</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {instructors.map(inst => (
          <div key={inst.id} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, minWidth: 48, borderRadius: '50%', background: `linear-gradient(135deg,${inst.gradient_from},${inst.gradient_to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 900 }}>
              {inst.initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#1C1917', marginBottom: 2, fontFamily: 'Pretendard, sans-serif' }}>{inst.name}</p>
              <p style={{ color: '#78716C', fontSize: 11, marginBottom: 6, fontFamily: 'Pretendard, sans-serif' }}>{inst.title}</p>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {(inst.tags || []).map(t => <span key={t} style={{ background: '#fff0eb', color: '#C84B0F', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{t}</span>)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 42 }}>
              <button onClick={() => openForm(inst)} style={{ background: '#EDE8DF', color: '#C84B0F', border: 'none', padding: '5px 10px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 10 }}>수정</button>
              <button onClick={() => del(inst.id)} style={{ background: 'transparent', color: '#dc2626', border: 'none', padding: '5px 10px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 10 }}>삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 후기 관리 ──
function ReviewsManager({ toast }: { toast: (m: string) => void }) {
  const [reviews, setReviews] = useState<Testimonial[]>([])
  const [form, setForm] = useState({ name: '', affiliation: '', rating: 5, content: '', course_title: '' })
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
    if (data) setReviews(data)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name || !form.content) { alert('이름과 후기 내용을 입력해주세요'); return }
    setSaving(true)
    const { error } = await supabase.from('testimonials').insert(form)
    if (error) { alert(`저장 오류: ${error.message}`); setSaving(false); return }
    await load()
    setForm({ name: '', affiliation: '', rating: 5, content: '', course_title: '' })
    setAdding(false)
    setSaving(false)
    toast('✓ 후기가 저장되었습니다')
  }

  const del = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    const { error } = await supabase.from('testimonials').delete().eq('id', id)
    if (error) { alert(`삭제 오류: ${error.message}`); return }
    await load()
    toast('삭제되었습니다')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 3, fontFamily: 'Pretendard, sans-serif' }}>후기 관리</h2>
          <p style={{ color: '#78716C', fontSize: 12, fontFamily: 'Pretendard, sans-serif' }}>수강 후기를 추가·삭제할 수 있습니다</p>
        </div>
        <button style={btnO} onClick={() => setAdding(!adding)}>+ 후기 추가</button>
      </div>

      {adding && (
        <div style={{ ...card, marginBottom: 14, borderLeft: '3px solid #C84B0F' }}>
          <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, fontFamily: 'Pretendard, sans-serif' }}>새 후기 추가</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div><label style={lbl}>이름 *</label><input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="김○○ 선생님" /></div>
            <div><label style={lbl}>소속·직함</label><input style={inp} value={form.affiliation} onChange={e => setForm(f => ({ ...f, affiliation: e.target.value }))} placeholder="초등교사 | 강의명 수강" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={lbl}>별점</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: +e.target.value }))}>
                {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v}점 {'⭐'.repeat(v)}</option>)}
              </select>
            </div>
            <div><label style={lbl}>수강 강의</label><input style={inp} value={form.course_title} onChange={e => setForm(f => ({ ...f, course_title: e.target.value }))} placeholder="AI는 처음입니다만" /></div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={lbl}>후기 내용 *</label>
            <textarea style={{ ...inp, resize: 'none' }} rows={3} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="수강생 후기 내용을 입력하세요" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...btnO, opacity: saving ? 0.6 : 1 }} onClick={save} disabled={saving}>{saving ? '저장 중...' : '저장'}</button>
            <button style={btnG} onClick={() => setAdding(false)}>취소</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {reviews.length === 0 && !adding && (
          <div style={{ ...card, textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
            <p style={{ fontWeight: 700, color: '#1C1917', marginBottom: 4, fontFamily: 'Pretendard, sans-serif' }}>등록된 후기가 없습니다</p>
            <p style={{ color: '#78716C', fontSize: 12, fontFamily: 'Pretendard, sans-serif' }}>위 버튼을 눌러 첫 후기를 추가해보세요</p>
          </div>
        )}
        {reviews.map(r => (
          <div key={r.id} style={{ ...card, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#1C1917', fontFamily: 'Pretendard, sans-serif' }}>{r.name}</span>
                <span style={{ color: '#78716C', fontSize: 11, fontFamily: 'Pretendard, sans-serif' }}>{r.affiliation}</span>
                <span style={{ color: '#F5B730', fontSize: 11 }}>{'⭐'.repeat(r.rating)}</span>
              </div>
              <p style={{ color: '#1C1917', fontSize: 12, lineHeight: 1.6, marginBottom: 4, fontFamily: 'Pretendard, sans-serif' }}>{r.content}</p>
              {r.course_title && <p style={{ color: '#78716C', fontSize: 11, fontFamily: 'Pretendard, sans-serif' }}>강의: {r.course_title}</p>}
            </div>
            <button onClick={() => del(r.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: 'Pretendard, sans-serif' }}>삭제</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 문의 내역 ──
function ContactsManager() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filter, setFilter] = useState('전체')
  const [selected, setSelected] = useState<Contact | null>(null)

  const load = async (f: string) => {
    const q = supabase.from('contacts').select('*').order('created_at', { ascending: false })
    const { data } = f === '전체' ? await q : await q.eq('status', f)
    setContacts(data || [])
  }

  useEffect(() => { load('전체') }, [])

  const changeStatus = async (id: string, status: string) => {
    await supabase.from('contacts').update({ status }).eq('id', id)
    load(filter)
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as any } : null)
  }

  const statusColor: Record<string, { bg: string; color: string }> = {
    '미확인': { bg: '#fee2e2', color: '#dc2626' },
    '확인': { bg: '#fff0eb', color: '#C84B0F' },
    '답변완료': { bg: '#dcfce7', color: '#16a34a' },
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 3, fontFamily: 'Pretendard, sans-serif' }}>문의 내역</h2>
      <p style={{ color: '#78716C', fontSize: 12, marginBottom: 14, fontFamily: 'Pretendard, sans-serif' }}>접수된 문의를 확인하고 상태를 변경할 수 있습니다</p>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {['전체', '미확인', '확인', '답변완료'].map(f => (
          <button key={f} onClick={() => { setFilter(f); load(f) }}
            style={{ background: filter === f ? '#0B0A09' : '#EDE8DF', color: filter === f ? '#FAF7F2' : '#1C1917', border: 'none', padding: '6px 14px', borderRadius: 999, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 11 }}>
            {f}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 14 }}>
        <div style={card}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['이름', '유형', '연락처', '상태', '접수일'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '9px 10px', fontSize: 10, color: '#78716C', fontWeight: 700, borderBottom: '1px solid #EDE8DF', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'Pretendard, sans-serif' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id} onClick={() => setSelected(c)} style={{ cursor: 'pointer', background: selected?.id === c.id ? '#fff0eb' : 'transparent' }}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #EDE8DF', fontWeight: 700, fontSize: 12, fontFamily: 'Pretendard, sans-serif' }}>{c.name}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #EDE8DF', color: '#78716C', fontSize: 11 }}>{c.inquiry_type || c.type}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #EDE8DF', color: '#78716C', fontSize: 11 }}>{c.phone}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #EDE8DF' }}>
                    <span style={{ background: statusColor[c.status]?.bg, color: statusColor[c.status]?.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{c.status}</span>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #EDE8DF', color: '#78716C', fontSize: 11 }}>{new Date(c.created_at).toLocaleDateString('ko-KR')}</td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#78716C', fontSize: 13, fontFamily: 'Pretendard, sans-serif' }}>문의가 없습니다</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {selected && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700, fontSize: 14, fontFamily: 'Pretendard, sans-serif' }}>문의 상세</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C', fontSize: 18 }}>✕</button>
            </div>
            {[['이름', selected.name], ['이메일', selected.email], ['연락처', selected.phone], ['소속', selected.affiliation], ['유형', selected.inquiry_type || selected.type], ['관심 강의', selected.interested_course], ['접수일', new Date(selected.created_at).toLocaleString('ko-KR')]].map(([k, v]) => v ? (
              <div key={k} style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: '#78716C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'Pretendard, sans-serif' }}>{k}</span>
                <p style={{ fontSize: 12, color: '#1C1917', marginTop: 2, fontFamily: 'Pretendard, sans-serif' }}>{v}</p>
              </div>
            ) : null)}
            <div style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 10, color: '#78716C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'Pretendard, sans-serif' }}>문의 내용</span>
              <p style={{ fontSize: 12, color: '#1C1917', marginTop: 4, lineHeight: 1.7, background: '#EDE8DF', borderRadius: 8, padding: '10px 12px', fontFamily: 'Pretendard, sans-serif' }}>{selected.message}</p>
            </div>
            <div>
              <label style={lbl}>상태 변경</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['미확인', '확인', '답변완료'].map(s => (
                  <button key={s} onClick={() => changeStatus(selected.id, s)}
                    style={{ flex: 1, background: selected.status === s ? '#C84B0F' : '#EDE8DF', color: selected.status === s ? '#FAF7F2' : '#1C1917', border: 'none', padding: '8px', borderRadius: 8, cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontWeight: 700, fontSize: 11 }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 사이트 설정 ──
function SettingsManager({ toast }: { toast: (m: string) => void }) {
  const [config, setConfig] = useState<Partial<SiteConfig>>(fallbackSiteConfig)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('site_config').select('*').single().then(({ data }) => { if (data) setConfig(data) })
  }, [])

  const save = async () => {
    setSaving(true)
    const payload = {
      naver_cafe_url: config.naver_cafe_url || '',
      kakao_channel_url: config.kakao_channel_url || '',
      phone: config.phone || '',
      email: config.email || '',
      address: config.address || '',
      business_number: config.business_number || '',
      ceo_name: config.ceo_name || '',
      operating_hours: config.operating_hours || '',
    }
    const { data: existing } = await supabase.from('site_config').select('id').single()
    let err
    if (existing) {
      const { error } = await supabase.from('site_config').update(payload).eq('id', existing.id)
      err = error
    } else {
      const { error } = await supabase.from('site_config').insert(payload)
      err = error
    }
    if (err) { alert(`저장 오류: ${err.message}`); setSaving(false); return }
    setSaving(false)
    toast('✓ 설정이 저장되었습니다! 홈페이지에 반영되었습니다.')
  }

  const fields: [string, keyof SiteConfig, string, string?][] = [
    ['네이버 카페 URL ⭐', 'naver_cafe_url', 'https://cafe.naver.com/kacca', '모든 카페 버튼에 즉시 반영됩니다'],
    ['카카오 채널 URL', 'kakao_channel_url', 'https://pf.kakao.com/...'],
    ['대표 전화번호', 'phone', '000-0000-0000'],
    ['이메일', 'email', 'info@kacca.or.kr'],
    ['주소', 'address', '협회 주소를 입력해주세요'],
    ['사업자등록번호', 'business_number', 'XXX-XX-XXXXX'],
    ['대표자명', 'ceo_name', 'OOO'],
    ['운영 시간', 'operating_hours', '평일 09:00 ~ 18:00'],
  ]

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 3, fontFamily: 'Pretendard, sans-serif' }}>사이트 설정</h2>
      <p style={{ color: '#78716C', fontSize: 12, marginBottom: 16, fontFamily: 'Pretendard, sans-serif' }}>저장 즉시 홈페이지에 반영됩니다</p>
      <div style={{ ...card, maxWidth: 520 }}>
        <div style={{ background: '#fff0eb', border: '1px solid #C84B0F', borderRadius: 8, padding: '9px 13px', marginBottom: 16 }}>
          <p style={{ color: '#C84B0F', fontSize: 11, fontWeight: 700, fontFamily: 'Pretendard, sans-serif' }}>⭐ 네이버 카페 URL을 저장하면 홈페이지 모든 카페 버튼에 즉시 반영됩니다</p>
        </div>
        {fields.map(([label, key, placeholder, hint]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={lbl}>{label}</label>
            {hint && <p style={{ fontSize: 10, color: '#C84B0F', marginBottom: 4, fontFamily: 'Pretendard, sans-serif' }}>{hint}</p>}
            <input style={inp} value={(config as any)[key] || ''} onChange={e => setConfig(c => ({ ...c, [key]: e.target.value }))} placeholder={placeholder} />
          </div>
        ))}
        <button style={{ ...btnO, padding: '10px 22px', fontSize: 13, marginTop: 4, opacity: saving ? 0.6 : 1 }} onClick={save} disabled={saving}>
          {saving ? '저장 중...' : '설정 저장하기'}
        </button>
      </div>
    </div>
  )
}

// ── 메인 관리자 ──
type Tab = 'dashboard' | 'programs' | 'instructors' | 'reviews' | 'contacts' | 'settings'

export default function AdminPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [toastMsg, setToastMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500) }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EDE8DF', fontFamily: 'Pretendard, sans-serif', color: '#78716C' }}>로딩 중...</div>
  if (!session) return <LoginPage onLogin={() => supabase.auth.getSession().then(({ data }) => setSession(data.session))} />

  const menuItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'dashboard', icon: '🏠', label: '대시보드' },
    { id: 'programs', icon: '📚', label: '강의 관리' },
    { id: 'instructors', icon: '👨‍🏫', label: '강사 관리' },
    { id: 'reviews', icon: '💬', label: '후기 관리' },
    { id: 'contacts', icon: '📩', label: '문의 내역' },
    { id: 'settings', icon: '⚙️', label: '사이트 설정' },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{ width: 200, minWidth: 200, background: '#0B0A09', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ padding: '16px 14px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#C84B0F', fontSize: 16 }}>🤖</span>
          <span style={{ color: '#FAF7F2', fontWeight: 700, fontSize: 13, fontFamily: 'Pretendard, sans-serif' }}>KACCA 관리자</span>
        </div>
        <div style={{ padding: '8px 14px', fontSize: 11, color: 'rgba(250,247,242,.35)', borderBottom: '1px solid rgba(255,255,255,.06)', fontFamily: 'Pretendard, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {session?.user?.email}
        </div>
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {menuItems.map(m => (
            <button key={m.id} onClick={() => setTab(m.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', border: 'none', background: tab === m.id ? '#C84B0F' : 'transparent', color: tab === m.id ? '#FAF7F2' : 'rgba(250,247,242,.5)', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: 12, borderRadius: 8, marginBottom: 2, textAlign: 'left', transition: 'background .15s' }}>
              <span style={{ fontSize: 15 }}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: 8, borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <button onClick={() => navigate('/')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', border: 'none', background: 'transparent', color: 'rgba(250,247,242,.5)', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: 12, borderRadius: 8, marginBottom: 2, textAlign: 'left' }}>
            <span style={{ fontSize: 14 }}>🌐</span> 홈페이지 보기
          </button>
          <button onClick={() => supabase.auth.signOut()} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', border: 'none', background: 'transparent', color: 'rgba(250,247,242,.5)', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: 12, borderRadius: 8, textAlign: 'left' }}>
            <span style={{ fontSize: 14 }}>🚪</span> 로그아웃
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, overflowY: 'auto', padding: 22, background: '#EDE8DF' }}>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'programs' && <ProgramsManager toast={showToast} />}
        {tab === 'instructors' && <InstructorsManager toast={showToast} />}
        {tab === 'reviews' && <ReviewsManager toast={showToast} />}
        {tab === 'contacts' && <ContactsManager />}
        {tab === 'settings' && <SettingsManager toast={showToast} />}
      </main>
      <Toast msg={toastMsg} />
    </div>
  )
}
