-- CreateTable
CREATE TABLE "ShortcutReference" (
    "id" SERIAL NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "icon" VARCHAR(50) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "subtitle" VARCHAR(255) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortcutReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserShortcut" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "shortcutId" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserShortcut_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShortcutReference_url_idx" ON "ShortcutReference"("url");

-- CreateIndex
CREATE INDEX "ShortcutReference_title_idx" ON "ShortcutReference"("title");

-- CreateIndex
CREATE INDEX "UserShortcut_userId_idx" ON "UserShortcut"("userId");

-- CreateIndex
CREATE INDEX "UserShortcut_shortcutId_idx" ON "UserShortcut"("shortcutId");

-- CreateIndex
CREATE UNIQUE INDEX "UserShortcut_userId_shortcutId_key" ON "UserShortcut"("userId", "shortcutId");

-- AddForeignKey
ALTER TABLE "UserShortcut" ADD CONSTRAINT "UserShortcut_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserInternal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShortcut" ADD CONSTRAINT "UserShortcut_shortcutId_fkey" FOREIGN KEY ("shortcutId") REFERENCES "ShortcutReference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
