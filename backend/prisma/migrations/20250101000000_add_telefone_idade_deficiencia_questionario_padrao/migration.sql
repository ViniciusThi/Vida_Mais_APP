-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "telefone" TEXT,
ADD COLUMN IF NOT EXISTS "idade" INTEGER,
ADD COLUMN IF NOT EXISTS "deficiencia" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_telefone_idx" ON "users"("telefone");

-- AlterTable
ALTER TABLE "questionarios" ADD COLUMN IF NOT EXISTS "padrao" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "ano" INTEGER;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "questionarios_padrao_ano_idx" ON "questionarios"("padrao", "ano");

-- Add unique constraint for telefone (only for non-null values)
-- Note: This will be handled by Prisma, but we add it manually for safety
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_telefone_key'
    ) THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_telefone_key" UNIQUE ("telefone");
    END IF;
END $$;

