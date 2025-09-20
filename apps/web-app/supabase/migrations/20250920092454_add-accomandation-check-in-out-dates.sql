create extension if not exists "pg_net" with schema "extensions";


alter table "public"."accommodations" add column "check_in" date;

alter table "public"."accommodations" add column "check_out" date;


