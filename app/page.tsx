import Link from "next/link";
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
  IconePredio,
  IconeRelatorio,
  IconeSeta,
  IconeSino,
} from "./_componentes/icones";

/*
 * Landing page do Água Alerta.
 *
 * Regra editorial desta página: nenhum número. Sem estatística de mercado,
 * sem dado de terceiros, sem valor estimado. O convencimento vem da clareza
 * da proposta e da demonstração do produto. Tudo o que o texto promete está
 * na descrição do produto e nos requisitos elaborados pela equipe.
 */

const PILARES = [
  "Monitoramento contínuo",
  "Alertas imediatos",
  "Instalação simples",
  "Baixa manutenção",
];

const PASSOS = [
  {
    titulo: "Instale",
    texto:
      "Sensores compactos conectados à rede hidráulica do imóvel. A configuração é simples e o sistema começa a monitorar no mesmo dia.",
  },
  {
    titulo: "Aprenda",
    texto:
      "A inteligência do Água Alerta aprende o ritmo de consumo de cada ambiente: quando a água é usada, quanto e por quanto tempo.",
  },
  {
    titulo: "Aja",
    texto:
      "Quando algo foge do normal, você recebe o alerta na hora, com o local provável e o impacto na conta. Tempo de agir antes do prejuízo.",
  },
];

const RECURSOS = [
  {
    Icone: IconeGota,
    titulo: "Detecção de vazamentos",
    texto: "Identifica água correndo sem parar e consumo fora de hora, antes que virem prejuízo.",
  },
  {
    Icone: IconeConta,
    titulo: "Conta em tempo real",
    texto: "Acompanhe quanto já consumiu e quanto vai pagar no fechamento do mês. Sem surpresa no boleto.",
  },
  {
    Icone: IconeAmbiente,
    titulo: "Consumo por ambiente",
    texto: "Descubra qual cômodo, bloco ou setor gasta mais e onde vale concentrar esforço.",
  },
  {
    Icone: IconeSino,
    titulo: "Alertas no celular",
    texto: "Notificações imediatas, onde você estiver. O imóvel avisa você, não o contrário.",
  },
  {
    Icone: IconeRelatorio,
    titulo: "Relatórios claros",
    texto: "Histórico organizado para entender o consumo e tomar decisões com segurança.",
  },
  {
    Icone: IconeInteligencia,
    titulo: "Inteligência artificial",
    texto: "Padrões anormais reconhecidos automaticamente. Você não precisa vigiar nada.",
  },
];

