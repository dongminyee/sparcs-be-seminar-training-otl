-- 1006 overlaps with 1001 on Monday. 1007 starts when 1001 ends on Wednesday.
INSERT INTO `Lecture` (`id`, `code`, `classNo`, `title`, `titleEn`, `department`, `professor`, `credit`, `year`, `semester`) VALUES
  (1006, 'CS.20401', 'A', '자료구조 실습', 'Data Structures Lab', '전산학부', '이서준', 1, 2026, 3),
  (1007, 'CS.20402', 'A', '자료구조 세미나', 'Data Structures Seminar', '전산학부', '이서준', 1, 2026, 3);

INSERT INTO `ClassTime` (`lectureId`, `day`, `begin`, `end`, `room`) VALUES
  (1006, 0, 570, 645, 'E3 1102'),
  (1007, 2, 615, 660, 'E3 1102');
