-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(32) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `passwordHash` VARCHAR(60) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lecture` (
    `id` INTEGER NOT NULL,
    `code` VARCHAR(16) NOT NULL,
    `classNo` VARCHAR(4) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `titleEn` VARCHAR(150) NOT NULL,
    `department` VARCHAR(50) NOT NULL,
    `professor` VARCHAR(50) NOT NULL,
    `credit` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `semester` INTEGER NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassTime` (
    `lectureId` INTEGER NOT NULL,
    `day` INTEGER NOT NULL,
    `begin` INTEGER NOT NULL,
    `end` INTEGER NOT NULL,
    `room` VARCHAR(64) NOT NULL,

    PRIMARY KEY (`lectureId`, `day`, `begin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClassTime` ADD CONSTRAINT `ClassTime_lectureId_fkey` FOREIGN KEY (`lectureId`) REFERENCES `Lecture`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


-- Local seminar account: student / mini-otl-2026
INSERT INTO `User` (`id`, `username`, `name`, `passwordHash`)
VALUES (1, 'student', '김스팍스', '$2b$10$SltYJMaB/HD5jNcz0qCMb.jPeG4Vl8gtjHd9gDm.fE9kUO8h1iXlG');

-- Fictional 2026 fall lecture offerings.
INSERT INTO `Lecture` (`id`, `code`, `classNo`, `title`, `titleEn`, `department`, `professor`, `credit`, `year`, `semester`) VALUES
  (1001, 'CS.20400', 'A', '자료구조', 'Data Structures', '전산학부', '이서준', 3, 2026, 3),
  (1002, 'CS.23000', 'B', '시스템 프로그래밍', 'Systems Programming', '전산학부', '김하늘', 3, 2026, 3),
  (1003, 'MAS.10900', 'A', '선형대수학개론', 'Introduction to Linear Algebra', '수리과학과', '정지우', 3, 2026, 3),
  (1004, 'HSS.16000', 'C', '과학기술과 사회', 'Science, Technology and Society', '인문사회과학부', '윤가람', 3, 2026, 3),
  (1005, 'EE.20200', 'A', '신호 및 시스템', 'Signals and Systems', '전기및전자공학부', '한지민', 3, 2026, 3);

INSERT INTO `ClassTime` (`lectureId`, `day`, `begin`, `end`, `room`) VALUES
  (1001, 0, 540, 615, 'E3 1101'), (1001, 2, 540, 615, 'E3 1101'),
  (1002, 1, 630, 705, 'N1 102'), (1002, 3, 630, 705, 'N1 102'),
  (1003, 0, 780, 855, 'E6 2102'), (1003, 2, 780, 855, 'E6 2102'),
  (1004, 4, 600, 750, 'N4 110'), (1005, 1, 930, 1005, 'E3 2201'),
  (1005, 3, 930, 1005, 'E3 2201');
