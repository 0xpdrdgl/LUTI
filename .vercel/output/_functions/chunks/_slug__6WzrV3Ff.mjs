import { r as __exportAll } from "./rolldown-runtime_BMI-E3GI.mjs";
import { C as createAstro, a as Fragment, c as renderSlot, d as renderTemplate, f as maybeRenderHead, h as createRenderInstruction, i as renderComponent, m as addAttribute, p as renderHead } from "./server_h4acONdI.mjs";
import { t as createComponent } from "./compiler_B26_S8Ob.mjs";
import { t as keystatic_config_default } from "./keystatic.config_i7dJ4Uyp.mjs";
import { createReader } from "@keystatic/core/reader";
//#region node_modules/.pnpm/astro@7.2.4_@emnapi+core@1._c0cf77203f2823e4c1ef3a1b572e8e7d/node_modules/astro/dist/runtime/server/render/script.js
async function renderScript(result, id) {
	const inlined = result.inlinedScripts.get(id);
	let content = "";
	if (inlined != null) {
		if (inlined) content = `<script type="module">${inlined}<\/script>`;
	} else {
		const resolved = await result.resolve(id);
		content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"><\/script>`;
	}
	return createRenderInstruction({
		type: "script",
		id,
		content
	});
}
//#endregion
//#region src/components/Header.astro
createAstro("https://astro.build");
var $$Header = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Header;
	const { brand = "LUIZA TINOCO", logo, topoTransparente = false } = Astro.props;
	const navLinks = [
		{
			href: "/",
			label: "Home"
		},
		{
			href: "/projetos",
			label: "Projetos"
		},
		{
			href: "/sobre",
			label: "Sobre"
		},
		{
			href: "/contato",
			label: "Contato"
		}
	];
	const path = Astro.url.pathname.replace(/\/$/, "") || "/";
	const isCurrent = (href) => href === "/" ? path === "/" : path.startsWith(href);
	return renderTemplate`${maybeRenderHead($$result)}<header${addAttribute(["header", {
		"header--topo-transparente": topoTransparente,
		"header--visible": !topoTransparente
	}], "class:list")} data-astro-cid-nen7h5rs><div class="container" data-astro-cid-nen7h5rs><a href="/" class="logo"${addAttribute(brand, "aria-label")} data-astro-cid-nen7h5rs>${logo ? renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result) => renderTemplate`<img${addAttribute(logo, "src")}${addAttribute(brand, "alt")} class="logo-img" data-astro-cid-nen7h5rs><img${addAttribute(logo.replace(/\.svg$/, "-branco.svg"), "src")} alt="" aria-hidden="true" class="logo-img logo-img--branca" data-astro-cid-nen7h5rs>` })}` : brand}</a><nav data-astro-cid-nen7h5rs>${navLinks.map((link) => renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute([
		"label",
		"nav-link",
		{ current: isCurrent(link.href) }
	], "class:list")}${addAttribute(isCurrent(link.href) ? "page" : void 0, "aria-current")} data-astro-cid-nen7h5rs>${link.label}</a>`)}</nav></div></header>`;
}, "C:/Users/User/Desktop/Portfolio arquitetura/src/components/Header.astro", void 0);
//#endregion
//#region src/components/Footer.astro
createAstro("https://astro.build");
var $$Footer = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Footer;
	const { brand, copyright, links, logo } = Astro.props;
	const year = (/* @__PURE__ */ new Date()).getFullYear();
	const copyrightTexto = copyright?.replace("{ano}", String(year)) ?? "";
	return renderTemplate`${maybeRenderHead($$result)}<footer class="footer" data-astro-cid-jo6i4kqk><div class="container" data-astro-cid-jo6i4kqk>${logo ? renderTemplate`<img${addAttribute(logo, "src")}${addAttribute(brand, "alt")} class="brand-img" data-astro-cid-jo6i4kqk>` : renderTemplate`<span class="label brand" data-astro-cid-jo6i4kqk>${brand}</span>`}<p class="copyright" data-astro-cid-jo6i4kqk>${copyrightTexto}</p><div class="social" data-astro-cid-jo6i4kqk>${(links ?? []).map((link) => renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute(link.href.startsWith("http") ? "_blank" : void 0, "target")}${addAttribute(link.href.startsWith("http") ? "noopener noreferrer" : void 0, "rel")} class="label" data-astro-cid-jo6i4kqk>${link.label}</a>`)}</div></div></footer>`;
}, "C:/Users/User/Desktop/Portfolio arquitetura/src/components/Footer.astro", void 0);
//#endregion
//#region node_modules/.pnpm/astro@7.2.4_@emnapi+core@1._c0cf77203f2823e4c1ef3a1b572e8e7d/node_modules/astro/components/ClientRouter.astro
createAstro("https://astro.build");
var $$ClientRouter = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ClientRouter;
	const { fallback = "animate" } = Astro.props;
	return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>${renderScript($$result, "C:/Users/User/Desktop/Portfolio arquitetura/node_modules/.pnpm/astro@7.2.4_@emnapi+core@1._c0cf77203f2823e4c1ef3a1b572e8e7d/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/User/Desktop/Portfolio arquitetura/node_modules/.pnpm/astro@7.2.4_@emnapi+core@1._c0cf77203f2823e4c1ef3a1b572e8e7d/node_modules/astro/components/ClientRouter.astro", void 0);
//#endregion
//#region src/layouts/BaseLayout.astro
createAstro("https://astro.build");
var $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$BaseLayout;
	const { title, description = "Portfólio de arquitetura — Luiza Tinoco" } = Astro.props;
	return renderTemplate`<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"${addAttribute(description, "content")}><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro.generator, "content")}><title>${title}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap">${renderComponent($$result, "ClientRouter", $$ClientRouter, {})}<script>
      document.documentElement.classList.add('js');
    <\/script>${renderHead($$result)}</head><body><a href="#main" class="skip-link">Pular para o conteúdo</a>${renderSlot($$result, $$slots["default"])}${renderScript($$result, "C:/Users/User/Desktop/Portfolio arquitetura/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts")}</body></html>`;
}, "C:/Users/User/Desktop/Portfolio arquitetura/src/layouts/BaseLayout.astro", void 0);
//#endregion
//#region src/lib/images.ts
function assetSrc(value, base) {
	if (!value) return null;
	return value.startsWith("/") ? value : `${base}${value}`;
}
var projetosImage = (value) => assetSrc(value, "/images/projetos/");
var siteImage = (value) => assetSrc(value, "/images/");
//#endregion
//#region src/layouts/PageLayout.astro
createAstro("https://astro.build");
var $$PageLayout = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$PageLayout;
	const { title, description, fullBleed = false } = Astro.props;
	const site = await createReader(process.cwd(), keystatic_config_default).singletons.site.read();
	const logo = siteImage(site?.logo);
	return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, {
		"title": title,
		"description": description,
		"data-astro-cid-xa52sxzc": true
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "Header", $$Header, {
		"brand": site?.brand ?? "LUIZA TINOCO",
		"logo": logo,
		"topoTransparente": fullBleed,
		"data-astro-cid-xa52sxzc": true
	})}${maybeRenderHead($$result)}<main id="main"${addAttribute({ "com-header": !fullBleed }, "class:list")} data-astro-cid-xa52sxzc>${renderSlot($$result, $$slots["default"])}</main>${renderComponent($$result, "Footer", $$Footer, {
		"brand": site?.brand ?? "LUIZA TINOCO",
		"copyright": site?.copyright ?? "",
		"links": site?.links ?? [],
		"logo": logo,
		"data-astro-cid-xa52sxzc": true
	})}` })}`;
}, "C:/Users/User/Desktop/Portfolio arquitetura/src/layouts/PageLayout.astro", void 0);
//#endregion
//#region src/pages/projetos/[slug].astro
var _slug__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Slug,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Slug = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Slug;
	const slug = Astro.params.slug;
	const reader = createReader(process.cwd(), keystatic_config_default);
	const [pagina, projeto] = await Promise.all([reader.singletons.paginaProjetos.read(), reader.collections.projetos.read(slug)]);
	if (!projeto) return Astro.redirect("/projetos");
	const categoriaLabel = pagina?.filtros?.find((f) => f.slug === projeto.categoria)?.label ?? projeto.categoria;
	const capa = projetosImage(projeto.capa);
	const galeria = (projeto.galeria ?? []).map((img) => projetosImage(img));
	const paragrafos = (projeto.descricao ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
	return renderTemplate`${renderComponent($$result, "PageLayout", $$PageLayout, {
		"title": `${projeto.titulo} — LUIZA TINOCO`,
		"description": projeto.resumo,
		"data-astro-cid-dj4s2q7n": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<article class="projeto-detalhe" data-astro-cid-dj4s2q7n><header class="projeto-header" data-astro-cid-dj4s2q7n><div class="projeto-meta" data-astro-cid-dj4s2q7n><span class="label" data-astro-cid-dj4s2q7n>${categoriaLabel}</span><span class="label" data-astro-cid-dj4s2q7n>${projeto.ano}</span>${projeto.local && renderTemplate`<span class="label" data-astro-cid-dj4s2q7n>${projeto.local}</span>`}</div><h1 data-astro-cid-dj4s2q7n>${projeto.titulo}</h1><p class="projeto-resumo" data-astro-cid-dj4s2q7n>${projeto.resumo}</p></header><div class="projeto-galeria" data-astro-cid-dj4s2q7n>${capa && renderTemplate`<figure class="projeto-capa" data-astro-cid-dj4s2q7n><img${addAttribute(capa, "src")}${addAttribute(projeto.titulo, "alt")} data-astro-cid-dj4s2q7n></figure>`}${galeria.length > 0 && renderTemplate`<div class="projeto-thumbs" data-astro-cid-dj4s2q7n>${galeria.map((img, i) => renderTemplate`<figure class="projeto-thumb" data-astro-cid-dj4s2q7n><img${addAttribute(img, "src")}${addAttribute(`${projeto.titulo} - vista ${i + 1}`, "alt")} data-astro-cid-dj4s2q7n></figure>`)}</div>`}</div>${paragrafos.length > 0 && renderTemplate`<div class="projeto-descricao" data-astro-cid-dj4s2q7n>${paragrafos.map((paragrafo) => renderTemplate`<p data-astro-cid-dj4s2q7n>${paragrafo}</p>`)}</div>`}</article>` })}`;
}, "C:/Users/User/Desktop/Portfolio arquitetura/src/pages/projetos/[slug].astro", void 0);
var $$file = "C:/Users/User/Desktop/Portfolio arquitetura/src/pages/projetos/[slug].astro";
var $$url = "/projetos/[slug]";
//#endregion
//#region \0virtual:astro:page:src/pages/projetos/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };
