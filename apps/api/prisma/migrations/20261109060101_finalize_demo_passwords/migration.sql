-- The existing review migration creates the second local demo account.
UPDATE `User`
SET `password` = 'mini-otl-2026'
WHERE `username` = 'student2' AND `password` IS NULL;

ALTER TABLE `User` DROP COLUMN `passwordHash`;
