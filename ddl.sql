-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION u33bgajv5och54;

-- DROP SEQUENCE public.events_id_seq;

CREATE SEQUENCE public.events_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.events_id_seq1;

CREATE SEQUENCE public.events_id_seq1
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.organizations_id_seq;

CREATE SEQUENCE public.organizations_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE public.organizations_id_seq1;

CREATE SEQUENCE public.organizations_id_seq1
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;-- public.regions definition

-- Drop table

-- DROP TABLE public.regions;

CREATE TABLE public.regions (
	koa_url varchar(120) NULL,
	"name" varchar(120) NOT NULL,
	CONSTRAINT regions_pk PRIMARY KEY (name)
);


-- public.tags definition

-- Drop table

-- DROP TABLE public.tags;

CREATE TABLE public.tags (
	"name" varchar(80) NOT NULL,
	"desc" varchar NULL,
	color varchar(10) DEFAULT 'primary'::character varying NOT NULL,
	CONSTRAINT tags_pk PRIMARY KEY (name)
);


-- public.url_hashes definition

-- Drop table

-- DROP TABLE public.url_hashes;

CREATE TABLE public.url_hashes (
	url varchar(180) NOT NULL,
	hash varchar NOT NULL,
	CONSTRAINT url_hashes_pk PRIMARY KEY (hash)
);


-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	username varchar(80) NOT NULL,
	"role" varchar(20) NULL,
	"password" varchar NOT NULL,
	CONSTRAINT users_pk PRIMARY KEY (username)
);


-- public.organizations definition

-- Drop table

-- DROP TABLE public.organizations;

CREATE TABLE public.organizations (
	id bigserial NOT NULL,
	email varchar NULL,
	"name" varchar NULL,
	koa_url varchar NOT NULL,
	org_url varchar NOT NULL,
	org_events_url varchar NULL,
	region varchar NULL,
	cms_id int8 NULL,
	CONSTRAINT organizations_pk PRIMARY KEY (id),
	CONSTRAINT organizations_unique UNIQUE (cms_id),
	CONSTRAINT organizations_regions_fk FOREIGN KEY (region) REFERENCES public.regions("name")
);


-- public.events definition

-- Drop table

-- DROP TABLE public.events;

CREATE TABLE public.events (
	id bigserial NOT NULL,
	url varchar(180) NOT NULL,
	title varchar(180) NOT NULL,
	html varchar NOT NULL,
	"text" varchar NULL,
	addedat timestamp DEFAULT now() NOT NULL,
	statuschangedat timestamp NULL,
	status int2 DEFAULT 0 NOT NULL,
	rejectedreason varchar NULL,
	"user" varchar(80) NULL,
	organization int8 NULL,
	images json NULL,
	CONSTRAINT events_pk PRIMARY KEY (id),
	CONSTRAINT events_status_check CHECK (((status >= 0) AND (status <= 2))),
	CONSTRAINT events_organizations_fk FOREIGN KEY (organization) REFERENCES public.organizations(id),
	CONSTRAINT events_users_fk FOREIGN KEY ("user") REFERENCES public.users(username)
);


-- public.events_tags definition

-- Drop table

-- DROP TABLE public.events_tags;

CREATE TABLE public.events_tags (
	"event" int8 NOT NULL,
	tag varchar(80) NOT NULL,
	CONSTRAINT events_tags_pk PRIMARY KEY (event, tag),
	CONSTRAINT events_tags_events_fk FOREIGN KEY ("event") REFERENCES public.events(id),
	CONSTRAINT events_tags_tags_fk FOREIGN KEY (tag) REFERENCES public.tags("name")
);


-- public.pg_stat_statements source

CREATE OR REPLACE VIEW public.pg_stat_statements
AS SELECT userid,
    dbid,
    toplevel,
    queryid,
    query,
    plans,
    total_plan_time,
    min_plan_time,
    max_plan_time,
    mean_plan_time,
    stddev_plan_time,
    calls,
    total_exec_time,
    min_exec_time,
    max_exec_time,
    mean_exec_time,
    stddev_exec_time,
    rows,
    shared_blks_hit,
    shared_blks_read,
    shared_blks_dirtied,
    shared_blks_written,
    local_blks_hit,
    local_blks_read,
    local_blks_dirtied,
    local_blks_written,
    temp_blks_read,
    temp_blks_written,
    shared_blk_read_time,
    shared_blk_write_time,
    local_blk_read_time,
    local_blk_write_time,
    temp_blk_read_time,
    temp_blk_write_time,
    wal_records,
    wal_fpi,
    wal_bytes,
    jit_functions,
    jit_generation_time,
    jit_inlining_count,
    jit_inlining_time,
    jit_optimization_count,
    jit_optimization_time,
    jit_emission_count,
    jit_emission_time,
    jit_deform_count,
    jit_deform_time,
    stats_since,
    minmax_stats_since
   FROM pg_stat_statements(true) pg_stat_statements(userid, dbid, toplevel, queryid, query, plans, total_plan_time, min_plan_time, max_plan_time, mean_plan_time, stddev_plan_time, calls, total_exec_time, min_exec_time, max_exec_time, mean_exec_time, stddev_exec_time, rows, shared_blks_hit, shared_blks_read, shared_blks_dirtied, shared_blks_written, local_blks_hit, local_blks_read, local_blks_dirtied, local_blks_written, temp_blks_read, temp_blks_written, shared_blk_read_time, shared_blk_write_time, local_blk_read_time, local_blk_write_time, temp_blk_read_time, temp_blk_write_time, wal_records, wal_fpi, wal_bytes, jit_functions, jit_generation_time, jit_inlining_count, jit_inlining_time, jit_optimization_count, jit_optimization_time, jit_emission_count, jit_emission_time, jit_deform_count, jit_deform_time, stats_since, minmax_stats_since);


-- public.pg_stat_statements_info source

CREATE OR REPLACE VIEW public.pg_stat_statements_info
AS SELECT dealloc,
    stats_reset
   FROM pg_stat_statements_info() pg_stat_statements_info(dealloc, stats_reset);



-- DROP FUNCTION public.pg_stat_statements(in bool, out oid, out oid, out bool, out int8, out text, out int8, out float8, out float8, out float8, out float8, out float8, out int8, out float8, out float8, out float8, out float8, out float8, out int8, out int8, out int8, out int8, out int8, out int8, out int8, out int8, out int8, out int8, out int8, out float8, out float8, out float8, out float8, out float8, out float8, out int8, out int8, out numeric, out int8, out float8, out int8, out float8, out int8, out float8, out int8, out float8, out int8, out float8, out timestamptz, out timestamptz);

CREATE OR REPLACE FUNCTION public.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone)
 RETURNS SETOF record
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pg_stat_statements', $function$pg_stat_statements_1_11$function$
;

-- DROP FUNCTION public.pg_stat_statements_info(out int8, out timestamptz);

CREATE OR REPLACE FUNCTION public.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone)
 RETURNS record
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pg_stat_statements', $function$pg_stat_statements_info$function$
;

-- DROP FUNCTION public.pg_stat_statements_reset(oid, oid, int8, bool);

CREATE OR REPLACE FUNCTION public.pg_stat_statements_reset(userid oid DEFAULT 0, dbid oid DEFAULT 0, queryid bigint DEFAULT 0, minmax_only boolean DEFAULT false)
 RETURNS timestamp with time zone
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/pg_stat_statements', $function$pg_stat_statements_reset_1_11$function$
;