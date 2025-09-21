create extension if not exists "pg_net" with schema "extensions";


alter table "public"."accommodations" add column "check_in" timestamp with time zone;

alter table "public"."accommodations" add column "check_out" timestamp with time zone;


