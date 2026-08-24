import { collection, config, fields, singleton } from "@keystatic/core";
//#region keystatic.config.ts
var projetosImage = {
	directory: "public/images/projetos",
	publicPath: "/images/projetos/"
};
var keystatic_config_default = config({
	storage: { kind: "local" },
	collections: { projetos: collection({
		label: "Projetos",
		slugField: "titulo",
		path: "content/projetos/*/",
		format: { data: "yaml" },
		schema: {
			titulo: fields.slug({ name: { label: "Título" } }),
			categoria: fields.select({
				label: "Categoria",
				options: [
					{
						label: "Interiores",
						value: "interiores"
					},
					{
						label: "Design de Mobiliário",
						value: "mobiliario"
					},
					{
						label: "Projetos Residenciais",
						value: "residenciais"
					},
					{
						label: "Comercial",
						value: "comercial"
					}
				],
				defaultValue: "interiores"
			}),
			ano: fields.number({ label: "Ano" }),
			local: fields.text({ label: "Local (ex.: São Paulo, SP)" }),
			resumo: fields.text({
				label: "Resumo",
				multiline: true
			}),
			descricao: fields.text({
				label: "Descrição (corpo do projeto)",
				multiline: true
			}),
			capa: fields.image({
				label: "Imagem de capa",
				...projetosImage
			}),
			galeria: fields.array(fields.image({
				label: "Imagem",
				...projetosImage
			}), {
				label: "Galeria",
				itemLabel: () => "Imagem"
			}),
			destaque: fields.checkbox({
				label: "Destacar na home",
				defaultValue: false
			})
		}
	}) },
	singletons: {
		site: singleton({
			label: "Site (footer e marca)",
			path: "content/site/",
			format: { data: "yaml" },
			schema: {
				brand: fields.text({ label: "Nome da marca" }),
				logo: fields.image({
					label: "Logo (opcional — substitui o texto no header e footer)",
					directory: "public/images",
					publicPath: "/images/"
				}),
				copyright: fields.text({ label: "Texto de copyright" }),
				links: fields.array(fields.object({
					label: fields.text({ label: "Texto do link" }),
					href: fields.text({ label: "URL" })
				}), {
					label: "Links do footer",
					itemLabel: (props) => props.fields.label.value || "Link"
				})
			}
		}),
		home: singleton({
			label: "Home",
			path: "content/home/",
			format: { data: "yaml" },
			schema: {
				heroImagem: fields.image({
					label: "Hero — imagem de fundo",
					directory: "public/images",
					publicPath: "/images/"
				}),
				heroTitulo: fields.text({
					label: "Hero — título",
					multiline: true
				}),
				heroBotaoLabel: fields.text({ label: "Hero — botão (texto)" }),
				heroBotaoHref: fields.text({ label: "Hero — botão (link)" }),
				sobreTitulo: fields.text({ label: "Sobre a autora — título" }),
				sobreFoto: fields.image({
					label: "Sobre a autora — foto",
					directory: "public/images",
					publicPath: "/images/"
				}),
				sobreParagrafos: fields.array(fields.text({
					label: "Parágrafo",
					multiline: true
				}), {
					label: "Sobre a autora — textos",
					itemLabel: (props) => props.value ? `${props.value.slice(0, 32)}…` : "Parágrafo"
				}),
				sobreLinkLabel: fields.text({ label: "Sobre a autora — link (texto)" }),
				sobreLinkHref: fields.text({ label: "Sobre a autora — link (URL)" }),
				ctaTitulo: fields.text({
					label: "CTA — título",
					multiline: true
				}),
				ctaLinkLabel: fields.text({ label: "CTA — link (texto)" }),
				ctaLinkHref: fields.text({ label: "CTA — link (URL)" })
			}
		}),
		paginaProjetos: singleton({
			label: "Página Projetos",
			path: "content/pagina-projetos/",
			format: { data: "yaml" },
			schema: {
				titulo: fields.text({ label: "Título" }),
				descricao: fields.text({
					label: "Descrição",
					multiline: true
				}),
				filtros: fields.array(fields.object({
					label: fields.text({ label: "Nome exibido" }),
					slug: fields.text({ label: "Slug (deve corresponder à categoria do projeto)" })
				}), {
					label: "Categorias (filtros)",
					itemLabel: (props) => props.fields.label.value || "Filtro"
				}),
				moodboardTitulo: fields.text({
					label: "Moodboard — título",
					multiline: true
				}),
				moodboardTexto: fields.text({
					label: "Moodboard — texto",
					multiline: true
				}),
				moodboardBotao: fields.text({ label: "Moodboard — botão (texto)" }),
				moodboardImagem1: fields.image({
					label: "Moodboard — imagem grande",
					...projetosImage
				}),
				moodboardImagem2: fields.image({
					label: "Moodboard — imagem sobreposta",
					...projetosImage
				})
			}
		}),
		paginaContato: singleton({
			label: "Página Contato",
			path: "content/pagina-contato/",
			format: { data: "yaml" },
			schema: {
				tituloLinha1: fields.text({ label: "Título — primeira linha" }),
				tituloLinha2: fields.text({ label: "Título — segunda linha (a última palavra fica em itálico)" }),
				lead: fields.text({
					label: "Texto principal",
					multiline: true
				}),
				links: fields.array(fields.object({
					label: fields.text({ label: "Rótulo (texto pequeno)" }),
					valor: fields.text({ label: "Texto do link" }),
					href: fields.text({ label: "URL" }),
					icone: fields.select({
						label: "Ícone",
						options: [
							{
								label: "WhatsApp",
								value: "whatsapp"
							},
							{
								label: "Instagram",
								value: "instagram"
							},
							{
								label: "E-mail",
								value: "email"
							}
						],
						defaultValue: "whatsapp"
					})
				}), {
					label: "Links diretos",
					itemLabel: (props) => props.fields.valor.value || "Link"
				}),
				formTitulo: fields.text({ label: "Formulário — título" }),
				formEndpoint: fields.text({ label: "Formulário — endpoint de envio (ex.: Formspree)" }),
				nomeLabel: fields.text({ label: "Campo nome — rótulo" }),
				nomePlaceholder: fields.text({ label: "Campo nome — placeholder" }),
				emailLabel: fields.text({ label: "Campo e-mail — rótulo" }),
				emailPlaceholder: fields.text({ label: "Campo e-mail — placeholder" }),
				mensagemLabel: fields.text({ label: "Campo mensagem — rótulo" }),
				mensagemPlaceholder: fields.text({ label: "Campo mensagem — placeholder" }),
				botaoTexto: fields.text({ label: "Botão de envio — texto" })
			}
		}),
		paginaSobre: singleton({
			label: "Página Sobre",
			path: "content/pagina-sobre/",
			format: { data: "yaml" },
			schema: {
				tituloPrincipal: fields.text({ label: "Título — parte normal" }),
				tituloItalico: fields.text({ label: "Título — parte em itálico" }),
				lead: fields.text({
					label: "Texto principal",
					multiline: true
				}),
				nota: fields.text({
					label: "Texto secundário",
					multiline: true
				}),
				retrato: fields.image({
					label: "Retrato",
					directory: "public/images",
					publicPath: "/images/"
				}),
				visaoLabel: fields.text({ label: "Visão — label" }),
				visaoTitulo: fields.text({
					label: "Visão — título",
					multiline: true
				}),
				visaoQuote: fields.text({
					label: "Visão — citação",
					multiline: true
				})
			}
		})
	}
});
//#endregion
export { keystatic_config_default as t };
