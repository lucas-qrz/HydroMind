import Link from "next/link";
import CasaInterativa from "./_componentes/CasaInterativa";
import Abas from "./_componentes/Abas";
import { Revelar } from "./_componentes/Revelar";
import {
  IconeAmbiente,
  IconeCasa,
  IconeCheck,
  IconeConta,
  IconeEmpresa,
  IconeEscola,
  IconeEscudo,
  IconeGota,
  IconeInteligencia,
  IconePlay,
  IconePredio,
  IconeRelatorio,
  IconeSeta,
  IconeSino,
} from "./_componentes/icones";

/*
 * Landing page do Água Alerta.
 *
 * Regra editorial: nenhum número. Sem estatística de mercado, sem dado de
 * terceiros, sem valor estimado. O convencimento vem do texto e da
 * demonstração do produto — principalmente da casa 3D da abertura.
 */

const FAIXA = [
  "Monitoramento contínuo",
  "Alertas imediatos",
  "Instalação simples",
  "Baixa manutenção",
  "Consumo por ambiente",
  "Conta sem surpresa",
];

const ESCONDERIJOS = [
  {
    Icone: IconeAmbiente,
    titulo: "Atrás da parede",
    texto: "Um cano que cede devagar e só aparece quando a mancha surge.",
  },
  {
    Icone: IconeGota,
    titulo: "Na descarga",
    texto: "Uma vedação gasta que deixa a água correr dia e noite, sem barulho.",
  },
  {
    Icone: IconeCasa,
    titulo: "Na caixa d'água",
    texto: "Uma boia travada que transborda enquanto ninguém está olhando.",
  },
];

const PASSOS = [
  {
    Icone: IconeCheck,
    titulo: "Instale",
    texto: "Sensores compactos na rede hidráulica, com configuração simples.",
    fundo: "bg-agua-fundo text-agua",
  },
  {
    Icone: IconeInteligencia,
    titulo: "Aprenda",
    texto: "A inteligência aprende o ritmo de consumo de cada ambiente.",
    fundo: "bg-bom-fundo text-bom",
  },
  {
    Icone: IconeSino,
    titulo: "Aja",
    texto: "Ao primeiro sinal fora do normal, o alerta chega no seu celular.",
    fundo: "bg-alerta-fundo text-alerta",
  },
];

const PUBLICOS = [
  {
    Icone: IconeCasa,
    titulo: "Residências",
    texto: "Tranquilidade para a família, mesmo quando ninguém está em casa.",
  },
  {
    Icone: IconePredio,
    titulo: "Condomínios",
    texto: "Controle por bloco, unidade e área comum. Informação pronta para a assembleia.",
  },
  {
    Icone: IconeEmpresa,
    titulo: "Empresas",
    texto: "Custo operacional sob controle e compromisso visível com a sustentabilidade.",
  },
  {
    Icone: IconeEscola,
    titulo: "Escolas",
    texto: "Proteção do patrimônio e uma lição prática de uso consciente da água.",
  },
];

const PLANOS = [
  {
    nome: "Residencial",
    para: "Para casas e apartamentos",
    itens: [
      "Sensores para os principais ambientes",
      "Alertas de vazamento no celular",
      "Estimativa da conta em tempo real",
      "Relatório mensal de consumo",
    ],
    destaque: false,
  },
  {
    nome: "Condomínio",
    para: "Para síndicos e administradoras",
    itens: [
      "Monitoramento por bloco, unidade e área comum",
      "Painel de gestão para o síndico",
      "Alertas direcionados ao responsável",
      "Relatórios prontos para assembleia",
      "Suporte dedicado",
    ],
    destaque: true,
  },
  {
    nome: "Empresas e Escolas",
    para: "Para operações com vários setores",
    itens: [
      "Monitoramento por setor e por prédio",
      "Múltiplos responsáveis e permissões",
      "Relatórios de sustentabilidade",
      "Implantação acompanhada",
    ],
    destaque: false,
  },
];

