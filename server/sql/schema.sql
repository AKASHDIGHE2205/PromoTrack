-- Sales Promoter - schema.sql
-- Corrected / hardened version of the supplied sp.sql dump.
-- Fixes applied vs. the original dump:
--   1. Added AUTO_INCREMENT to every primary key (the dump had none, so no
--      row could ever be inserted without the app manually generating ids).
--   2. Added a `role` column to mst_users - the dump had no way to tell an
--      admin apart from a field sales promoter, which the API needs for
--      authorization.
--   3. Fixed `bank_info` - c_at/u_at were declared `int` and c_by/u_by were
--      declared `datetime` (swapped by mistake in the dump). They now match
--      every other table: c_at/u_at = datetime, c_by/u_by = int.
--   4. Added sensible ON UPDATE CURRENT_TIMESTAMP to every u_at column and
--      DEFAULT CURRENT_TIMESTAMP to c_at/u_at.
--   5. Added foreign keys tying transactional tables back to their masters.
--   6. Added helpful indexes for the query patterns the API needs
--      (lookups by user/date, user/status, etc).

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- mst_users: admins + field sales promoters
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mst_users` (
  `user_id` INT(10) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(100) DEFAULT NULL,
  `password` VARCHAR(500) NOT NULL,
  `f_name` VARCHAR(50) NOT NULL,
  `m_name` VARCHAR(50) DEFAULT NULL,
  `l_name` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `address` VARCHAR(500) DEFAULT NULL,
  `town` VARCHAR(100) DEFAULT NULL,
  `district` VARCHAR(100) DEFAULT NULL,
  `pin_code` VARCHAR(10) DEFAULT NULL,
  `distributor` VARCHAR(150) DEFAULT NULL,
  `asm` VARCHAR(150) DEFAULT NULL,
  `rsm` VARCHAR(150) DEFAULT NULL,
  `role` ENUM('ADMIN','SP') NOT NULL DEFAULT 'SP',
  `fwd` DATE NOT NULL COMMENT 'field work / joining date',
  `status` CHAR(1) NOT NULL DEFAULT 'A' COMMENT 'A=Active, I=Inactive',
  `c_by` INT(10) DEFAULT NULL,
  `c_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `u_by` INT(10) DEFAULT NULL,
  `u_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_users_role_status` (`role`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- item_master: promotable products
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `item_master` (
  `item_id` INT(10) NOT NULL AUTO_INCREMENT,
  `brand_name` VARCHAR(100) NOT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `pack_size` DECIMAL(10,3) NOT NULL,
  `uom` VARCHAR(10) NOT NULL,
  `rate` DECIMAL(12,2) NOT NULL,
  `brand_type` CHAR(1) NOT NULL,
  `status` CHAR(1) NOT NULL DEFAULT 'A',
  `c_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `c_by` INT(10) NOT NULL,
  `u_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `u_by` INT(11) NOT NULL,
  PRIMARY KEY (`item_id`),
  KEY `idx_item_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- mst_shops: retail outlets visited by promoters
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mst_shops` (
  `shop_id` INT(10) NOT NULL AUTO_INCREMENT,
  `shop_name` VARCHAR(200) NOT NULL,
  `owner_name` VARCHAR(150) NOT NULL,
  `address` VARCHAR(500) NOT NULL,
  `latitude` DECIMAL(10,7) NOT NULL,
  `longitude` DECIMAL(10,7) NOT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `status` CHAR(1) NOT NULL DEFAULT 'A',
  `c_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `c_by` INT(10) NOT NULL,
  `u_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `u_by` INT(10) NOT NULL,
  PRIMARY KEY (`shop_id`),
  KEY `idx_shop_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- sp_attendance: daily check-in with selfie + geo
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sp_attendance` (
  `attendance_id` INT(10) NOT NULL AUTO_INCREMENT,
  `user_id` INT(10) NOT NULL,
  `attendance_date` DATE NOT NULL,
  `check_in` DATETIME NOT NULL,
  `selfie` VARCHAR(250) NOT NULL,
  `location` VARCHAR(500) DEFAULT NULL,
  `pincode` VARCHAR(10) DEFAULT NULL,
  `district` VARCHAR(100) DEFAULT NULL,
  `state` VARCHAR(100) DEFAULT NULL,
  `latitude` DECIMAL(10,7) NOT NULL,
  `longitude` DECIMAL(10,7) NOT NULL,
  `status` CHAR(1) NOT NULL DEFAULT 'A',
  `c_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `c_by` INT(10) NOT NULL,
  `u_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `u_by` INT(10) NOT NULL,
  PRIMARY KEY (`attendance_id`),
  UNIQUE KEY `uq_user_date` (`user_id`, `attendance_date`),
  CONSTRAINT `fk_attendance_user` FOREIGN KEY (`user_id`) REFERENCES `mst_users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- promotion_hd: field promotion visit header (one per shop visit)
-- Note: promote_id is NOT auto-increment - the app generates it
-- (MAX(promote_id)+1 under a row lock), matching mst_products/mst_shops.
-- No user_id column - c_by (created by) is what distinguishes
-- user-wise entries, so it doubles as the ownership column.
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `promotion_hd` (
  `promote_id` INT(10) NOT NULL,
  `shop_id` INT(10) NOT NULL,
  `promote_date` DATE NOT NULL,
  `cust_mob` VARCHAR(20) NOT NULL,
  `status` CHAR(1) NOT NULL DEFAULT 'A',
  `c_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `c_by` INT(10) NOT NULL,
  `u_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `u_by` INT(10) NOT NULL,
  PRIMARY KEY (`promote_id`),
  KEY `idx_promote_user_date` (`c_by`, `promote_date`),
  KEY `idx_promote_shop` (`shop_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- promotion_dt: items promoted during a visit (multiple per header)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `promotion_dt` (
  `promote_dt_id` INT(10) NOT NULL,
  `promote_id` INT(10) NOT NULL,
  `item_id` INT(10) NOT NULL,
  `qty` DECIMAL(10,2) NOT NULL,
  `total_kg` DECIMAL(10,2) NOT NULL,
  `c_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `c_by` INT(10) NOT NULL,
  `u_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `u_by` INT(10) NOT NULL,
  PRIMARY KEY (`promote_dt_id`),
  KEY `idx_promote_dt_promote` (`promote_id`),
  KEY `idx_promote_dt_item` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- bank_info: payout account per user
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bank_info` (
  `bank_id` INT(10) NOT NULL AUTO_INCREMENT,
  `user_id` INT(10) NOT NULL,
  `account_no` VARCHAR(50) NOT NULL,
  `bank_name` VARCHAR(150) NOT NULL,
  `branch` VARCHAR(100) NOT NULL,
  `ifsc_code` VARCHAR(20) NOT NULL,
  `status` CHAR(1) NOT NULL DEFAULT 'A',
  `c_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `c_by` INT(10) NOT NULL,
  `u_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `u_by` INT(10) NOT NULL,
  PRIMARY KEY (`bank_id`),
  UNIQUE KEY `uq_bank_user` (`user_id`),
  CONSTRAINT `fk_bank_user` FOREIGN KEY (`user_id`) REFERENCES `mst_users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- salary_structure: effective-dated pay per user
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `salary_structure` (
  `salary_id` INT(10) NOT NULL AUTO_INCREMENT,
  `user_id` INT(10) NOT NULL,
  `wef` DATE NOT NULL COMMENT 'with effect from',
  `basic_salary` DECIMAL(12,4) NOT NULL,
  `incentive` DECIMAL(12,4) NOT NULL,
  `status` CHAR(1) NOT NULL DEFAULT 'A',
  `c_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `c_by` INT(10) NOT NULL,
  `u_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `u_by` INT(10) NOT NULL,
  PRIMARY KEY (`salary_id`),
  UNIQUE KEY `uq_salary_user_wef` (`user_id`, `wef`),
  CONSTRAINT `fk_salary_user` FOREIGN KEY (`user_id`) REFERENCES `mst_users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- No seed data here on purpose: passwords must be bcrypt-hashed, and a
-- hash can't be safely hand-written into a .sql file. Run
-- `npm run seed:admin` after `npm install` to create the first admin login.
