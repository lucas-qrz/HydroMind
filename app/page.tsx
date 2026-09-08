import Link from "next/link";
import { calcularConta, formatarReais } from "@/lib/tarifa";

/*
 * Site de vendas.
 *
 * A abertura é o dado, não o slogan. "Monitore sua água" é o que todo
 * concorrente diz; o número de Campinas é o único argumento que só a Hydro
 * Mind tem — e é ele que cria o desconforto que faz a pessoa continuar lendo.
 */

const PERDAS = [
  { ponto: "Vaso sanitário com vedação gasta", litros: 1380, prop: 1 },
  { ponto: "Tubulação enterrada", litros: 1150, prop: 0.83 },
  { ponto: "Registro ou boia da caixa", litros: 860, prop: 0.62 },
  { ponto: "Torneira gotejando", litros: 470, prop: 0.34 },
];

const DETECTORES = [
  {
    n: "01",
    titulo: "Fluxo contínuo",
    texto:
      "Água correndo sem parar por mais de 45 minutos. Um banho dura 15; uma máquina de lavar tem pausas. Fluxo ininterrupto não é uso humano.",
    pega: "vazamento silencioso",
  },
  {
    n: "02",
    titulo: "Piso de madrugada",
    texto:
      "Consumo entre 2h e 5h da manhã. Numa noite normal a vazão encosta em zero; se ela não encosta, a água está indo para algum lugar.",
    pega: "vazamento estrutural",
  },
  {
    n: "03",
    titulo: "Desvio da linha de base",
    texto:
      "Compara cada hora com o histórico da mesma hora e do mesmo dia da semana. Sábado de manhã se compara com outros sábados, não com a média geral.",
    pega: "consumo anormal",
  },
  {
    n: "04",
    titulo: "Assinatura de vazão",
    texto:
      "Classifica o formato do fluxo — duração, amplitude e estabilidade — para dizer qual ponto hidráulico está aberto.",
    pega: "onde está vazando",
  },
];

