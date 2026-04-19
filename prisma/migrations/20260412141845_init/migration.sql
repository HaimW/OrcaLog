-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT,
    "username" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "language" TEXT NOT NULL DEFAULT 'he',
    "units" TEXT NOT NULL DEFAULT 'metric',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "defaultLocation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DiveEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "time" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "detailedLocation" TEXT,
    "coordLat" REAL,
    "coordLng" REAL,
    "depth" REAL,
    "duration" INTEGER,
    "visibility" REAL,
    "weather" TEXT,
    "equipment" TEXT,
    "fishingTypes" TEXT,
    "catches" TEXT,
    "photos" TEXT,
    "notes" TEXT,
    "rating" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiveEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "adminEmails" TEXT NOT NULL DEFAULT '[]',
    "whatsappGroupLink" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "DiveEntry_userId_idx" ON "DiveEntry"("userId");

-- CreateIndex
CREATE INDEX "DiveEntry_date_idx" ON "DiveEntry"("date");

-- CreateIndex
CREATE INDEX "DiveEntry_location_idx" ON "DiveEntry"("location");
