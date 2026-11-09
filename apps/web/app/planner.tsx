'use client';

import { useRef, useState, type FormEvent } from 'react';
import { demo, type Lecture, type Session } from '@mini-otl/contracts';
import { request, useApi } from './api-client';
import { days, timeLabel, WeekGrid } from './week-grid';

function ApiError({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="notice" role="status">
      <span>{message}</span>
      {retry && <button type="button" className="text-button" onClick={retry}>다시 시도</button>}
    </div>
  );
}

export function Planner() {
  const [session, setSession] = useState<Session>();
  const dialog = useRef<HTMLDialogElement>(null);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  function openLogin() {
    setLoginError('');
    dialog.current?.showModal();
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoggingIn(true);
    setLoginError('');
    try {
      const nextSession = await request<Session>('auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: form.get('username'), password: form.get('password') }),
      });
      setSession(nextSession);
      dialog.current?.close();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    } finally {
      setLoggingIn(false);
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="/" aria-label="Mini OTL 홈"><span className="brand-mark" aria-hidden="true">◷</span> Mini OTL</a>
          {session ? (
            <div className="account">
              <span>{session.user.name}</span>
              <button className="button" onClick={() => setSession(undefined)}>로그아웃</button>
            </div>
          ) : <button className="button" onClick={openLogin}>로그인</button>}
        </div>
      </header>
      <main>
        <div className="page-heading">
          <div>
            <p className="eyebrow">SPARCS SEMINAR</p>
            <h1>시간표 만들기</h1>
            <p className="subtitle">개설강의를 찾아 내 주간 시간표에 담아보세요.</p>
          </div>
          <span className="term">2026 가을학기</span>
        </div>
        <Workspace session={session} openLogin={openLogin} />
        <footer>Mini OTL · SPARCS 세미나 실습</footer>
      </main>
      <dialog ref={dialog} aria-labelledby="login-heading">
        <form className="login-form" onSubmit={login}>
          <div className="login-heading">
            <h2 id="login-heading">실습 계정 로그인</h2>
            <button type="button" className="text-button" aria-label="닫기" onClick={() => dialog.current?.close()}>닫기</button>
          </div>
          <p>초기 데이터에 포함된 실습 계정입니다.</p>
          <label>아이디<input name="username" autoComplete="username" defaultValue={demo.username} required /></label>
          <label>비밀번호<input name="password" type="password" autoComplete="current-password" defaultValue={demo.password} required /></label>
          {loginError && <ApiError message={loginError} />}
          <button className="button primary" disabled={loggingIn}>{loggingIn ? '로그인 중…' : '로그인'}</button>
        </form>
      </dialog>
    </>
  );
}

function Workspace({ session, openLogin }: { session?: Session; openLogin: () => void }) {
  const catalog = useApi<Lecture[]>('lectures');
  const [query, setQuery] = useState('');
  const [timetableRevision, setTimetableRevision] = useState(0);
  const [busy, setBusy] = useState(false);
  const [addError, setAddError] = useState('');
  const search = query.trim().toLowerCase();
  const lectures = catalog.data?.filter((lecture) =>
    [lecture.code, lecture.title, lecture.titleEn, lecture.department, lecture.professor]
      .some((field) => field.toLowerCase().includes(search)),
  );

  async function addLecture(id: number) {
    if (!session) {
      openLogin();
      return;
    }
    setBusy(true);
    setAddError('');
    try {
      await request<void>(`timetable/lectures/${id}`, { method: 'POST', token: session.accessToken });
      setTimetableRevision((revision) => revision + 1);
    } catch (error) {
      setAddError(error instanceof Error ? error.message : '강의를 담지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="workspace">
      <section className="panel" aria-labelledby="catalog-heading">
        <div className="panel-heading">
          <h2 id="catalog-heading">개설강의</h2>
          {lectures && <span className="count">{lectures.length}개</span>}
        </div>
        <div className="catalog">
          <label className="search">
            <span aria-hidden="true">⌕</span>
            <input type="search" aria-label="개설강의 검색" placeholder="과목명, 과목 코드, 교수 검색" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          {catalog.error && <ApiError message={catalog.error} retry={catalog.refresh} />}
          {addError && <ApiError message={addError} />}
          {!lectures && !catalog.error && <p className="empty">개설강의를 불러오는 중…</p>}
          {lectures?.length === 0 && <p className="empty">검색 결과가 없습니다.</p>}
          <ul className="lecture-list">
            {lectures?.map((lecture) => (
              <li key={lecture.id}>
                <div>
                  <span className="course-code">{lecture.code} · {lecture.classNo}분반</span>
                  <h3>{lecture.title}</h3>
                  <p>{lecture.department} · {lecture.professor} · {lecture.credit}학점</p>
                  <p className="lecture-time">{lecture.classes.map(({ day, begin }) => `${days[day]} ${timeLabel(begin)}`).join(' · ') || '수업 시간 미정'}</p>
                </div>
                <button className="button add" disabled={busy} aria-label={`${lecture.title} 담기`} onClick={() => void addLecture(lecture.id)}>+ 담기</button>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="panel" aria-labelledby="timetable-heading">
        <div className="panel-heading">
          <h2 id="timetable-heading">내 시간표</h2>
          {session && <span className="count">{session.user.name}</span>}
        </div>
        {session ? <MyTimetable key={session.accessToken} token={session.accessToken} revision={timetableRevision} /> : (
          <div className="timetable">
            <div className="guest">
              <p>로그인하면 시간표에 강의를 담을 수 있습니다.</p>
              <button className="button primary" onClick={openLogin}>실습 계정으로 로그인</button>
            </div>
            <WeekGrid lectures={[]} />
          </div>
        )}
      </section>
    </div>
  );
}

function MyTimetable({ token, revision }: { token: string; revision: number }) {
  const timetable = useApi<Lecture[]>('timetable', token, revision);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');

  async function removeLecture(id: number) {
    setRemoving(true);
    setRemoveError('');
    try {
      await request<void>(`timetable/lectures/${id}`, { method: 'DELETE', token });
      timetable.refresh();
    } catch (error) {
      setRemoveError(error instanceof Error ? error.message : '강의를 빼지 못했습니다.');
    } finally {
      setRemoving(false);
    }
  }

  const lectures = timetable.data ?? [];
  return (
    <div className="timetable">
      {timetable.error && <ApiError message={timetable.error} retry={timetable.refresh} />}
      {removeError && <ApiError message={removeError} />}
      {!timetable.data && !timetable.error && <p className="empty">시간표를 불러오는 중…</p>}
      <WeekGrid lectures={lectures} />
      {timetable.data && lectures.length === 0 && <p className="empty">아직 담은 강의가 없습니다.</p>}
      {lectures.length > 0 && (
        <ul className="saved-list">
          {lectures.map(({ id, code, title }) => (
            <li key={id}>
              <span><span className="course-code">{code}</span> {title}</span>
              <button className="text-button" disabled={removing} aria-label={`${title} 빼기`} onClick={() => void removeLecture(id)}>빼기</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
