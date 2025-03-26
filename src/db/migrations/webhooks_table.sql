-- Create webhooks table
CREATE TABLE `webhooks` (
  `id` INT AUTO_INCREMENT NOT NULL COMMENT 'ID for webhook',
  `name` VARCHAR(255) NOT NULL COMMENT 'Webhook name',
  `base_url` VARCHAR(2048) NOT NULL COMMENT 'Base URL of the webhook',
  `path` VARCHAR(255) NOT NULL COMMENT 'Path for the webhook',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_webhook_name` (`name`),
  INDEX `idx_webhook_name` (`name`)
); 