const PERGUNTAS = [
  {
    p: "Como o Água Alerta descobre um vazamento?",
    r: "Ele aprende o padrão normal de consumo do imóvel e identifica o que foge desse padrão: água correndo sem interrupção, consumo durante a madrugada e picos fora do comum.",
  },
  {
    p: "Consigo saber onde está o vazamento?",
    r: "Sim. Com sensores por ambiente, o painel mostra em qual cômodo, bloco ou setor o consumo anormal está acontecendo — o que economiza tempo de busca e de manutenção.",
  },
  {
    p: "Como recebo os avisos?",
    r: "Pelo aplicativo, com notificação no celular assim que a anomalia é identificada. No condomínio, o alerta chega ao responsável certo.",
  },
  {
    p: "Funciona em condomínios e empresas?",
    r: "Sim. O sistema foi pensado para ambientes com vários usuários e responsáveis, com visão separada por bloco, unidade, área comum ou setor.",
  },
  {
    p: "Meus dados estão seguros?",
    r: "Os dados são protegidos com criptografia e tratados de acordo com a Lei Geral de Proteção de Dados (LGPD).",
  },
  {
    p: "Como funciona a contratação?",
    r: "Você adquire os sensores e assina o serviço de monitoramento. Cada proposta é montada de acordo com o tamanho e o tipo do imóvel.",
  },
];

const SOMBRA_SUAVE = "shadow-[0_18px_40px_-18px_rgba(6,24,43,0.35)]";

