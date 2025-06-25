��--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: consumable_item_info; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.consumable_item_info AS (
	item_id integer,
	name text,
	quantity integer,
	favourite boolean,
	lastcheckdate text
);


ALTER TYPE public.consumable_item_info OWNER TO postgres;

--
-- Name: check_category_exists(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_category_exists(cat_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categories WHERE id = cat_idTHEN
        RAISE EXCEPTION 'Categoria cu id-ul % nu există!', cat_id;
    END IF;
END;
$$;


ALTER FUNCTION public.check_category_exists(cat_id integerOWNER TO postgres;

--
-- Name: check_category_has_items(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_category_has_items(cat_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM items WHERE category_id = cat_id
    THEN
        RAISE EXCEPTION 'Categoria nu are iteme.';
    END IF;
END;
$$;


ALTER FUNCTION public.check_category_has_items(cat_id integerOWNER TO postgres;

--
-- Name: check_export_has_data(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_export_has_data(RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM categories c
        LEFT JOIN items i ON c.id = i.category_id
        LEFT JOIN item_properties p ON i.id = p.item_id
        LEFT JOIN item_alerts a ON i.id = a.item_id
        LEFT JOIN (
            SELECT item_id, MAX(added_date) AS added_date
            FROM item_dates
            GROUP BY item_id
        d ON i.id = d.item_id
    THEN
        RAISE EXCEPTION 'Nu există date pentru export' USING ERRCODE = 'P0001';
    END IF;
END
$$;


ALTER FUNCTION public.check_export_has_data(OWNER TO postgres;

--
-- Name: check_item_exists(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_item_exists(item_id integerRETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM items WHERE id = item_id
    ) THEN
        RAISE EXCEPTION 'Itemul nu există.';
    END IF;
END;
$$;


ALTER FUNCTION public.check_item_exists(item_id integerOWNER TO postgres;

--
-- Name: estimate_depletion_date(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.estimate_depletion_date(p_item_id integerRETURNS date
    LANGUAGE plpgsql
    AS $$
DECLARE
    avg_daily_consumption FLOAT;
    latest_quantity INT;
    last_date DATE;
BEGIN
    SELECT 
        AVG(diff
    INTO avg_daily_consumption
    FROM (
        SELECT 
            quantity - LAG(quantityOVER (ORDER BY added_date) AS diff,
            added_date
        FROM item_dates
        WHERE item_id = p_item_id
    ) AS consumption
    WHERE diff < 0;

    SELECT quantity, added_date
    INTO latest_quantity, last_date
    FROM item_dates
    WHERE item_id = p_item_id
    ORDER BY added_date DESC
    LIMIT 1;

    IF avg_daily_consumption IS NULL OR avg_daily_consumption = 0 THEN
        RETURN NULL;
    END IF;

    RETURN last_date + (latest_quantity / ABS(avg_daily_consumption)) * INTERVAL '1 day';
END;
$$;


ALTER FUNCTION public.estimate_depletion_date(p_item_id integer) OWNER TO postgres;

--
-- Name: get_consumables_by_category(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_consumables_by_category(p_category_id integer) RETURNS SETOF public.consumable_item_info
    LANGUAGE plpgsql
    AS $$
DECLARE
  item_cursor REFCURSOR;
  rec RECORD;
  result_row consumable_item_info;
BEGIN
  OPEN item_cursor FOR
    SELECT 
      i.id AS item_id,
      i.name,
      i.quantity,
      p.favourite,
      a.lastcheckdate
    FROM items i
    JOIN item_properties p ON i.id = p.item_id
    JOIN item_alerts a ON i.id = a.item_id
    WHERE i.category_id = p_category_id AND p.consumable = true;

  LOOP
    FETCH item_cursor INTO rec;
    EXIT WHEN NOT FOUND;

    result_row.item_id := rec.item_id;
    result_row.name := rec.name;
    result_row.quantity := rec.quantity;
    result_row.favourite := rec.favourite;

    IF rec.lastcheckdate IS NULL THEN
      result_row.lastcheckdate := 'NoDate';
    ELSE
      result_row.lastcheckdate := rec.lastcheckdate::TEXT;
    END IF;

    RETURN NEXT result_row;
  END LOOP;

  CLOSE item_cursor;
END;
$$;


ALTER FUNCTION public.get_consumables_by_category(p_category_id integer) OWNER TO postgres;

--
-- Name: log_delete_category(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_delete_category() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, table_name, record_id)
  VALUES (OLD.user_id, 'DELETE', 'categories', OLD.id);
  RETURN OLD;
END;
$$;


ALTER FUNCTION public.log_delete_category(OWNER TO postgres;

--
-- Name: log_insert_category(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_insert_category(RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, table_name, record_id)
  VALUES (NEW.user_id, 'INSERT', 'categories', NEW.id);
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_insert_category() OWNER TO postgres;

--
-- Name: log_update_category(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_update_category() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, table_name, record_id)
  VALUES (NEW.user_id, 'UPDATE', 'categories', NEW.id);
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.log_update_category(OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_log (
    id integer NOT NULL,
    user_id integer,
    action text NOT NULL,
    table_name text NOT NULL,
    record_id integer NOT NULL,
    action_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_log OWNER TO postgres;

--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_log_id_seq OWNER TO postgres;

--
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(50NOT NULL,
    user_id integer
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: item_alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_alerts (
    id integer NOT NULL,
    alert boolean NOT NULL,
    alertdeqtime character varying(50NOT NULL,
    lastcheckdate character varying(50NOT NULL,
    item_id integer
);


ALTER TABLE public.item_alerts OWNER TO postgres;

--
-- Name: item_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_alerts_id_seq OWNER TO postgres;

--
-- Name: item_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_alerts_id_seq OWNED BY public.item_alerts.id;


--
-- Name: item_dates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_dates (
    id integer NOT NULL,
    added_date character varying(50) NOT NULL,
    quantity integer NOT NULL,
    item_id integer
);


ALTER TABLE public.item_dates OWNER TO postgres;

--
-- Name: item_dates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_dates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_dates_id_seq OWNER TO postgres;

--
-- Name: item_dates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_dates_id_seq OWNED BY public.item_dates.id;


--
-- Name: item_properties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_properties (
    id integer NOT NULL,
    consumable boolean NOT NULL,
    favourite boolean NOT NULL,
    item_id integer
);


ALTER TABLE public.item_properties OWNER TO postgres;

--
-- Name: item_properties_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.item_properties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.item_properties_id_seq OWNER TO postgres;

--
-- Name: item_properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.item_properties_id_seq OWNED BY public.item_properties.id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    quantity integer NOT NULL,
    category_id integer
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_id_seq OWNER TO postgres;

--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    email character varying(100NOT NULL,
    password character varying(50) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: item_alerts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_alerts ALTER COLUMN id SET DEFAULT nextval('public.item_alerts_id_seq'::regclass);


--
-- Name: item_dates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_dates ALTER COLUMN id SET DEFAULT nextval('public.item_dates_id_seq'::regclass);


--
-- Name: item_properties id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_properties ALTER COLUMN id SET DEFAULT nextval('public.item_properties_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_log (id, user_id, action, table_name, record_id, action_timeFROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, user_id) FROM stdin;
1	cocobauru	1
2	cocobauru	2
6	asd	6
7	dildo	12
10	abracadarba	13
8	nu sexuale	13
\.


--
-- Data for Name: item_alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_alerts (id, alert, alertdeqtime, lastcheckdate, item_id) FROM stdin;
1	f	off	NoDate	1
2	f	off	NoDate	2
3	f	off	NoDate	3
4	f	off	NoDate	4
6	f	off	NoDate	12
7	f	off	NoDate	13
9	f	off	NoDate	15
8	f	7d	2025-06-18T10:59:17.394Z	14
11	t	7d	NoDate	17
14	f	noalert	NoDate	22
13	t	7d	2025-06-25T11:26:33.293Z	19
12	f	7d	NoDate	18
\.


--
-- Data for Name: item_dates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_dates (id, added_date, quantity, item_idFROM stdin;
1	2025-06-17T15:25:17.754Z	1	1
2	2025-06-17T15:25:21.284Z	1	2
3	2025-06-17T15:28:01.868Z	1	3
4	2025-06-17T15:28:05.438Z	1	4
6	2025-06-18T10:56:05.150Z	1	12
7	2025-06-18T10:56:07.048Z	1	13
8	2025-06-18T10:56:08.754Z	1	14
9	2025-06-18T10:56:11.987Z	1	15
11	2025-06-18T10:59:21.582Z	1	14
12	2025-06-18T20:05:10.560Z	65	17
13	2025-06-18T23:06:08.713+03:00	64	17
14	2025-06-18T20:06:20.262Z	6	17
15	2025-06-18T23:06:23.708+03:00	5	17
16	2025-06-18T23:06:33.709+03:00	4	17
17	2025-06-18T23:06:43.709+03:00	3	17
18	2025-06-18T23:06:53.711+03:00	2	17
19	2025-06-18T23:07:03.711+03:00	1	17
20	2025-06-18T23:07:13.712+03:00	0	17
21	2025-06-20T12:50:17.701Z	43	18
22	2025-06-20T12:50:44.041Z	1	19
23	2025-06-20T15:52:01.474+03:00	42	18
24	2025-06-20T15:52:16.468+03:00	41	18
25	2025-06-25T11:26:22.166Z	41	18
26	2025-06-25T11:26:26.798Z	42	18
27	2025-06-25T11:27:03.588Z	123	22
28	2025-06-25T11:27:13.589Z	1	19
29	2025-06-25T11:54:29.423Z	5	18
\.


--
-- Data for Name: item_properties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_properties (id, consumable, favourite, item_id) FROM stdin;
1	f	f	1
2	f	f	2
4	f	f	4
3	f	f	3
6	f	f	12
7	f	f	13
9	f	f	15
8	f	f	14
11	t	f	17
14	t	f	22
13	f	t	19
12	t	f	18
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (id, name, quantity, category_idFROM stdin;
1	coco	1	1
2	bauru	1	1
3	coco	1	2
4	bauru	1	2
12	asd	1	6
13	asdasd	1	6
15	asdasdasdasdasdasd	1	6
14	asdasdasdasd	1	6
17	bigblackdildo	0	7
22	asdasd	123	8
19	Bile Anale	1	8
18	comsin	5	8
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password) FROM stdin;
1	manmat	manmat2004@gmail.com	test123
2	cocobauru	asd123@gmaill.com	asdasd
6	cox	cox26@gmail.com	Cox69!234
8	manmat13	manmat2004@gmail123.com	Test1!2@3#
9	asdasdasdadada	asdasda	Taglaif1!2@3#
11	cocobauru69	cpopovici56@gmail.com	CL:KJAS1@#as
12	lisarazvan	razvanlisa@gmail.com	Manmat123$
13	Fabian	fabian_lungu23@yahoo.com	Parola123!
\.


--
-- Name: audit_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_log_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 12, true);


--
-- Name: item_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_alerts_id_seq', 14, true);


--
-- Name: item_dates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_dates_id_seq', 29, true);


--
-- Name: item_properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.item_properties_id_seq', 14, true);


--
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_id_seq', 22, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 13, true);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_user_id_key UNIQUE (name, user_id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: item_alerts item_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_alerts
    ADD CONSTRAINT item_alerts_pkey PRIMARY KEY (id);


--
-- Name: item_dates item_dates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_dates
    ADD CONSTRAINT item_dates_pkey PRIMARY KEY (id);


--
-- Name: item_properties item_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_properties
    ADD CONSTRAINT item_properties_pkey PRIMARY KEY (id);


--
-- Name: items items_name_category_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_name_category_id_key UNIQUE (name, category_id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_name_key UNIQUE (name);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: items fk_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.categories(idON DELETE CASCADE;


--
-- Name: item_alerts fk_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_alerts
    ADD CONSTRAINT fk_item FOREIGN KEY (item_idREFERENCES public.items(idON DELETE CASCADE;


--
-- Name: item_properties fk_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_properties
    ADD CONSTRAINT fk_item FOREIGN KEY (item_idREFERENCES public.items(idON DELETE CASCADE;


--
-- Name: item_dates fk_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_dates
    ADD CONSTRAINT fk_item FOREIGN KEY (item_idREFERENCES public.items(idON DELETE CASCADE;


--
-- Name: categories fk_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT fk_user FOREIGN KEY (user_idREFERENCES public.users(idON DELETE CASCADE;


--
-- Name: audit_log fk_user_audit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT fk_user_audit FOREIGN KEY (user_idREFERENCES public.users(idON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

