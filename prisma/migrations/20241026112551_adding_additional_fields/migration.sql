/*
  Warnings:

  - Added the required column `category` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publishedDate` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `readTime` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tag` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "publishedDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "readTime" TEXT NOT NULL,
ADD COLUMN     "tag" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "dateofBirth" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT;
