-- AlterTable users: adicionar cep e logradouro
ALTER TABLE `users`
  ADD COLUMN `cep` VARCHAR(191) NULL,
  ADD COLUMN `logradouro` VARCHAR(191) NULL;

-- AlterTable convites: tornar turma_id opcional e adicionar questionario_id
ALTER TABLE `convites`
  MODIFY COLUMN `turma_id` VARCHAR(191) NULL,
  ADD COLUMN `questionario_id` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `convites_questionario_id_idx` ON `convites`(`questionario_id`);

-- AddForeignKey
ALTER TABLE `convites`
  ADD CONSTRAINT `convites_questionario_id_fkey`
  FOREIGN KEY (`questionario_id`) REFERENCES `questionarios`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
