ALTER TABLE "waitlist" ADD COLUMN "unsubscribe_token" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "waitlist" ADD COLUMN "unsubscribed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "waitlist" ADD CONSTRAINT "waitlist_unsubscribe_token_unique" UNIQUE("unsubscribe_token");