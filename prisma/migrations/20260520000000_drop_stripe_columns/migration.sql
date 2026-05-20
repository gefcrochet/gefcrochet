-- Drop Stripe-related columns and indexes from Order table

DROP INDEX IF EXISTS "Order_stripeSessionId_key";
DROP INDEX IF EXISTS "Order_stripePaymentId_key";

ALTER TABLE "Order" DROP COLUMN "stripeSessionId";
ALTER TABLE "Order" DROP COLUMN "stripePaymentId";
