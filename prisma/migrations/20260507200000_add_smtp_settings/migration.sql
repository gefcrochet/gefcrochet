-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN "smtpHost" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "smtpPort" INTEGER;
ALTER TABLE "SiteSettings" ADD COLUMN "smtpSecure" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SiteSettings" ADD COLUMN "smtpUser" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "smtpPass" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "smtpFrom" TEXT;