export default function Site() {
  return (
    <div className="bg-fundo text-tinta flex-1">
      <Navegacao />

      {/* ============ ABERTURA ============ */}
      <section className="relative overflow-hidden">
        {/* Disco e esferas decorativas atrás da casa */}
        <div
          aria-hidden
          className="absolute right-[-12%] top-[6%] w-[720px] h-[720px] rounded-full bg-agua-fundo hidden lg:block"
        />
        <Esfera className="left-[46%] top-[18%] w-6 h-6 hidden lg:block" cor="var(--agua)" atraso="0s" />
        <Esfera className="right-[6%] top-[12%] w-10 h-10 hidden lg:block" cor="var(--bom)" atraso="-2s" />
        <Esfera className="right-[4%] bottom-[30%] w-7 h-7 hidden lg:block" cor="#ffffff" atraso="-4s" />
        <Esfera className="left-[47%] top-[62%] w-4 h-4 hidden lg:block" cor="var(--alerta)" atraso="-1s" />

        <div className="relative mx-auto max-w-[1240px] px-6 pt-10 pb-16 lg:pt-16 lg:pb-24 grid gap-10 lg:grid-cols-[1fr_1.05fr] items-center">
          <div>
            <div className="animar-entrar">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-linha bg-superficie px-4 py-2 text-[0.82rem] font-medium text-tinta-2 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-agua animate-ping opacity-70" />
                  <span className="relative h-2 w-2 rounded-full bg-agua" />
                </span>
                Monitoramento inteligente de água
              </span>
            </div>

            <TituloAbertura
              className="titulo text-[clamp(2.4rem,4.4vw,3.75rem)] mt-7"
              partes={[
                { texto: "O vazamento que você não vê," },
                // Espaço não separável: o "a" nunca fica sozinho no fim da linha.
                { texto: "a gente encontra.", destaque: true },
              ]}
            />

            <div className="animar-entrar" style={{ animationDelay: "0.55s" }}>
              <p className="text-tinta-2 text-[1.12rem] leading-relaxed mt-6 max-w-[44ch]">
                Sensores inteligentes em cada ambiente e um painel em tempo real que
                avisam na hora certa e mostram exatamente para onde a água está indo.
              </p>
            </div>

            <div className="animar-entrar" style={{ animationDelay: "0.7s" }}>
              <div className="flex flex-wrap gap-3 mt-9">
                <Link
                  href="/painel"
                  className="inline-flex items-center gap-2 rounded-full bg-agua px-7 py-3.5 font-semibold text-white shadow-[0_12px_30px_-10px_var(--agua)] hover:-translate-y-0.5 transition"
                >
                  Ver demonstração <IconeSeta className="w-4 h-4" />
                </Link>
                <a
                  href="#planos"
                  className="inline-flex items-center rounded-full bg-superficie-2 px-7 py-3.5 font-semibold text-tinta hover:bg-linha transition"
                >
                  Conhecer os planos
                </a>
              </div>
            </div>

            <div className="animar-entrar" style={{ animationDelay: "0.85s" }}>
              <a
                href="#problema"
                className="hidden lg:inline-flex items-center gap-3 mt-16 text-[0.85rem] text-tinta-3 hover:text-tinta-2 transition"
              >
                <span className="grid place-items-center w-8 h-8 rounded-full bg-superficie-2">
                  <IconeSeta className="w-3.5 h-3.5 rotate-90 animar-quicar" />
                </span>
                Role para conhecer
              </a>
            </div>
          </div>

          <div className="animar-entrar" style={{ animationDelay: "0.3s" }}>
            <CasaInterativa />
          </div>
        </div>
      </section>

      {/* ============ FAIXA EM MOVIMENTO ============ */}
      <div className="escuro bg-fundo text-tinta overflow-hidden border-y border-linha" aria-label="Pilares do Água Alerta">
        <div className="flex w-max animar-rolar">
          {[...FAIXA, ...FAIXA].map((item, i) => (
            <span
              key={i}
              aria-hidden={i >= FAIXA.length}
              className="flex items-center gap-6 px-6 py-5 text-[1.05rem] font-semibold whitespace-nowrap"
              style={{ fontStretch: "110%" }}
            >
              {item}
              <IconeGota className="w-4 h-4 text-agua" />
            </span>
          ))}
        </div>
      </div>

      {/* ============ PROBLEMA ============ */}
      <section id="problema" className="mx-auto max-w-[1240px] px-6 py-28 scroll-mt-20">
        <Revelar className="text-center">
          <p className="rotulo text-agua">O problema</p>
          <h2 className="titulo text-[clamp(2rem,4.6vw,3.6rem)] mt-5 max-w-[18ch] mx-auto">
            Vazamento silencioso não avisa.{" "}
            <span className="text-tinta-3">Ele aparece na conta.</span>
          </h2>
        </Revelar>

        <div className="grid gap-6 md:grid-cols-3 mt-16">
          {ESCONDERIJOS.map(({ Icone, titulo, texto }, i) => (
            <Revelar key={titulo} atraso={i * 0.1}>
              <div className="h-full rounded-3xl border border-linha bg-superficie p-8 hover:-translate-y-1 hover:shadow-lg transition duration-300">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-superficie-2 text-tinta">
                  <Icone className="w-6 h-6" />
                </span>
                <h3 className="font-bold text-[1.15rem] mt-6">{titulo}</h3>
                <p className="text-tinta-2 leading-relaxed mt-2">{texto}</p>
              </div>
            </Revelar>
          ))}
        </div>

        <Revelar className="text-center mt-14">
          <p className="text-[1.15rem] font-semibold">
            O Água Alerta muda essa ordem. <span className="text-agua">Você fica sabendo primeiro.</span>
          </p>
        </Revelar>
      </section>

      {/* ============ RECURSOS ============ */}
      <section id="recursos" className="border-t border-linha scroll-mt-20">
        <div className="mx-auto max-w-[1240px] px-6 py-28">
          <Revelar>
            <Cabecalho
              rotulo="Recursos"
              titulo="Tudo o que você precisa para cuidar da água"
              texto="Sensores, aplicativo e inteligência trabalhando juntos, sem você precisar vigiar nada."
            />
          </Revelar>

          <div className="grid gap-6 md:grid-cols-3 mt-14">
            <Revelar>
              <CartaoRecurso
                fundo="bg-agua-fundo"
                titulo="Alertas no celular"
                texto="O imóvel avisa você na hora, onde você estiver."
              >
                <div className={`animar-notificacao flex items-center gap-3 rounded-full bg-superficie pl-2 pr-5 py-2 ${SOMBRA_SUAVE}`}>
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-critico-fundo text-critico">
                    <IconeSino className="w-4 h-4" />
                  </span>
                  <span className="text-[0.88rem] font-semibold">Possível vazamento</span>
                </div>
              </CartaoRecurso>
            </Revelar>
            <Revelar atraso={0.1}>
              <CartaoRecurso
                fundo="bg-bom-fundo"
                titulo="Conta sem surpresa"
                texto="Acompanhe o consumo e saiba como o mês vai fechar."
              >
                <div className={`w-[220px] rounded-full bg-superficie px-5 py-4 ${SOMBRA_SUAVE}`}>
                  <div className="h-2.5 rounded-full bg-superficie-2 overflow-hidden">
                    <div className="h-full rounded-full bg-bom animar-encher" />
                  </div>
                </div>
              </CartaoRecurso>
            </Revelar>
            <Revelar atraso={0.2}>
              <CartaoRecurso
                fundo="bg-alerta-fundo"
                titulo="Consumo por ambiente"
                texto="Descubra qual cômodo, bloco ou setor gasta mais."
              >
                <div className={`flex items-center gap-2 rounded-full bg-superficie p-2 ${SOMBRA_SUAVE}`}>
                  {["Cozinha", "Banho", "Jardim"].map((a, i) => (
                    <span
                      key={a}
                      className={`rounded-full px-3 py-1.5 text-[0.8rem] font-semibold ${
                        i === 1 ? "bg-alerta text-white animar-piscar" : "text-tinta-2"
                      }`}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </CartaoRecurso>
            </Revelar>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 mt-16 pt-12 border-t border-linha">
            {[
              { Icone: IconeRelatorio, titulo: "Relatórios claros", texto: "Histórico organizado para decidir com segurança." },
              { Icone: IconeInteligencia, titulo: "Inteligência artificial", texto: "Padrões anormais reconhecidos automaticamente." },
              { Icone: IconeConta, titulo: "Instalação simples", texto: "Sensores compactos e de baixa manutenção." },
            ].map(({ Icone, titulo, texto }, i) => (
              <Revelar key={titulo} atraso={i * 0.08}>
                <div className="flex gap-4">
                  <span className="grid place-items-center w-11 h-11 shrink-0 rounded-xl bg-agua-fundo text-agua">
                    <Icone className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold">{titulo}</h3>
                    <p className="text-tinta-2 text-[0.95rem] mt-1">{texto}</p>
                  </div>
                </div>
              </Revelar>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ABAS ============ */}
      <section className="bg-superficie-2 border-y border-linha">
        <div className="mx-auto max-w-[1240px] px-6 py-28">
          <Revelar className="text-center">
            <p className="rotulo text-agua">Na prática</p>
            <h2 className="titulo-md text-[clamp(1.9rem,3.8vw,2.9rem)] mt-4">
              Detectar, localizar, economizar.
            </h2>
          </Revelar>
          <Revelar atraso={0.1} className="mt-12">
            <Abas />
          </Revelar>
        </div>
      </section>

      {/* ============ COMO FUNCIONA ============ */}
      <section id="como-funciona" className="mx-auto max-w-[1240px] px-6 py-28 scroll-mt-20">
        <Revelar className="text-center">
          <h2 className="titulo-md text-[clamp(1.9rem,3.8vw,2.9rem)]">Descubra como funciona</h2>
        </Revelar>

        <Revelar atraso={0.1} className="mt-12">
          <div className="grid lg:grid-cols-2 rounded-[2rem] border border-linha bg-superficie overflow-hidden">
            <div className="p-10 sm:p-14 flex flex-col justify-between gap-12 bg-superficie-2">
              <div>
                <h3 className="titulo text-[clamp(2rem,4vw,3rem)]">
                  Instale.
                  <br />
                  Aprenda.
                  <br />
                  <span className="text-agua">Aja.</span>
                </h3>
                <p className="text-tinta-2 text-[1.05rem] leading-relaxed mt-6 max-w-[38ch]">
                  Do primeiro sensor ao primeiro alerta, sem obra de cabeça quebrada e sem
                  precisar entender de hidráulica.
                </p>
              </div>
              <Link href="/painel" className="group inline-flex items-center gap-4 w-fit">
                <span className="grid place-items-center w-14 h-14 rounded-full bg-agua text-white shadow-[0_12px_30px_-10px_var(--agua)] group-hover:scale-105 transition">
                  <IconePlay className="w-5 h-5 ml-0.5" />
                </span>
                <span className="font-semibold">Ver o painel funcionando</span>
              </Link>
            </div>

            <ol className="p-6 sm:p-10 flex flex-col">
              {PASSOS.map(({ Icone, titulo, texto, fundo }, i) => (
                <li
                  key={titulo}
                  className={`flex items-center justify-between gap-6 py-7 ${
                    i < PASSOS.length - 1 ? "border-b border-linha" : ""
                  }`}
                >
                  <div>
                    <span className="rotulo text-tinta-3">Passo {i + 1}</span>
                    <h4 className="font-bold text-[1.2rem] mt-1.5">{titulo}</h4>
                    <p className="text-tinta-2 mt-1 max-w-[34ch]">{texto}</p>
                  </div>
                  <span className={`grid place-items-center w-14 h-14 shrink-0 rounded-2xl ${fundo}`}>
                    <Icone className="w-6 h-6" />
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Revelar>
      </section>

      {/* ============ PARA QUEM ============ */}
      <section id="para-quem" className="border-t border-linha scroll-mt-20">
        <div className="mx-auto max-w-[1240px] px-6 py-28">
          <Revelar>
            <Cabecalho rotulo="Para quem" titulo="Feito para cada tipo de imóvel" />
          </Revelar>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-14">
            {PUBLICOS.map(({ Icone, titulo, texto }, i) => (
              <Revelar key={titulo} atraso={i * 0.08}>
                <div className="group h-full rounded-3xl border border-linha bg-superficie p-7 hover:border-agua hover:-translate-y-1 hover:shadow-lg transition duration-300">
                  <span className="grid place-items-center w-12 h-12 rounded-2xl bg-agua-fundo text-agua group-hover:bg-agua group-hover:text-white transition">
                    <Icone className="w-6 h-6" />
                  </span>
                  <h3 className="titulo-md text-[1.3rem] mt-6">{titulo}</h3>
                  <p className="text-tinta-2 text-[0.95rem] leading-relaxed mt-2">{texto}</p>
                </div>
              </Revelar>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EM AÇÃO ============ */}
      <section className="escuro bg-fundo text-tinta relative overflow-hidden">
        <Esfera className="left-[4%] top-[14%] w-8 h-8" cor="var(--agua)" atraso="-3s" />
        <Esfera className="right-[46%] bottom-[10%] w-5 h-5" cor="var(--bom)" atraso="-1s" />
        <div className="relative mx-auto max-w-[1240px] px-6 py-28 grid gap-14 lg:grid-cols-2 items-center">
          <Revelar>
            <p className="rotulo text-agua">O produto em ação</p>
            <h2 className="titulo-md text-[clamp(1.9rem,3.8vw,2.9rem)] mt-4">
              Tudo o que importa, em uma tela.
            </h2>
            <p className="text-tinta-2 text-[1.05rem] leading-relaxed mt-5 max-w-[46ch]">
              O painel transforma o consumo em informação que qualquer pessoa entende. Sem
              planilha, sem conta de cabeça, sem adivinhação.
            </p>
            <Link
              href="/painel"
              className="inline-flex items-center gap-2 mt-9 rounded-full bg-agua px-7 py-3.5 font-semibold text-fundo hover:-translate-y-0.5 transition"
            >
              Explorar o painel <IconeSeta className="w-4 h-4" />
            </Link>
          </Revelar>
          <FeedAlertas />
        </div>
      </section>

      {/* ============ SEGURANÇA ============ */}
      <section className="border-b border-linha">
        <Revelar className="mx-auto max-w-[1240px] px-6 py-12 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <span className="grid place-items-center w-12 h-12 shrink-0 rounded-2xl bg-agua-fundo text-agua">
            <IconeEscudo className="w-6 h-6" />
          </span>
          <div>
            <h3 className="font-bold text-[1.05rem]">Seus dados protegidos</h3>
            <p className="text-tinta-2 text-[0.95rem] mt-1">
              Informações criptografadas e tratadas de acordo com a LGPD. O consumo do seu imóvel
              é só seu.
            </p>
          </div>
        </Revelar>
      </section>

      {/* ============ PLANOS ============ */}
      <section id="planos" className="mx-auto max-w-[1240px] px-6 py-28 scroll-mt-20">
        <Revelar>
          <Cabecalho
            rotulo="Planos"
            titulo="Uma solução sob medida para o seu imóvel"
            texto="Sensores e assinatura de monitoramento, em uma proposta montada para a sua realidade."
          />
        </Revelar>
        <div className="grid gap-6 lg:grid-cols-3 mt-14 items-stretch">
          {PLANOS.map((plano, i) => (
            <Revelar key={plano.nome} atraso={i * 0.1}>
              <div
                className={`relative h-full rounded-3xl p-8 flex flex-col transition duration-300 hover:-translate-y-1 ${
                  plano.destaque
                    ? "escuro bg-fundo text-tinta shadow-2xl"
                    : "bg-superficie border border-linha hover:shadow-lg"
                }`}
              >
                {plano.destaque && (
                  <span className="rotulo absolute -top-3 left-8 rounded-full bg-agua text-fundo px-3 py-1">
                    Mais procurado
                  </span>
                )}
                <h3 className="titulo-md text-[1.55rem]">{plano.nome}</h3>
                <p className="text-tinta-2 text-[0.92rem] mt-1">{plano.para}</p>
                <ul className="flex flex-col gap-3 mt-7 mb-9">
                  {plano.itens.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[0.95rem]">
                      <IconeCheck className="w-5 h-5 text-agua shrink-0 mt-0.5" />
                      <span className="text-tinta-2">{item}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contato"
                  className={`mt-auto text-center rounded-full px-5 py-3.5 font-semibold transition ${
                    plano.destaque
                      ? "bg-agua text-fundo hover:brightness-110"
                      : "bg-superficie-2 text-tinta hover:bg-agua hover:text-white"
                  }`}
                >
                  Solicitar proposta
                </a>
              </div>
            </Revelar>
          ))}
        </div>
      </section>

      {/* ============ PERGUNTAS ============ */}
      <section id="perguntas" className="border-t border-linha bg-superficie-2 scroll-mt-20">
        <div className="mx-auto max-w-[860px] px-6 py-28">
          <Revelar className="text-center">
            <p className="rotulo text-agua">Perguntas frequentes</p>
            <h2 className="titulo-md text-[clamp(1.9rem,3.8vw,2.9rem)] mt-4">Ficou alguma dúvida?</h2>
          </Revelar>
          <div className="mt-12 flex flex-col gap-3">
            {PERGUNTAS.map(({ p, r }, i) => (
              <Revelar key={p} atraso={i * 0.05} y={16}>
                <details className="group rounded-2xl border border-linha bg-superficie px-6 open:shadow-md transition">
                  <summary className="flex items-center justify-between gap-6 py-5 cursor-pointer list-none font-semibold text-[1.02rem]">
                    {p}
                    <span
                      aria-hidden
                      className="grid place-items-center w-8 h-8 shrink-0 rounded-full bg-agua-fundo text-agua text-lg leading-none transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-6 text-tinta-2 leading-relaxed max-w-[68ch]">{r}</p>
                </details>
              </Revelar>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CHAMADA FINAL ============ */}
      <section id="contato" className="escuro bg-fundo text-tinta relative overflow-hidden scroll-mt-20">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(50% 80% at 50% 100%, color-mix(in srgb, var(--agua) 22%, transparent), transparent 70%)",
          }}
        />
        <Esfera className="left-[12%] top-[22%] w-9 h-9" cor="var(--agua)" atraso="-2s" />
        <Esfera className="right-[14%] top-[30%] w-6 h-6" cor="var(--bom)" atraso="-5s" />
        <Esfera className="right-[26%] bottom-[34%] w-4 h-4" cor="var(--alerta)" atraso="-3s" />

        <Revelar className="relative mx-auto max-w-[1240px] px-6 py-32 text-center">
          <h2 className="titulo text-[clamp(2.2rem,5.4vw,4rem)] max-w-[18ch] mx-auto">
            Pare de pagar pela água que você não usa.
          </h2>
          <p className="text-tinta-2 text-[1.15rem] mt-6">
            Água inteligente. Menos desperdício. Mais economia.
          </p>
          <Link
            href="/painel"
            className="inline-flex items-center gap-2 mt-10 rounded-full bg-agua px-8 py-4 font-semibold text-fundo shadow-[0_12px_40px_-10px_var(--agua)] hover:-translate-y-0.5 transition"
          >
            Ver demonstração <IconeSeta className="w-4 h-4" />
          </Link>
        </Revelar>

        <footer className="relative border-t border-linha-suave">
          <div className="mx-auto max-w-[1240px] px-6 py-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
            <Marca />
            <nav className="flex flex-wrap gap-x-7 gap-y-2 text-[0.9rem] text-tinta-2">
              <a href="#recursos" className="hover:text-tinta">Recursos</a>
              <a href="#como-funciona" className="hover:text-tinta">Como funciona</a>
              <a href="#planos" className="hover:text-tinta">Planos</a>
              <a href="#perguntas" className="hover:text-tinta">Dúvidas</a>
            </nav>
            <p className="text-[0.85rem] text-tinta-3">© 2026 Hydro Mind · Campinas / SP</p>
          </div>
        </footer>
      </section>
    </div>
  );
}

/* ================================================================== */

/*
 * Título da abertura: entra palavra por palavra, só com CSS. Fica no servidor
 * (sem JavaScript) porque é o elemento mais importante da página — ele
 * precisa estar no HTML visível desde o primeiro carregamento.
 */
function TituloAbertura({
  partes,
  className,
}: {
  partes: { texto: string; destaque?: boolean }[];
  className?: string;
}) {
  let indice = 0;
  return (
    <h1 className={className}>
      {partes.map((parte, p) => (
        <span key={p} className={parte.destaque ? "text-agua" : undefined}>
          {parte.texto.split(" ").map((palavra, w) => {
            const atraso = 0.08 + indice++ * 0.06;
            return (
              <span key={w}>
                <span className="inline-block animar-entrar" style={{ animationDelay: `${atraso}s` }}>
                  {palavra}
                </span>{" "}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

function Marca() {
  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="inline-block w-[20px] h-[20px] shrink-0"
        style={{
          borderRadius: "50% 50% 50% 3px",
          transform: "rotate(-45deg)",
          background: "linear-gradient(150deg, var(--agua), color-mix(in srgb, var(--agua) 60%, black))",
        }}
      />
      <span className="font-extrabold text-[1rem] tracking-wide whitespace-nowrap" style={{ fontStretch: "118%" }}>
        HYDRO MIND
      </span>
    </div>
  );
}

function Navegacao() {
  return (
    <header className="sticky top-0 z-50 border-b border-linha/70 bg-fundo/80 backdrop-blur-md">
      <div className="mx-auto max-w-[1240px] px-6 py-4 flex items-center justify-between gap-4">
        <Marca />
        <nav className="hidden md:flex gap-8 text-[0.92rem] text-tinta-2">
          <a href="#recursos" className="hover:text-tinta transition">Recursos</a>
          <a href="#como-funciona" className="hover:text-tinta transition">Como funciona</a>
          <a href="#para-quem" className="hover:text-tinta transition">Para quem</a>
          <a href="#planos" className="hover:text-tinta transition">Planos</a>
        </nav>
        <Link
          href="/painel"
          className="rounded-full bg-tinta px-5 py-2.5 text-[0.9rem] font-semibold text-fundo whitespace-nowrap hover:bg-agua transition"
        >
          <span className="sm:hidden">Demonstração</span>
          <span className="hidden sm:inline">Ver demonstração</span>
        </Link>
      </div>
    </header>
  );
}

function Cabecalho({ rotulo, titulo, texto }: { rotulo: string; titulo: string; texto?: string }) {
  return (
    <div className="max-w-[640px]">
      <p className="rotulo text-agua">{rotulo}</p>
      <h2 className="titulo-md text-[clamp(1.9rem,3.8vw,2.9rem)] mt-4">{titulo}</h2>
      {texto && <p className="text-tinta-2 text-[1.05rem] leading-relaxed mt-4">{texto}</p>}
    </div>
  );
}

/** Esfera decorativa com brilho de volume, flutuando devagar. */
function Esfera({ className, cor, atraso }: { className: string; cor: string; atraso: string }) {
  return (
    <span
      aria-hidden
      className={`absolute rounded-full animar-flutuar pointer-events-none ${className}`}
      style={{
        background: `radial-gradient(circle at 32% 28%, #ffffff 0%, ${cor} 42%, color-mix(in srgb, ${cor} 70%, black) 100%)`,
        boxShadow: `0 14px 30px -10px color-mix(in srgb, ${cor} 60%, transparent)`,
        animationDelay: atraso,
      }}
    />
  );
}

/** Cartão pastel com uma pequena interface animada no centro. */
function CartaoRecurso({
  fundo,
  titulo,
  texto,
  children,
}: {
  fundo: string;
  titulo: string;
  texto: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group">
      <div
        className={`${fundo} rounded-3xl h-[230px] grid place-items-center overflow-hidden group-hover:-translate-y-1 transition duration-300`}
      >
        {children}
      </div>
      <h3 className="font-bold text-[1.15rem] mt-5">{titulo}</h3>
      <p className="text-tinta-2 mt-1">{texto}</p>
    </div>
  );
}

/* Feed de eventos: como o produto conversa com o usuário no dia a dia. */
function FeedAlertas() {
  const eventos = [
    {
      tipo: "critico",
      titulo: "Possível vazamento no banheiro",
      texto: "Fluxo contínuo identificado durante a madrugada.",
      quando: "agora",
    },
    {
      tipo: "alerta",
      titulo: "Consumo acima do normal no jardim",
      texto: "O uso de hoje está fora do padrão para este dia da semana.",
      quando: "hoje",
    },
    {
      tipo: "info",
      titulo: "Previsão da conta atualizada",
      texto: "Veja como o mês deve fechar com o consumo atual.",
      quando: "hoje",
    },
    {
      tipo: "bom",
      titulo: "Área de serviço voltou ao normal",
      texto: "Nenhuma anomalia desde o último ajuste.",
      quando: "ontem",
    },
  ] as const;

  const cor = { critico: "bg-critico", alerta: "bg-alerta", info: "bg-agua", bom: "bg-bom" };

  return (
    <div className="rounded-3xl border border-linha bg-superficie p-3 shadow-2xl">
      {eventos.map((e, i) => (
        <Revelar key={e.titulo} atraso={0.15 + i * 0.12} y={16}>
          <div className={`flex gap-4 p-4 rounded-2xl ${i === 0 ? "bg-superficie-2" : ""}`}>
            <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${cor[e.tipo]} ${i === 0 ? "animar-piscar" : ""}`} />
            <div className="flex-1">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-semibold text-[0.95rem]">{e.titulo}</span>
                <span className="rotulo text-tinta-3 shrink-0">{e.quando}</span>
              </div>
              <p className="text-tinta-2 text-[0.87rem] mt-1">{e.texto}</p>
            </div>
          </div>
        </Revelar>
      ))}
    </div>
  );
}
