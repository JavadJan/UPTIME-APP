-- Add a password column for auth.
ALTER TABLE "User"
ADD COLUMN "password" TEXT NOT NULL DEFAULT '';
