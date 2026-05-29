-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiveEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "detailedLocation" TEXT,
    "coordLat" DOUBLE PRECISION,
    "coordLng" DOUBLE PRECISION,
    "depth" DOUBLE PRECISION,
    "duration" INTEGER,
    "visibility" DOUBLE PRECISION,
    "weather" TEXT,
    "equipment" TEXT,
    "fishingTypes" TEXT,
    "catches" TEXT,
    "photos" TEXT,
    "notes" TEXT,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiveEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "adminEmails" TEXT NOT NULL DEFAULT '[]',
    "whatsappGroupLink" TEXT,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "DiveEntry_userId_idx" ON "DiveEntry"("userId");

-- CreateIndex
CREATE INDEX "DiveEntry_date_idx" ON "DiveEntry"("date");

-- CreateIndex
CREATE INDEX "DiveEntry_location_idx" ON "DiveEntry"("location");

-- AddForeignKey
ALTER TABLE "DiveEntry" ADD CONSTRAINT "DiveEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
