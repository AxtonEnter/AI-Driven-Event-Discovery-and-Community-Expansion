-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA public IS 'standard public schema';

-- DROP SEQUENCE public.events_id_seq;

CREATE SEQUENCE public.events_id_seq
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
	email varchar(120) NULL,
	"name" varchar(180) NULL,
	koa_url varchar(120) NOT NULL,
	org_url varchar(120) NOT NULL,
	org_events_url varchar(140) NULL,
	region varchar(120) NULL,
	CONSTRAINT organizations_koa_url_unique UNIQUE (koa_url),
	CONSTRAINT organizations_org_url_unique UNIQUE (org_url),
	CONSTRAINT organizations_pk PRIMARY KEY (id),
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
	status int2 DEFAULT 0 NOT NULL, -- 0 = PENDING¶1 = APPROVED¶2 = REJECTED
	rejectedreason varchar NULL,
	"user" varchar(80) NULL,
	organization int8 NULL,
	CONSTRAINT events_pk PRIMARY KEY (id),
	CONSTRAINT events_status_check CHECK (((status >= 0) AND (status <= 2))),
	CONSTRAINT events_organizations_fk FOREIGN KEY (organization) REFERENCES public.organizations(id),
	CONSTRAINT events_users_fk FOREIGN KEY ("user") REFERENCES public.users(username)
);

-- Column comments

COMMENT ON COLUMN public.events.status IS '0 = PENDING
1 = APPROVED
2 = REJECTED';


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