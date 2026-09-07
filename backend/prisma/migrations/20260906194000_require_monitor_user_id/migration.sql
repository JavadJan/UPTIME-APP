-- Seed a default user so required monitor rows can reference it.
INSERT INTO "User" ("id", "email", "createdAt")
VALUES ('00000000-0000-0000-0000-000000000001', 'system@local', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- Backfill any existing monitors before making the column required.
UPDATE "Monitor"
SET "userId" = '00000000-0000-0000-0000-000000000001'
WHERE "userId" IS NULL;

-- Recreate the foreign key with a required column and no cascading delete behavior.
ALTER TABLE "Monitor" DROP CONSTRAINT IF EXISTS "Monitor_userId_fkey";
ALTER TABLE "Monitor" ALTER COLUMN "userId" SET DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE "Monitor" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Monitor"
  ADD CONSTRAINT "Monitor_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
