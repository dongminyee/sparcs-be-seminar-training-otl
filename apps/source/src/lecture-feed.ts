import type { Lecture } from '@mini-otl/contracts';

export const retireLectureId = 2001;

export const lectureFeed: Lecture[] = [
  {
    id: retireLectureId,
    code: 'CS.40300',
    classNo: 'A',
    title: '분산시스템 특강',
    titleEn: 'Topics in Distributed Systems',
    department: '전산학부',
    professor: '박세미',
    credit: 3,
    year: 2026,
    semester: 3,
    classes: [
      { day: 1, begin: 810, end: 885, room: 'N1 112' },
      { day: 3, begin: 810, end: 885, room: 'N1 112' },
    ],
  },
  {
    id: 2002,
    code: 'CS.32000',
    classNo: 'B',
    title: '프로그래밍 언어',
    titleEn: 'Programming Languages',
    department: '전산학부',
    professor: '최현우',
    credit: 3,
    year: 2026,
    semester: 3,
    classes: [
      { day: 0, begin: 660, end: 735, room: 'E3 1101' },
      { day: 2, begin: 660, end: 735, room: 'E3 1101' },
    ],
  },
  {
    id: 2003,
    code: 'CS.31000',
    classNo: 'A',
    title: '알고리즘 설계',
    titleEn: 'Algorithm Design',
    department: '전산학부',
    professor: '한유진',
    credit: 3,
    year: 2026,
    semester: 3,
    classes: [
      { day: 0, begin: 690, end: 765, room: 'E3 1201' },
      { day: 4, begin: 780, end: 855, room: 'E3 1201' },
    ],
  },
  {
    id: 2004,
    code: 'MAS.35000',
    classNo: 'A',
    title: '응용확률론',
    titleEn: 'Applied Probability',
    department: '수리과학과',
    professor: '윤재민',
    credit: 3,
    year: 2026,
    semester: 3,
    classes: [
      { day: 2, begin: 630, end: 705, room: 'E6 2210' },
      { day: 4, begin: 870, end: 945, room: 'E6 2210' },
    ],
  },
];
