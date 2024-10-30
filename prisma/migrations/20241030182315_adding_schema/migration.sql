-- CreateTable
CREATE TABLE "Post_Details" (
    "id" TEXT NOT NULL,
    "postUid" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "headings" TEXT,
    "reactions" INTEGER NOT NULL,

    CONSTRAINT "Post_Details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post_Comment" (
    "id" TEXT NOT NULL,
    "postUid" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_Comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post_Details" ADD CONSTRAINT "Post_Details_postUid_fkey" FOREIGN KEY ("postUid") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post_Comment" ADD CONSTRAINT "Post_Comment_postUid_fkey" FOREIGN KEY ("postUid") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post_Comment" ADD CONSTRAINT "Post_Comment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
