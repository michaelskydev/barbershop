-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "barberId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    CONSTRAINT "Appointment_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" ("barberId", "customerEmail", "customerName", "id", "serviceId", "startDate", "status") SELECT "barberId", "customerEmail", "customerName", "id", "serviceId", "startDate", "status" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
CREATE TABLE "new_Schedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "barberId" INTEGER NOT NULL,
    CONSTRAINT "Schedule_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Schedule" ("active", "barberId", "dayOfWeek", "endTime", "id", "startTime") SELECT "active", "barberId", "dayOfWeek", "endTime", "id", "startTime" FROM "Schedule";
DROP TABLE "Schedule";
ALTER TABLE "new_Schedule" RENAME TO "Schedule";
CREATE UNIQUE INDEX "Schedule_barberId_dayOfWeek_key" ON "Schedule"("barberId", "dayOfWeek");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
