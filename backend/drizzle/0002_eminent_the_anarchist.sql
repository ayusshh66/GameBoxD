CREATE TABLE "notification_reads" (
	"user_id" uuid NOT NULL,
	"event_key" varchar(160) NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_reads_user_id_event_key_pk" PRIMARY KEY("user_id","event_key")
);
--> statement-breakpoint
CREATE TABLE "user_game_logs" (
	"user_id" uuid NOT NULL,
	"game_id" uuid NOT NULL,
	"status" varchar(16) NOT NULL,
	"playtime_minutes" integer,
	"note" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_game_logs_user_id_game_id_pk" PRIMARY KEY("user_id","game_id")
);
--> statement-breakpoint
ALTER TABLE "notification_reads" ADD CONSTRAINT "notification_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_game_logs" ADD CONSTRAINT "user_game_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_game_logs" ADD CONSTRAINT "user_game_logs_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;