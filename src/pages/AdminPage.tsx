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
                <td style={{ padding: '10px', borderBottom: '1px solid #EDE8DF', fontWeight: 700, fontSize: 12, fontFamily: 'Pretendard, sans-serif' }}>{c.name}</td>
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

// ── 강의 관리 (간략화) ──
function ProgramsManager({ toast }: { toast: (m: string) => void }) {
  const [programs, setPrograms] = useState<Program[]>(fallbackPrograms)
  const [editing, setEditing] = useState<Partial<Program> | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [recs, setRecs] = useState<string[]>([])
  const [goals, setGoals] = useState<string[]>([])
  const [cur, setCur] = useState<{ title: string; content: string }[]>([])

  useEffect(() => {
    supabase.from('programs').select('*').order('order').then(({ data }) => { if (data && data.length > 0) setPrograms(data) })
  }, [])

  const openForm = (p: Program | null) => {
    if (p) {
      setEditing(p)
      setRecs(p.recommendations || [])
      setGoals(p.goals || [])
      setCur((p.curriculum || []).map(c => ({ title: c.title, content: c.content })))
    } else {
      setEditing({})
      setRecs([]); setGoals([]); setCur([])
    }
    setActiveTab('basic')
  }

  const save = async () => {
    if (!editing) return
    const data = { ...editing, recommendations: recs.filter(Boolean), goals: goals.filter(Boolean), curriculum: cur.filter(c => c.title).map((c, i) => ({ week: i + 1, ...c })) }
    if (editing.id) {
      await supabase.from('programs').update(data).eq('id', editing.id)
      toast('✓ 강의가 수정되었습니다')
    } else {
      await supabase.from('programs').insert({ ...data, order: programs.length + 1 })
      toast('✓ 강의가 추가되었습니다')
    }
    const { data: updated } = await supabase.from('programs').select('*').order('order')
    if (updated) setPrograms(updated)
    setEditing(null)
  }

  const del = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('programs').delete().eq('id', id)
    setPrograms(p => p.filter(x => x.id !== id))
    toast('삭제되었습니다')
  }

  const tabs = [{ id: 'basic', label: '📋 기본 정보' }, { id: 'recs', label: '✅ 추천 대상' }, { id: 'goals', label: '🎯 강의 목표' }, { id: 'cur', label: '📚 커리큘럼' }, { id: 'link', label: '🔗 상세 링크' }]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div><h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 3, fontFamily: 'Pretendard, sans-serif' }}>강의 관리</h2><p style={{ color: '#78716C', fontSize: 12 }}>강의를 추가·수정·삭제할 수 있습니다</p></div>
        <button style={btnO} onClick={() => openForm(null)}>+ 새 강의 추가</button>
      </div>

      {editing !== null && (
        <div style={{ ...card, marginBottom: 14, borderLeft: '3px solid #C84B0F' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 13, fontFamily: 'Pretendard, sans-serif' }}>{editing.id ? `강의 수정 — ${editing.title}` : '새 강의 추가'}</span>
            <button style={{ ...btnG, fontSize: 11, padding: '5px 12px' }} onClick={() => setEditing(null)}>✕ 닫기</button>
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid #EDE8DF' }}>
            {tabs.map(t => <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 700, color: activeTab === t.id ? '#C84B0F' : '#78716C', borderBottom: activeTab === t.id ? '2px solid #C84B0F' : '2px solid transparent', marginBottom: -2 }}>{t.label}</button>)}
          </div>

          {activeTab === 'basic' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div><label style={lbl}>강의명 *</label><input style={inp} value={editing.title || ''} onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} placeholder="강의명" /></div>
                <div><label style={lbl}>카테고리</label><select style={{ ...inp, cursor: 'pointer' }} value={editing.category || ''} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))}><option value="">선택</option>{['AI 기초','생성형 AI','AI 리터러시','AI 활용','기업 교육'].map(c => <option key={c}>{c}</option>)}</select></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div><label style={lbl}>담당 강사</label><input style={inp} value={editing.instructor_name || ''} onChange={e => setEditing(p => ({ ...p, instructor_name: e.target.value }))} /></div>
                <div><label style={lbl}>수강료</label><input style={inp} value={editing.fee || ''} onChange={e => setEditing(p => ({ ...p, fee: e.target.value }))} placeholder="120,000원" /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div><label style={lbl}>회차</label><input type="number" style={inp} value={editing.sessions || ''} onChange={e => setEditing(p => ({ ...p, sessions: +e.target.value }))} /></div>
                <div><label style={lbl}>진행 방식</label><select style={{ ...inp, cursor: 'pointer' }} value={editing.format || ''} onChange={e => setEditing(p => ({ ...p, format: e.target.value }))}><option value="">선택</option>{['온라인','오프라인','혼합'].map(f => <option key={f}>{f}</option>)}</select></div>
                <div><label style={lbl}>모집 상태</label><select style={{ ...inp, cursor: 'pointer' }} value={editing.status || ''} onChange={e => setEditing(p => ({ ...p, status: e.target.value as any }))}><option value="">선택</option>{['모집중','준비중','마감임박','마감'].map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div><label style={lbl}>수강 대상</label><input style={inp} value={editing.target || ''} onChange={e => setEditing(p => ({ ...p, target: e.target.value }))} placeholder="일반인·교사" /></div>
            </div>
          )}

          {activeTab === 'recs' && (
            <div>
              <p style={{ color: '#78716C', fontSize: 11, marginBottom: 12, fontFamily: 'Pretendard, sans-serif' }}>수강을 추천하는 대상을 입력하세요.</p>
              {recs.map((r, i) => <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}><input style={{ ...inp, flex: 1 }} value={r} onChange={e => setRecs(arr => arr.map((x, j) => j === i ? e.target.value : x))} placeholder={`항목 ${i + 1}`} /><button onClick={() => setRecs(arr => arr.filter((_, j) => j !== i))} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>×</button></div>)}
              <button onClick={() => setRecs(arr => [...arr, ''])} style={{ width: '100%', background: 'none', border: '1.5px dashed #C84B0F', color: '#C84B0F', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 700, marginTop: 4 }}>+ 추천 항목 추가</button>
            </div>
          )}

          {activeTab === 'goals' && (
            <div>
              <p style={{ color: '#78716C', fontSize: 11, marginBottom: 12, fontFamily: 'Pretendard, sans-serif' }}>수강 후 달성할 목표를 입력하세요.</p>
              {goals.map((g, i) => <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}><input style={{ ...inp, flex: 1 }} value={g} onChange={e => setGoals(arr => arr.map((x, j) => j === i ? e.target.value : x))} placeholder={`목표 ${i + 1}`} /><button onClick={() => setGoals(arr => arr.filter((_, j) => j !== i))} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>×</button></div>)}
              <button onClick={() => setGoals(arr => [...arr, ''])} style={{ width: '100%', background: 'none', border: '1.5px dashed #C84B0F', color: '#C84B0F', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 700, marginTop: 4 }}>+ 목표 항목 추가</button>
            </div>
          )}

          {activeTab === 'cur' && (
            <div>
              <p style={{ color: '#78716C', fontSize: 11, marginBottom: 12, fontFamily: 'Pretendard, sans-serif' }}>회차별 강의 내용을 입력하세요.</p>
              {cur.map((c, i) => (
                <div key={i} style={{ background: '#EDE8DF', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#C84B0F', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{i + 1}</span>
                    <input style={{ ...inp, flex: 1, background: '#FAF7F2' }} value={c.title} onChange={e => setCur(arr => arr.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} placeholder="회차 제목" />
                    <button onClick={() => setCur(arr => arr.filter((_, j) => j !== i))} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>×</button>
                  </div>
                  <textarea style={{ ...inp, background: '#FAF7F2', resize: 'none' }} rows={2} value={c.content} onChange={e => setCur(arr => arr.map((x, j) => j === i ? { ...x, content: e.target.value } : x))} placeholder="내용" />
                </div>
              ))}
              <button onClick={() => setCur(arr => [...arr, { title: '', content: '' }])} style={{ width: '100%', background: 'none', border: '1.5px dashed #C84B0F', color: '#C84B0F', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: 12, fontWeight: 700, marginTop: 4 }}>+ 회차 추가</button>
            </div>
          )}

          {activeTab === 'link' && (
            <div>
              <div style={{ background: '#fff0eb', border: '1px solid #C84B0F', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                <p style={{ color: '#C84B0F', fontSize: 12, fontWeight: 700, marginBottom: 4, fontFamily: 'Pretendard, sans-serif' }}>🔗 상세 페이지 링크란?</p>
                <p style={{ color: '#78716C', fontSize: 11, lineHeight: 1.6, fontFamily: 'Pretendard, sans-serif' }}>모달 하단에 "전체 상세 보기 ↗" 버튼이 생깁니다. Notion, 네이버 블로그, 구글 문서 등 어떤 URL이든 가능합니다.</p>
              </div>
              <label style={lbl}>상세 페이지 URL</label>
              <input style={{ ...inp, border: '1.5px solid #C84B0F' }} value={editing.detail_url || ''} onChange={e => setEditing(p => ({ ...p, detail_url: e.target.value }))} placeholder="https://notion.so/... 또는 https://blog.naver.com/..." />
              <p style={{ fontSize: 10, color: '#78716C', marginTop: 4, fontFamily: 'Pretendard, sans-serif' }}>URL을 입력하지 않으면 버튼이 비활성화 상태로 표시됩니다.</p>
            </div>
          )}

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #EDE8DF', display: 'flex', gap: 8 }}>
            <button style={btnO} onClick={save}>저장하기</button>
            <button style={btnG} onClick={() => setEditing(null)}>취소</button>
          </div>
        </div>
      )}

      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['강의명','카테고리','강사','상태','수강료','상세링크','관리'].map(h => <th key={h} style={{ textAlign: 'left', padding: '9px 10px', fontSize: 10, color: '#78716C', fontWeight: 700, borderBottom: '1px solid #EDE8DF', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'Pretendard, sans-serif' }}>{h}</th>)}</tr></thead>
          <tbody>
            {programs.map(p => (
              <tr key={p.id}>
                <td style={{ padding: 10, borderBottom: '1px solid #EDE8DF', fontWeight: 700, fontSize: 12, fontFamily: 'Pretendard, sans-serif' }}>{p.emoji} {p.title}</td>
                <td style={{ padding: 10, borderBottom: '1px solid #EDE8DF' }}><span style={{ background: '#fff0eb', color: '#C84B0F', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{p.category}</span></td>
                <td style={{ padding: 10, borderBottom: '1px solid #EDE8DF', color: '#78716C', fontSize: 12 }}>{p.instructor_name}</td>
                <td style={{ padding: 10, borderBottom: '1px solid #EDE8DF' }}><span style={{ background: p.status === '모집중' ? '#dcfce7' : '#f1f5f9', color: p.status === '모집중' ? '#16a34a' : '#64748b', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>{p.status}</span></td>
                <td style={{ padding: 10, borderBottom: '1px solid #EDE8DF', color: '#C84B0F', fontWeight: 700, fontSize: 12 }}>{p.fee}</td>
                <td style={{ padding: 10, borderBottom: '1px solid #EDE8DF' }}>{p.detail_url ? <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>✓ 있음</span> : <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>미설정</span>}</td>
                <td style={{ padding: 10, borderBottom: '1px solid #EDE8DF', whiteSpace: 'nowrap' }}>
                  <button onClick={() => openForm(p)} style={{ color: '#C84B0F', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'Pretendard, sans-serif' }}>수정</button>{' '}
                  <button onClick={() => del(p.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'Pretendard, sans-serif' }}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── 사이트 설정 ──
function SettingsManager({ toast }: { toast: (m: string) => void }) {
  const [config, setConfig] = useState<Partial<SiteConfig>>(fallbackSiteConfig)

  useEffect(() => {
    supabase.from('site_config').select('*').single().then(({ data }) => { if (data) setConfig(data) })
  }, [])

  const save = async () => {
    const { data } = await supabase.from('site_config').select('id').single()
    if (data) await supabase.from('site_config').update(config).eq('id', data.id)
    else await supabase.from('site_config').insert(config)
    toast('✓ 설정이 저장되었습니다!')
  }

  const fields: [string, keyof SiteConfig, string][] = [
    ['네이버 카페 URL ⭐', 'naver_cafe_url', 'https://cafe.naver.com/kacca'],
    ['카카오 채널 URL', 'kakao_channel_url', 'https://pf.kakao.com/...'],
    ['대표 전화번호', 'phone', ''],
    ['이메일', 'email', ''],
    ['주소', 'address', ''],
    ['사업자등록번호', 'business_number', ''],
    ['대표자명', 'ceo_name', ''],
    ['운영 시간', 'operating_hours', ''],
  ]

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 3, fontFamily: 'Pretendard, sans-serif' }}>사이트 설정</h2>
      <p style={{ color: '#78716C', fontSize: 12, marginBottom: 16 }}>저장 즉시 홈페이지에 반영됩니다</p>
      <div style={{ ...card, maxWidth: 520 }}>
        <div style={{ background: '#fff0eb', border: '1px solid #C84B0F', borderRadius: 8, padding: '9px 13px', marginBottom: 16 }}>
          <p style={{ color: '#C84B0F', fontSize: 11, fontWeight: 700, fontFamily: 'Pretendard, sans-serif' }}>⭐ 네이버 카페 URL을 저장하면 홈페이지 모든 카페 버튼에 즉시 반영됩니다</p>
        </div>
        {fields.map(([label, key, placeholder]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label style={lbl}>{label}</label>
            <input style={inp} value={(config as any)[key] || ''} onChange={e => setConfig(c => ({ ...c, [key]: e.target.value }))} placeholder={placeholder} />
          </div>
        ))}
        <button style={{ ...btnO, padding: '10px 22px', fontSize: 13, marginTop: 4 }} onClick={save}>설정 저장하기</button>
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

  const menuItems: { id: Tab; icon: string; label: string; badge?: number }[] = [
    { id: 'dashboard', icon: '🏠', label: '대시보드' },
    { id: 'programs', icon: '📚', label: '강의 관리' },
    { id: 'instructors', icon: '👨‍🏫', label: '강사 관리' },
    { id: 'reviews', icon: '💬', label: '후기 관리' },
    { id: 'contacts', icon: '📩', label: '문의 내역' },
    { id: 'settings', icon: '⚙️', label: '사이트 설정' },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* 사이드바 */}
      <aside style={{ width: 200, minWidth: 200, background: '#0B0A09', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div style={{ padding: '16px 14px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#C84B0F', fontSize: 16 }}>🤖</span>
          <span style={{ color: '#FAF7F2', fontWeight: 700, fontSize: 13, fontFamily: 'Pretendard, sans-serif' }}>KACCA 관리자</span>
        </div>
        <div style={{ padding: '8px 14px', fontSize: 11, color: 'rgba(250,247,242,.35)', borderBottom: '1px solid rgba(255,255,255,.06)', fontFamily: 'Pretendard, sans-serif' }}>
          {session?.user?.email}
        </div>
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          {menuItems.map(m => (
            <button key={m.id} onClick={() => setTab(m.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', border: 'none', background: tab === m.id ? '#C84B0F' : 'transparent', color: tab === m.id ? '#FAF7F2' : 'rgba(250,247,242,.5)', cursor: 'pointer', fontFamily: 'Pretendard, sans-serif', fontSize: 12, borderRadius: 8, marginBottom: 2, textAlign: 'left', transition: 'background .15s' }}>
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

      {/* 메인 */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 22, background: '#EDE8DF' }}>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'programs' && <ProgramsManager toast={showToast} />}
        {tab === 'settings' && <SettingsManager toast={showToast} />}
        {tab === 'instructors' && <div style={{ ...card }}><h2 style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 900, marginBottom: 8 }}>강사 관리</h2><p style={{ color: '#78716C', fontFamily: 'Pretendard, sans-serif' }}>ProgramsManager와 동일한 패턴으로 Supabase instructors 컬렉션과 연동해 구현하세요.</p></div>}
        {tab === 'reviews' && <div style={{ ...card }}><h2 style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 900, marginBottom: 8 }}>후기 관리</h2><p style={{ color: '#78716C', fontFamily: 'Pretendard, sans-serif' }}>ProgramsManager와 동일한 패턴으로 Supabase testimonials 컬렉션과 연동해 구현하세요.</p></div>}
        {tab === 'contacts' && <div style={{ ...card }}><h2 style={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 900, marginBottom: 8 }}>문의 내역</h2><p style={{ color: '#78716C', fontFamily: 'Pretendard, sans-serif' }}>Supabase contacts 컬렉션에서 읽기 전용으로 조회하세요.</p></div>}
      </main>

      <Toast msg={toastMsg} />
    </div>
  )
}
