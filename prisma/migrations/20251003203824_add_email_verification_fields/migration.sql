-- AlterTable
ALTER TABLE `support_tickets` ADD COLUMN `userRole` VARCHAR(191) NOT NULL DEFAULT 'user',
    MODIFY `category` ENUM('general', 'technical', 'billing', 'feature_request', 'bug_report', 'booking', 'payment', 'account', 'space_creation', 'space_management', 'payout_issue', 'payment_missing', 'booking_issue', 'verification_issue', 'subscription_issue', 'analytics_issue') NOT NULL DEFAULT 'general';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `emailOtp` VARCHAR(191) NULL,
    ADD COLUMN `emailOtpExpiry` DATETIME(3) NULL,
    ADD COLUMN `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `resetToken` VARCHAR(191) NULL,
    ADD COLUMN `resetTokenExpiry` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `space_owner_payouts` (
    `id` VARCHAR(191) NOT NULL,
    `spaceOwnerId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'bank_transfer',
    `transactionId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `processedBy` VARCHAR(191) NULL,
    `processedAt` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `space_owner_payouts_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `space_owner_payouts` ADD CONSTRAINT `space_owner_payouts_spaceOwnerId_fkey` FOREIGN KEY (`spaceOwnerId`) REFERENCES `space_owners`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
