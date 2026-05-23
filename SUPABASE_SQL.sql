-- ============================================
-- 한국AI창의융합협회(KACCA) Supabase SQL
-- Supabase Dashboard > SQL Editor에서 실행
-- ============================================

create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  title text not null,
  category text not null default 'AI 기초',
  emoji text default '🎓',
  gradient_from text default '#C84B0F',
  gradient_to text default '#F5B730',
  instructor_name text default '',
  sessions integer default 4,
  hours integer default 8,
  format text default '오프라인',
  target text default '일반인',
  fee text default '문의',
  status text default '준비중',
  detail_url text default '',
  recommendations text[] default '{}',
  goals text[] default '{}',
  curriculum jsonb default '[]',
  is_featured boolean default true,
  "order" integer default 1
);

create table if not exists instructors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  title text default '',
  initial text default '',
  gradient_from text default '#C84B0F',
  gradient_to text default '#F5B730',
  tags text[] default '{}',
  intro text default '',
  bio text default '',
  career text[] default '{}',
  certifications text[] default '{}',
  course_ids text[] default '{}',
  "order" integer default 1
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  affiliation text default '',
  rating integer default 5,
  content text not null,
  course_title text default ''
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  type text default 'email',
  name text not null,
  phone text default '',
  email text not null,
  affiliation text default '',
  interested_course text default '',
  inquiry_type text default '',
  message text not null,
  status text default '미확인'
);

create table if not exists site_config (
  id uuid primary key default gen_random_uuid(),
  naver_cafe_url text default '#',
  kakao_channel_url text default '#',
  phone text default '000-0000-0000',
  email text default 'info@kacca.or.kr',
  address text default '주소를 입력해주세요',
  business_number text default 'XXX-XX-XXXXX',
  ceo_name text default 'OOO',
  operating_hours text default '평일 09:00 ~ 18:00'
);

insert into site_config (naver_cafe_url, kakao_channel_url, phone, email)
values ('#', '#', '000-0000-0000', 'info@kacca.or.kr')
on conflict do nothing;

-- RLS
alter table programs enable row level security;
alter table instructors enable row level security;
alter table testimonials enable row level security;
alter table contacts enable row level security;
alter table site_config enable row level security;

create policy "programs_read" on programs for select using (true);
create policy "programs_write" on programs for all using (auth.uid() is not null);
create policy "instructors_read" on instructors for select using (true);
create policy "instructors_write" on instructors for all using (auth.uid() is not null);
create policy "testimonials_read" on testimonials for select using (true);
create policy "testimonials_write" on testimonials for all using (auth.uid() is not null);
create policy "contacts_insert" on contacts for insert with check (true);
create policy "contacts_read" on contacts for select using (auth.uid() is not null);
create policy "contacts_update" on contacts for update using (auth.uid() is not null);
create policy "config_read" on site_config for select using (true);
create policy "config_write" on site_config for all using (auth.uid() is not null);
