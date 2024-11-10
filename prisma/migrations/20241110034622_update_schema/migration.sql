-- AlterTable
ALTER TABLE "User" ADD COLUMN     "externalId" INTEGER,
ADD COLUMN     "externalLogin" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "External_Provider" (
    "externalID" SERIAL NOT NULL,
    "providerName" TEXT NOT NULL,

    CONSTRAINT "External_Provider_pkey" PRIMARY KEY ("externalID")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_externalId_fkey" FOREIGN KEY ("externalId") REFERENCES "External_Provider"("externalID") ON DELETE SET NULL ON UPDATE CASCADE;
