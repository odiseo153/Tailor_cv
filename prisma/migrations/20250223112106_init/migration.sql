-- AlterTable
ALTER TABLE "CvPreferences" ALTER COLUMN "createdAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Education" ALTER COLUMN "createdAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Skill" ALTER COLUMN "createdAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SocialLink" ALTER COLUMN "createdAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WorkExperience" ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL;
