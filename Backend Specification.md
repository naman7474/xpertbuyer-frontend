1 Purpose

The document explains what the backend must do, why each capability matters for user value or business goals, and how to implement it at an MVP level.

2 High‑Level Architecture (What & Why)

Layer

Responsibility (What)

Rationale (Why)

API Gateway / BFF

Single entry point (/api/**) for the web‑app; handles auth, rate‑limits, CORS

Decouples UI from internal services; enables mobile & desktop to share the same APIs

Query Orchestrator

Turns a natural‑language search into structured retrieval steps (concern → ingredients → products)

Encapsulates all AI logic; keeps prompt engineering & ranking isolated from HTTP plumbing

Gemini LLM Adapter

Wraps Google Gemini API + function‑calling schema

Allows deterministic, structured outputs; swap LLM without touching orchestrator

Ingredient Service

CRUD & search over ingredient metadata (benefits, safety flags, aliases)

Guarantees medically grounded suggestions & descriptions

Product Search & Ranking

SQL/Vector search + scoring pipeline; returns ranked products

Provides fast, relevant, trust‑weighted results

Content Service

Serves PDP payloads (full ingredients list, influencer videos, reviews)

Keeps PDP responsive; caches heavy text / video metadata

Data Store

PostgreSQL 15 + pgvector; Redis for hot cache

Relational integrity for products & joins; vector ops for semantic look‑ups


Deployment note   All stateless services (Gateway, Orchestrator, Content) containerised (Docker) behind a single load balancer; supabase database. 


3 Data Model Additions (How)

Existing tables → products, yt_videos, product_video_mention.

3.1 ingredients 

CREATE TABLE ingredients (
  id               SERIAL PRIMARY KEY,
  display_name     TEXT NOT NULL,
  inci_name        TEXT,
  benefit_summary  TEXT,
  concern_tags     TEXT[],   -- e.g. ['brightening','anti_acne']
  safety_rating    TEXT,     -- e.g. 'safe', 'allergen', 'unknown'
  is_hero          BOOLEAN DEFAULT FALSE,
  search_vector    tsvector  -- for Postgres full‑text
);

3.2 product_ingredients (join)

CREATE TABLE product_ingredients (
  product_id TEXT REFERENCES products(product_id),
  ingredient_id INT REFERENCES ingredients(id),
  position SMALLINT,    -- order in INCI list
  PRIMARY KEY (product_id, ingredient_id)
);

4 Key APIs (What & How)

4.1 POST /api/itinerary

Body   : { "query": "best sunscreen for office" }
Returns: {
  "concern": "Sun protection",
  "ingredients": ["Zinc Oxide","Uvinul A Plus"],
  "products": [ {id, name, hero_ingredients, price, rating, img_url}, ... ],
  "theory": "you should look for these ingredinet"
  "llm_trace_id": "<uuid>"    // for observability
}

Flow: Gateway → Orchestrator → Gemini Adapter → Ingredient Service (validation) → Product Search & Ranking → response.

4.2 GET /api/products?ids=...

Batch fetch for results grid.

4.3 GET /api/product/:id

Full PDP payload <1 MB incl. video array + ingredient bullets.

4.4 GET /api/compare?ids=a,b,c

Returns aligned attribute matrix (price, rating, hero ingredients, unique ingredients, video_count).

All endpoints JSON;  validate with pydantic.


5 Gemini Prompt & Function Calling (How)

SYSTEM: You are SkinGuru, a dermatologist‑level assistant. Always ground advice in the ingredient DB provided via tools.
USER: ${userQuery}
TOOLS:
  lookup_ingredients_by_concern(concern): returns [{display_name, efficacy_rank}]
  list_concerns(): returns array of known concerns
ASSISTANT: 1) identify concern; 2) call lookup_ingredients_by_concern; 3) respond with JSON {
  concern: <string>,
  ingredients: [<display_name>...],
  filters: {}
}

Why: keeps hallucination risk low; guarantees ingredient names exist in DB; structured JSON parsed by Go/Node orchestrator.

6 Product Retrieval & MVP Scoring (How)

-- candidate set
SELECT p.*,
  (SELECT count(*) FROM product_ingredients pi
     JOIN ingredients i USING(ingredient_id)
     WHERE pi.product_id = p.product_id
       AND i.display_name = ANY($1) ) AS match_cnt,
  (SELECT avg_rating FROM ratings WHERE product_id=p.product_id) AS rating,
  (SELECT count(*) FROM product_video_mention WHERE product_id=p.product_id) AS vid_cnt
FROM products p
WHERE p.product_type = COALESCE($2, p.product_type)
  AND EXISTS (
    SELECT 1 FROM product_ingredients pi
     JOIN ingredients i USING(ingredient_id)
     WHERE pi.product_id=p.product_id
       AND i.display_name = ANY($1)
  );

8 Security & Compliance (What & Why)

Rate‑limit POST /api/itinerary → 10 req/min/IP (protect LLM quota)

Input sanitization – strip HTML, limit length ≤ 200 chars

HTTPS everywhere – HSTS, TLS 1.3

PII – none stored (no user accounts in MVP)

Logging – redact query text in production analytics if necessary