const PUBLICOS = [
  {
    Icone: IconeCasa,
    titulo: "Residências",
    texto:
      "Tranquilidade para a família. Saiba o que acontece com a água da sua casa, mesmo quando você não está nela.",
  },
  {
    Icone: IconePredio,
    titulo: "Condomínios",
    texto:
      "Controle por bloco, unidade e área comum. Informação clara para o síndico agir rápido e apresentar em assembleia.",
  },
  {
    Icone: IconeEmpresa,
    titulo: "Empresas",
    texto:
      "Custo operacional sob controle e um compromisso visível com a sustentabilidade.",
  },
  {
    Icone: IconeEscola,
    titulo: "Escolas",
    texto:
      "Proteção do patrimônio e um exemplo prático de uso consciente da água para os alunos.",
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

export default function Site() {
  return (
    <div className="bg-fundo text-tinta flex-1">
      {/* ============ ABERTURA ============ */}
      <div className="escuro bg-fundo text-tinta relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 55% at 78% 30%, color-mix(in srgb, var(--agua) 22%, transparent), transparent 70%)",
          }}
        />

        <Navegacao />

        <section className="relative mx-auto max-w-[1200px] px-6 pt-14 pb-24 lg:pt-20 lg:pb-32 grid gap-16 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div>
            <p className="rotulo text-agua">Monitoramento inteligente de água</p>
            <h1 className="titulo text-[clamp(2.5rem,6vw,4.3rem)] mt-5">
              O vazamento que você não vê,{" "}
              <span className="text-agua">a gente encontra.</span>
            </h1>
            <p className="text-tinta-2 text-[1.1rem] leading-relaxed mt-6 max-w-[46ch]">
              Sensores inteligentes e um painel em tempo real que avisam na hora certa,
              mostram para onde a água está indo e colocam o controle do consumo nas
              suas mãos.
            </p>
            <div className="flex flex-wrap gap-3 mt-9">
              <Link
                href="/painel"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-agua text-fundo font-semibold hover:brightness-110 transition"
              >
                Ver demonstração <IconeSeta className="w-4 h-4" />
              </Link>
              <a
                href="#planos"
                className="inline-flex items-center px-6 py-3.5 rounded-md border border-linha text-tinta font-semibold hover:bg-superficie-2 transition"
              >
                Conhecer os planos
              </a>
            </div>
          </div>

          <IlustracaoProduto />
        </section>

        {/* Pilares */}
        <div className="relative border-t border-linha-suave">
          <ul className="mx-auto max-w-[1200px] px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6">
            {PILARES.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-[0.92rem] text-tinta-2">
                <IconeCheck className="w-4 h-4 text-agua shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ============ PROBLEMA ============ */}
      <section className="mx-auto max-w-[1200px] px-6 py-24 grid gap-12 lg:grid-cols-2 items-start">
        <div>
          <p className="rotulo text-agua">O problema</p>
          <h2 className="titulo-md text-[clamp(1.8rem,3.6vw,2.7rem)] mt-4">
            Vazamento silencioso não avisa. Ele aparece na conta.
          </h2>
        </div>
        <div className="flex flex-col gap-5 text-tinta-2 text-[1.05rem] leading-relaxed">
          <p>
            Uma válvula que não veda. Um cano que cede atrás da parede. Uma caixa
            d&apos;água que transborda devagar. Nada disso faz barulho — e tudo isso
            custa caro.
          </p>
          <p>
            Quando o problema finalmente aparece, ele já virou prejuízo: na conta, na
            estrutura do imóvel e no tempo perdido procurando a origem.
          </p>
          <p className="text-tinta font-semibold">
            O Água Alerta muda essa ordem. Você fica sabendo primeiro.
          </p>
        </div>
      </section>

      {/* ============ COMO FUNCIONA ============ */}
      <section id="como-funciona" className="border-t border-linha bg-superficie-2 scroll-mt-4">
        <div className="mx-auto max-w-[1200px] px-6 py-24">
          <Cabecalho
            rotulo="Como funciona"
            titulo="Três passos entre o problema e a solução"
          />
          <ol className="grid gap-10 md:grid-cols-3 mt-14">
            {PASSOS.map((passo, i) => (
              <li key={passo.titulo} className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="num w-10 h-10 rounded-full bg-agua text-white grid place-items-center font-semibold">
                    {i + 1}
                  </span>
                  <span className="h-px flex-1 bg-linha" aria-hidden />
                </div>
                <h3 className="titulo-md text-[1.35rem]">{passo.titulo}</h3>
                <p className="text-tinta-2 leading-relaxed">{passo.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ RECURSOS ============ */}
      <section id="recursos" className="mx-auto max-w-[1200px] px-6 py-24 scroll-mt-4">
        <Cabecalho
          rotulo="Recursos"
          titulo="Tudo o que você precisa para cuidar da água"
          texto="Uma solução completa: sensores, aplicativo e inteligência trabalhando juntos."
        />
        <div className="grid gap-px bg-linha border border-linha rounded-xl overflow-hidden mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {RECURSOS.map(({ Icone, titulo, texto }) => (
            <div key={titulo} className="bg-superficie p-8 flex flex-col gap-3">
              <span className="w-11 h-11 rounded-lg bg-agua-fundo text-agua grid place-items-center">
                <Icone className="w-5 h-5" />
              </span>
              <h3 className="font-bold text-[1.05rem] mt-2">{titulo}</h3>
              <p className="text-tinta-2 text-[0.95rem] leading-relaxed">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PARA QUEM ============ */}
      <section id="para-quem" className="border-t border-linha scroll-mt-4">
        <div className="mx-auto max-w-[1200px] px-6 py-24">
          <Cabecalho
            rotulo="Para quem"
            titulo="Feito para cada tipo de imóvel"
          />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mt-14">
            {PUBLICOS.map(({ Icone, titulo, texto }) => (
              <div key={titulo} className="flex flex-col gap-3 border-t-2 border-agua pt-6">
                <Icone className="w-7 h-7 text-agua" />
                <h3 className="titulo-md text-[1.25rem] mt-1">{titulo}</h3>
                <p className="text-tinta-2 text-[0.95rem] leading-relaxed">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ EM AÇÃO ============ */}
      <section className="escuro bg-fundo text-tinta">
        <div className="mx-auto max-w-[1200px] px-6 py-24 grid gap-14 lg:grid-cols-2 items-center">
          <div>
            <p className="rotulo text-agua">O produto em ação</p>
            <h2 className="titulo-md text-[clamp(1.8rem,3.6vw,2.7rem)] mt-4">
              Tudo o que importa, em uma tela.
            </h2>
            <p className="text-tinta-2 text-[1.05rem] leading-relaxed mt-5 max-w-[48ch]">
              O painel do Água Alerta transforma o consumo em informação que qualquer
              pessoa entende. Sem planilha, sem conta de cabeça, sem adivinhação.
            </p>
            <ul className="flex flex-col gap-3 mt-7">
              {[
                "O que está acontecendo agora, em cada ambiente",
                "Quanto a conta do mês deve fechar",
                "Onde está o consumo fora do normal",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-tinta-2">
                  <IconeCheck className="w-5 h-5 text-agua shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              href="/painel"
              className="inline-flex items-center gap-2 mt-9 px-6 py-3.5 rounded-md bg-agua text-fundo font-semibold hover:brightness-110 transition"
            >
              Explorar o painel <IconeSeta className="w-4 h-4" />
            </Link>
          </div>

          <FeedAlertas />
        </div>
      </section>

      {/* ============ SEGURANÇA ============ */}
      <section className="border-b border-linha">
        <div className="mx-auto max-w-[1200px] px-6 py-12 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <span className="w-12 h-12 rounded-lg bg-agua-fundo text-agua grid place-items-center shrink-0">
            <IconeEscudo className="w-6 h-6" />
          </span>
          <div>
            <h3 className="font-bold text-[1.05rem]">Seus dados protegidos</h3>
            <p className="text-tinta-2 text-[0.95rem] mt-1">
              Informações criptografadas e tratadas de acordo com a LGPD. O consumo do seu
              imóvel é só seu.
            </p>
          </div>
        </div>
      </section>

      {/* ============ PLANOS ============ */}
      <section id="planos" className="mx-auto max-w-[1200px] px-6 py-24 scroll-mt-4">
        <Cabecalho
          rotulo="Planos"
          titulo="Uma solução sob medida para o seu imóvel"
          texto="Sensores e assinatura de monitoramento, em uma proposta montada para a sua realidade."
        />
        <div className="grid gap-6 lg:grid-cols-3 mt-14 items-stretch">
          {PLANOS.map((plano) => (
            <div
              key={plano.nome}
              className={`relative rounded-xl p-8 flex flex-col ${
                plano.destaque
                  ? "escuro bg-fundo text-tinta shadow-xl"
                  : "bg-superficie border border-linha"
              }`}
            >
              {plano.destaque && (
                <span className="rotulo absolute -top-3 left-8 bg-agua text-fundo px-3 py-1 rounded-full">
                  Mais procurado
                </span>
              )}
              <h3 className="titulo-md text-[1.5rem]">{plano.nome}</h3>
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
                className={`mt-auto text-center px-5 py-3 rounded-md font-semibold transition ${
                  plano.destaque
                    ? "bg-agua text-fundo hover:brightness-110"
                    : "border border-agua text-agua hover:bg-agua-fundo"
                }`}
              >
                Solicitar proposta
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PERGUNTAS ============ */}
      <section id="perguntas" className="border-t border-linha bg-superficie-2 scroll-mt-4">
        <div className="mx-auto max-w-[860px] px-6 py-24">
          <Cabecalho rotulo="Perguntas frequentes" titulo="Ficou alguma dúvida?" />
          <div className="mt-12 border-t border-linha">
            {PERGUNTAS.map(({ p, r }) => (
              <details key={p} className="group border-b border-linha">
                <summary className="flex items-center justify-between gap-6 py-5 cursor-pointer list-none font-semibold text-[1.02rem]">
                  {p}
                  <span
                    aria-hidden
                    className="text-agua text-xl leading-none transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-6 text-tinta-2 leading-relaxed max-w-[68ch]">{r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CHAMADA FINAL ============ */}
      <section id="contato" className="escuro bg-fundo text-tinta relative overflow-hidden scroll-mt-4">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(50% 80% at 50% 100%, color-mix(in srgb, var(--agua) 20%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-[1200px] px-6 py-28 text-center">
          <h2 className="titulo text-[clamp(2rem,5vw,3.4rem)] max-w-[20ch] mx-auto">
            Pare de pagar pela água que você não usa.
          </h2>
          <p className="text-tinta-2 text-[1.1rem] mt-6">
            Água inteligente. Menos desperdício. Mais economia.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Link
              href="/painel"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-md bg-agua text-fundo font-semibold hover:brightness-110 transition"
            >
              Ver demonstração <IconeSeta className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <footer className="relative border-t border-linha-suave">
          <div className="mx-auto max-w-[1200px] px-6 py-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
            <Marca />
            <nav className="flex flex-wrap gap-x-7 gap-y-2 text-[0.9rem] text-tinta-2">
              <a href="#como-funciona" className="hover:text-tinta">Como funciona</a>
              <a href="#recursos" className="hover:text-tinta">Recursos</a>
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
      <span
        className="font-extrabold text-[1rem] tracking-wide whitespace-nowrap"
        style={{ fontStretch: "118%" }}
      >
        HYDRO MIND
      </span>
    </div>
  );
}

function Navegacao() {
  return (
    <header className="relative">
      <div className="mx-auto max-w-[1200px] px-6 py-5 flex items-center justify-between gap-4">
        <Marca />
        <nav className="hidden md:flex gap-8 text-[0.92rem] text-tinta-2">
          <a href="#como-funciona" className="hover:text-tinta transition">Como funciona</a>
          <a href="#recursos" className="hover:text-tinta transition">Recursos</a>
          <a href="#para-quem" className="hover:text-tinta transition">Para quem</a>
          <a href="#planos" className="hover:text-tinta transition">Planos</a>
        </nav>
        {/* No celular o texto encurta para não quebrar em duas linhas. */}
        <Link
          href="/painel"
          className="px-4 py-2.5 rounded-md bg-agua text-fundo text-[0.9rem] font-semibold whitespace-nowrap hover:brightness-110 transition"
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
      <h2 className="titulo-md text-[clamp(1.8rem,3.6vw,2.7rem)] mt-4">{titulo}</h2>
      {texto && <p className="text-tinta-2 text-[1.05rem] leading-relaxed mt-4">{texto}</p>}
    </div>
  );
}

/*
 * Ilustração do produto na abertura: o painel de uma casa com um ambiente em
 * alerta e a notificação que chegaria ao celular. É uma representação da
 * interface, não um dado — por isso não traz números.
 */
function IlustracaoProduto() {
  const ambientes = [
    { nome: "Cozinha", estado: "Normal", alerta: false },
    { nome: "Banheiro social", estado: "Atenção", alerta: true },
    { nome: "Área de serviço", estado: "Normal", alerta: false },
    { nome: "Jardim", estado: "Normal", alerta: false },
  ];

  return (
    <div className="relative lg:pl-6 sm:pb-16">
      <div className="rounded-xl border border-linha bg-superficie shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-linha-suave">
          <div>
            <div className="font-semibold text-[0.95rem]">Minha casa</div>
            <div className="text-tinta-3 text-[0.8rem]">Monitoramento por ambiente</div>
          </div>
          <span className="rotulo text-bom flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-bom animate-ping opacity-60" />
              <span className="relative w-2 h-2 rounded-full bg-bom" />
            </span>
            ao vivo
          </span>
        </div>

        <div className="px-5 pt-5">
          <div className="rotulo text-tinta-3">Vazão nas últimas 24 horas</div>
          <svg viewBox="0 0 320 90" className="w-full h-auto mt-3" aria-hidden="true">
            <rect x="32" y="4" width="40" height="78" fill="var(--critico)" opacity="0.12" />
            <path
              d="M0 78 L32 72 L72 72 L96 70 L108 30 L122 64 L150 58 L170 40 L186 66 L214 60 L232 18 L248 56 L276 50 L296 36 L320 70 L320 82 L0 82 Z"
              fill="var(--agua)"
              opacity="0.18"
            />
            <path
              d="M0 78 L32 72 L72 72 L96 70 L108 30 L122 64 L150 58 L170 40 L186 66 L214 60 L232 18 L248 56 L276 50 L296 36 L320 70"
              fill="none"
              stroke="var(--agua)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <line x1="0" y1="72" x2="320" y2="72" stroke="var(--critico)" strokeWidth="1.3" strokeDasharray="4 4" />
          </svg>
        </div>

        <ul className="px-5 pb-5 pt-3 flex flex-col">
          {ambientes.map((a) => (
            <li
              key={a.nome}
              className="flex items-center justify-between py-2.5 border-t border-linha-suave text-[0.9rem]"
            >
              <span className={a.alerta ? "text-tinta font-semibold" : "text-tinta-2"}>{a.nome}</span>
              <span
                className={`rotulo px-2.5 py-1 rounded-full ${
                  a.alerta ? "bg-critico-fundo text-critico" : "bg-bom-fundo text-bom"
                }`}
              >
                {a.estado}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Notificação. No celular fica abaixo do cartão; a partir de `sm` fica
          pendurada no canto inferior esquerdo, sobrepondo só o respiro interno
          do cartão — nunca a lista de ambientes. */}
      <div className="mt-4 sm:mt-0 sm:absolute sm:bottom-0 sm:-left-4 lg:-left-8 w-full sm:w-[300px] rounded-lg border border-critico bg-superficie-2 p-4 shadow-2xl">
        <div className="flex gap-3">
          <span className="w-9 h-9 rounded-full bg-critico-fundo text-critico grid place-items-center shrink-0">
            <IconeSino className="w-4.5 h-4.5" />
          </span>
          <div>
            <div className="font-semibold text-[0.9rem]">Possível vazamento</div>
            <p className="text-tinta-2 text-[0.8rem] leading-snug mt-0.5">
              Banheiro social: água correndo sem parar desde a madrugada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Feed de eventos: como o produto conversa com o usuário no dia a dia. */
function FeedAlertas() {
  const eventos = [
    {
      tipo: "critico",
      titulo: "Possível vazamento no banheiro social",
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
      texto: "Veja quanto o mês deve fechar com o consumo atual.",
      quando: "hoje",
    },
    {
      tipo: "bom",
      titulo: "Área de serviço voltou ao normal",
      texto: "Nenhuma anomalia desde o último ajuste.",
      quando: "ontem",
    },
  ] as const;

  const cor = {
    critico: "bg-critico",
    alerta: "bg-alerta",
    info: "bg-agua",
    bom: "bg-bom",
  };

  return (
    <div className="rounded-xl border border-linha bg-superficie p-3 shadow-2xl">
      {eventos.map((e, i) => (
        <div
          key={e.titulo}
          className={`flex gap-4 p-4 rounded-lg ${i === 0 ? "bg-superficie-2" : ""}`}
        >
          <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${cor[e.tipo]}`} />
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-semibold text-[0.95rem]">{e.titulo}</span>
              <span className="rotulo text-tinta-3 shrink-0">{e.quando}</span>
            </div>
            <p className="text-tinta-2 text-[0.87rem] mt-1">{e.texto}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