export default function Site() {
  // Números da conta calculados pelo mesmo motor que roda no painel.
  const conta20 = calcularConta(20);
  const conta21 = calcularConta(21);
  const degrau = conta21.total - conta20.total;

  return (
    <div className="bg-fundo text-tinta flex-1">
      {/* Navegação */}
      <header className="border-b border-linha">
        <div className="mx-auto max-w-[1120px] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 font-extrabold text-[0.95rem]" style={{ fontStretch: "118%" }}>
            <Gota />
            HYDRO MIND
          </div>
          <nav className="hidden md:flex gap-6 text-[0.85rem] text-tinta-2">
            <span>Como funciona</span>
            <span>Para condomínios</span>
            <span>Para sua casa</span>
            <span>Planos</span>
          </nav>
          <Link
            href="/painel"
            className="px-4 py-2 rounded bg-agua text-white text-[0.85rem] font-semibold"
          >
            Ver o painel ao vivo →
          </Link>
        </div>
      </header>

      {/* Abertura */}
      <section className="mx-auto max-w-[1120px] px-6 pt-14 pb-11 grid gap-9 lg:grid-cols-[1.15fr_0.85fr] items-center">
        <div>
          <h1 className="titulo text-[clamp(2rem,5vw,2.9rem)]">
            Campinas tem a melhor rede do Brasil.
            <br />
            <span className="text-agua">Sua conta subiu mesmo assim.</span>
          </h1>
          <p className="text-tinta-2 mt-4 max-w-[46ch]">
            O vazamento que pesa na sua conta não está na rua — está no vaso sanitário, na
            tubulação enterrada, na caixa d&apos;água. O Água Alerta encontra e avisa antes
            do boleto chegar.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link
              href="/painel"
              className="px-5 py-2.5 rounded bg-agua text-white text-[0.88rem] font-semibold"
            >
              Ver uma detecção real
            </Link>
            <span className="px-5 py-2.5 rounded border border-agua text-agua text-[0.88rem] font-semibold">
              Simular economia do condomínio
            </span>
          </div>
          <p className="num text-[0.7rem] text-tinta-3 mt-6">
            Fonte: SINISA / Instituto Trata Brasil, base 2023–24
          </p>
        </div>

        <div className="border border-linha rounded-lg bg-superficie p-5">
          <div className="rotulo text-tinta-3 mb-3">Onde a água some · casa média</div>
          <div className="flex flex-col gap-2.5">
            {PERDAS.map((p) => (
              <div key={p.ponto} className="flex items-center gap-3 text-[0.8rem] text-tinta-2">
                <span className="flex-1">{p.ponto}</span>
                <span className="h-1.5 w-[90px] rounded-full bg-superficie-2 overflow-hidden shrink-0">
                  <span
                    className="block h-full rounded-full bg-agua"
                    style={{ width: `${p.prop * 100}%` }}
                  />
                </span>
                <span className="num font-semibold text-tinta text-[0.84rem] w-[86px] text-right">
                  {p.litros.toLocaleString("pt-BR")} L/mês
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="border-y border-linha bg-superficie-2">
        <div className="mx-auto max-w-[1120px] px-6 grid sm:grid-cols-3">
          <Numero
            valor="15,2%"
            texto="de perda na rede pública de Campinas — a menor do país"
          />
          <Numero
            valor="39,53%"
            texto="é a média nacional de desperdício, para efeito de comparação"
          />
          <Numero
            valor="até 50%"
            texto="de redução de consumo em comunidades com medição inteligente"
          />
        </div>
      </section>

      {/* Tarifa progressiva */}
      <section className="mx-auto max-w-[1120px] px-6 py-14">
        <div className="rotulo text-agua">O argumento que ninguém usa</div>
        <h2 className="titulo-md text-[clamp(1.4rem,3vw,2rem)] mt-3 max-w-[24ch]">
          A conta de água não é linear. Ela sobe em degraus.
        </h2>
        <p className="text-tinta-2 mt-4 max-w-[62ch]">
          A Sanasa cobra por faixas: cada m³ é cobrado pelo preço da faixa em que ele cai.
          Passar de 20 para 21 m³ custa{" "}
          <strong className="text-tinta">{formatarReais(degrau)}</strong> — enquanto o m³ dentro
          da primeira faixa sai por {formatarReais(calcularConta(10).total / 10)}.
        </p>
        <p className="text-tinta-2 mt-3 max-w-[62ch]">
          Por isso a nossa mensagem não é &ldquo;você economiza 260 litros&rdquo;. É:{" "}
          <strong className="text-tinta">
            corrigir esse vazamento mantém você na faixa de baixo e evita um degrau inteiro de
            preço.
          </strong>
        </p>
      </section>

      {/* Detectores */}
      <section className="border-t border-linha">
        <div className="mx-auto max-w-[1120px] px-6 py-14">
          <div className="rotulo text-agua">Como encontramos</div>
          <h2 className="titulo-md text-[clamp(1.4rem,3vw,2rem)] mt-3">
            Quatro detectores, em ordem de eficácia
          </h2>
          <p className="text-tinta-2 mt-4 max-w-[62ch]">
            Nenhum deles é rede neural — e é por isso que funcionam com poucos dados e são
            explicáveis. Um alerta que você não entende é um alerta que você ignora.
          </p>

          <div className="grid gap-px bg-linha border border-linha rounded-lg overflow-hidden mt-8 sm:grid-cols-2 lg:grid-cols-4">
            {DETECTORES.map((d) => (
              <div key={d.n} className="bg-superficie p-5 flex flex-col gap-2">
                <span className="num text-[0.7rem] text-agua tracking-widest">DETECTOR {d.n}</span>
                <h3 className="font-bold text-[0.98rem]">{d.titulo}</h3>
                <p className="text-[0.85rem] text-tinta-2">{d.texto}</p>
                <span className="num text-[0.72rem] text-tinta-3 mt-auto pt-3 border-t border-linha-suave">
                  Pega: {d.pega}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chamada final */}
      <section className="border-t border-linha bg-superficie-2">
        <div className="mx-auto max-w-[1120px] px-6 py-14 text-center">
          <h2 className="titulo-md text-[clamp(1.4rem,3vw,2rem)] max-w-[26ch] mx-auto">
            Água inteligente. Menos desperdício. Mais economia.
          </h2>
          <p className="text-tinta-2 mt-4 max-w-[54ch] mx-auto">
            Veja o painel funcionando com uma detecção real — vazamento de 0,31 L/min
            encontrado, classificado e traduzido em reais.
          </p>
          <Link
            href="/painel"
            className="inline-block mt-7 px-6 py-3 rounded bg-agua text-white font-semibold"
          >
            Abrir o painel
          </Link>
        </div>
      </section>

      <footer className="border-t border-linha">
        <div className="mx-auto max-w-[1120px] px-6 py-8 text-[0.8rem] text-tinta-3">
          Hydro Mind — Água Alerta · Projeto acadêmico, Campinas 2026.
          <br />
          Dados de mercado: SINISA / Instituto Trata Brasil (base 2023–24), Censo Condominial
          ABRASSP 2024/25, Mordor Intelligence. Valores de tarifa conforme Sanasa / ARES-PCJ.
        </div>
      </footer>
    </div>
  );
}

function Numero({ valor, texto }: { valor: string; texto: string }) {
  return (
    <div className="py-6 sm:px-6 first:sm:pl-0 border-b sm:border-b-0 sm:border-r last:border-r-0 border-linha">
      <div className="num text-[1.6rem] font-semibold text-agua tracking-tight">{valor}</div>
      <div className="text-[0.8rem] text-tinta-2 mt-1 max-w-[30ch]">{texto}</div>
    </div>
  );
}

function Gota() {
  return (
    <span
      aria-hidden
      className="inline-block w-[19px] h-[19px] shrink-0"
      style={{
        borderRadius: "50% 50% 50% 3px",
        transform: "rotate(-45deg)",
        background: "linear-gradient(150deg, var(--agua), color-mix(in srgb, var(--agua) 65%, black))",
      }}
    />
  );
}
