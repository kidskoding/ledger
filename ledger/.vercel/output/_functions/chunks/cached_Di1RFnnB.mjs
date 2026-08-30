import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
var pandas_default = {
	repo: "",
	generatedAt: "",
	prsAnalyzed: 0,
	events: [],
	contributors: [],
	cycles: [],
	correlation: {
		"rho": 0,
		"n": 0
	}
};
var ruff_default = {
	repo: "",
	generatedAt: "",
	prsAnalyzed: 0,
	events: [],
	contributors: [],
	cycles: [],
	correlation: {
		"rho": 0,
		"n": 0
	}
};
var next_default = {
	repo: "",
	generatedAt: "",
	prsAnalyzed: 0,
	events: [],
	contributors: [],
	cycles: [],
	correlation: {
		"rho": 0,
		"n": 0
	}
};
//#endregion
//#region src/pages/api/cached.ts
var cached_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var CACHED = {
	pandas: pandas_default,
	ruff: ruff_default,
	next: next_default
};
var GET = ({ url }) => {
	const slug = url.searchParams.get("repo") ?? "";
	const result = CACHED[slug];
	if (!result) return new Response(JSON.stringify({ error: `No cached result for "${slug}".` }), {
		status: 404,
		headers: { "Content-Type": "application/json" }
	});
	return new Response(JSON.stringify(result), { headers: {
		"Content-Type": "application/json",
		"Cache-Control": "public, max-age=60, stale-while-revalidate=300"
	} });
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/cached@_@ts
var page = () => cached_exports;
//#endregion
export { page };
