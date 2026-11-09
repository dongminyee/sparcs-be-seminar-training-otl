-- CreateTable
CREATE TABLE `review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `lectureId` INTEGER NOT NULL,
    `content` VARCHAR(500) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `review_lectureId_id_idx`(`lectureId`, `id`),
    UNIQUE INDEX `review_userId_lectureId_key`(`userId`, `lectureId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review` ADD CONSTRAINT `review_lectureId_fkey` FOREIGN KEY (`lectureId`) REFERENCES `Lecture`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- The second demo user uses the same local training password as student.
INSERT INTO `User` (`username`, `name`, `passwordHash`)
SELECT 'student2', '이세미나', '$2b$10$SltYJMaB/HD5jNcz0qCMb.jPeG4Vl8gtjHd9gDm.fE9kUO8h1iXlG'
WHERE NOT EXISTS (SELECT 1 FROM `User` WHERE `username` = 'student2');

INSERT INTO `review` (`userId`, `lectureId`, `content`)
SELECT `id`, 1001, '직접 자료구조를 구현하는 과제가 개념을 이해하는 데 도움이 됐어요.'
FROM `User` WHERE `username` = 'student2';
