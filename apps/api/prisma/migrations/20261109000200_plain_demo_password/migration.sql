-- Keep the nullable legacy column until the existing review seed migration has run.
ALTER TABLE `User`
  MODIFY COLUMN `passwordHash` VARCHAR(60) NULL,
  ADD COLUMN `password` VARCHAR(72) NULL;

UPDATE `User`
SET `password` = 'mini-otl-2026', `passwordHash` = NULL
WHERE `username` IN ('student', 'student2');
