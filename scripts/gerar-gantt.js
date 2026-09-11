/* Script Node (CommonJS) executado via `npm run gantt`, fora do bundle do Next. */
/* eslint-disable @typescript-eslint/no-require-imports */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, HeadingLevel, BorderStyle,
  PageOrientation, VerticalAlign,
} = require("docx");
const fs = require("fs");

/* ---------------- paleta ---------------- */
const AZUL = "0C6E8E";
const AZUL_CLARO = "D6EAF2";
const VERMELHO = "C4443A";
const VERMELHO_CLARO = "F5D6D3";
const CINZA = "5A7285";
const CINZA_CLARO = "EEF3F6";
const TINTA = "0A1E30";
const LINHA = "C9D8E2";

const MESES = ["out/26","nov","dez","jan/27","fev","mar","abr","mai","jun","jul","ago","set"];

/* ---------------- dados do cronograma ----------------
   ini/fim = índice do mês (0 = out/2026, 11 = set/2027), inclusivos. */
const LINHAS = [
  { fase: "1.1  Planejamento do Projeto", ini: 0, fim: 2, critica: true },
  { t: "Termo de abertura e escopo", ini: 0, fim: 0, critica: true },
  { t: "EAP, cronograma e marcos", dep: "Termo de abertura", ini: 0, fim: 1, critica: true },
  { t: "Riscos, KPIs e orçamento", dep: "EAP", ini: 1, fim: 2 },

  { fase: "1.2  Captação e Parcerias", ini: 1, fim: 4, critica: true },
  { t: "Pitch deck e projeções financeiras", dep: "Orçamento", ini: 1, fim: 2, critica: true },
  { t: "Prospecção de investidores-anjo", dep: "Pitch deck", ini: 2, fim: 4, critica: true },
  { t: "Fechamento e formalização do aporte", ini: 4, fim: 4, critica: true, marco: "Aporte R$ 250 mil" },

  { fase: "1.4  Hardware e Sensores IoT", ini: 2, fim: 7, critica: true },
  { t: "Especificação técnica do sensor", ini: 2, fim: 2 },
  { t: "Cotação, contrato e garantia", dep: "Aporte", ini: 5, fim: 5, critica: true },
  { t: "Protótipo em bancada e testes", dep: "Fornecedores", ini: 5, fim: 6, critica: true },
  { t: "Lote piloto de produção", dep: "Protótipo", ini: 6, fim: 7, critica: true },

  { fase: "1.5  Software e Aplicativo", ini: 2, fim: 7 },
  { t: "UX, requisitos e protótipo de telas", ini: 2, fim: 3 },
  { t: "Back-end, APIs e banco de dados", dep: "Requisitos", ini: 3, fim: 5 },
  { t: "Aplicativo móvel e dashboard", dep: "Back-end", ini: 4, fim: 6 },
  { t: "Autenticação e painel de controle", ini: 6, fim: 7 },

  { fase: "1.6  IA, Dados e Analytics", ini: 4, fim: 8 },
  { t: "Coleta e ingestão de dados", dep: "Back-end", ini: 4, fim: 5 },
  { t: "Detecção de anomalias e alertas", ini: 5, fim: 7 },
  { t: "Previsão de consumo e de conta", ini: 6, fim: 7 },
  { t: "Localização por assinatura de vazão", ini: 7, fim: 8 },

  { fase: "1.7  Integração IoT", ini: 5, fim: 8, critica: true },
  { t: "Comunicação sensor ↔ aplicativo", dep: "Protótipo, back-end", ini: 5, fim: 6, critica: true },
  { t: "Processamento e fluxo contínuo", ini: 6, fim: 7, critica: true },
  { t: "Testes de integração ponta a ponta", ini: 7, fim: 8, critica: true },

  { fase: "1.3  Validação do MVP", ini: 7, fim: 9, critica: true },
  { t: "Instalação piloto em condomínio", dep: "Lote piloto, integração", ini: 7, fim: 8, critica: true },
  { t: "Coleta de feedback e métricas de uso", ini: 8, fim: 8, critica: true },
  { t: "Ajustes finos em sensor e aplicativo", ini: 8, fim: 9, critica: true },
  { t: "Homologação do MVP para o mercado", ini: 9, fim: 9, critica: true, marco: "MVP homologado" },

  { fase: "1.8  Segurança e LGPD", ini: 6, fim: 9 },
  { t: "Criptografia e proteção na nuvem", ini: 6, fim: 7 },
  { t: "Adequação jurídica e termos de aceite", ini: 7, fim: 8 },
  { t: "Confiabilidade e tempo de resposta", ini: 8, fim: 9 },
  { t: "Plano de contingência operacional", ini: 9, fim: 9 },

  { fase: "1.9  Marketing e Lançamento", ini: 8, fim: 11, critica: true },
  { t: "Divulgação em redes e WhatsApp", ini: 8, fim: 9 },
  { t: "Networking com síndicos e administradoras", ini: 8, fim: 10 },
  { t: "Lançamento comercial e primeiros clientes", dep: "MVP homologado", ini: 10, fim: 10, critica: true, marco: "Lançamento" },
  { t: "Pós-venda, suporte e expansão", ini: 10, fim: 11 },

  { fase: "1.10  Encerramento e Entregas", ini: 10, fim: 11, critica: true },
  { t: "Avaliação técnica, financeira e de impacto", ini: 10, fim: 11, critica: true },
  { t: "Documentação de lições aprendidas", ini: 11, fim: 11 },
  { t: "Prestação de contas e encerramento", ini: 11, fim: 11, critica: true },
];

/* ---------------- larguras ----------------
   A4 paisagem: 16838 DXA de largura, margens de 1134 -> 14570 úteis. */
const COL_ATIV = 4370;
const COL_MES = 850;
const LARGURA = COL_ATIV + COL_MES * 12; // 14570
const COLS = [COL_ATIV, ...Array(12).fill(COL_MES)];

const bordaFina = { style: BorderStyle.SINGLE, size: 2, color: LINHA };

function txt(text, o = {}) {
  return new TextRun({
    text, font: o.mono ? "Consolas" : "Calibri",
    size: o.size ?? 16, bold: o.bold, color: o.color ?? TINTA, italics: o.italics,
  });
}
function par(runs, o = {}) {
  return new Paragraph({
    children: Array.isArray(runs) ? runs : [runs],
    alignment: o.align, spacing: o.spacing ?? { before: 0, after: 0 },
  });
}
function celula(children, o = {}) {
  return new TableCell({
    children,
    width: { size: o.width, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 40, bottom: 40, left: o.pad ?? 80, right: o.pad ?? 80 },
    columnSpan: o.span,
    borders: { top: bordaFina, bottom: bordaFina, left: bordaFina, right: bordaFina },
  });
}

/* ---------------- cabeçalho do Gantt ---------------- */
const cabecalho = new TableRow({
  tableHeader: true,
  children: [
    celula([par(txt("ATIVIDADE", { bold: true, size: 14, color: CINZA }))], { width: COL_ATIV, fill: CINZA_CLARO }),
    ...MESES.map((m) =>
      celula([par(txt(m, { bold: true, size: 13, color: CINZA, mono: true }), { align: AlignmentType.CENTER })],
        { width: COL_MES, fill: CINZA_CLARO, pad: 20 })),
  ],
});

/* ---------------- linhas ---------------- */
const linhas = LINHAS.map((l) => {
  const ehFase = !!l.fase;
  const cor = l.critica ? VERMELHO : AZUL;
  const corBarra = ehFase ? cor : (l.critica ? VERMELHO_CLARO : AZUL_CLARO);
  const fundoRotulo = ehFase ? CINZA_CLARO : undefined;

  const rotulo = [];
  if (ehFase) {
    rotulo.push(par(txt(l.fase, { bold: true, size: 17 })));
  } else {
    rotulo.push(par(txt(l.t, { size: 16 })));
    if (l.dep) rotulo.push(par(txt("depende de: " + l.dep, { size: 12, color: CINZA, italics: true, mono: true })));
    // O losango sozinho na grade não diz o que o marco significa. Nomeá-lo
    // aqui evita que o leitor tenha de cruzar com a tabela de marcos.
    if (l.marco) rotulo.push(par(txt("◆ marco: " + l.marco, { size: 13, color: "B87309", bold: true })));
  }

  const celulasMes = [];
  for (let m = 0; m < 12; m++) {
    const ativa = m >= l.ini && m <= l.fim;
    const conteudo = [];
    if (l.marco && m === l.fim) {
      conteudo.push(par(txt("◆", { size: 16, color: "B87309", bold: true }), { align: AlignmentType.CENTER }));
    } else {
      conteudo.push(par(txt("", { size: ehFase ? 8 : 12 })));
    }
    celulasMes.push(celula(conteudo, {
      width: COL_MES, pad: 20,
      fill: ativa ? corBarra : undefined,
    }));
  }

  return new TableRow({ children: [celula(rotulo, { width: COL_ATIV, fill: fundoRotulo }), ...celulasMes] });
});

const tabelaGantt = new Table({
  columnWidths: COLS,
  width: { size: LARGURA, type: WidthType.DXA },
  rows: [cabecalho, ...linhas],
});

/* ---------------- tabelas auxiliares ---------------- */
function tabelaSimples(cabecalhos, dados, larguras) {
  const total = larguras.reduce((a, b) => a + b, 0);
  return new Table({
    columnWidths: larguras,
    width: { size: total, type: WidthType.DXA },
    rows: [
      new TableRow({
        tableHeader: true,
        children: cabecalhos.map((c, i) =>
          celula([par(txt(c, { bold: true, size: 14, color: CINZA }))], { width: larguras[i], fill: CINZA_CLARO })),
      }),
      ...dados.map((linha) =>
        new TableRow({
          children: linha.map((v, i) =>
            celula([par(txt(String(v), { size: 16, bold: i === 0 && larguras.length > 2 }))], { width: larguras[i] })),
        })),
    ],
  });
}

const premissas = tabelaSimples(
  ["Item", "Definição"],
  [
    ["Início do projeto", "Outubro de 2026, após aprovação do Termo de Abertura"],
    ["Duração total", "12 meses, com encerramento em setembro de 2027"],
    ["Equipe", "12 colaboradores: hardware, software, ciência de dados/IA e atendimento"],
    ["Orçamento", "R$ 250 mil, via aporte de investidor-anjo"],
    ["Sede", "Espaço compartilhado em Campinas / SP"],
    ["Mercado piloto", "Condomínios de bairros centrais de Campinas"],
  ],
  [3200, 11370],
);

const marcos = tabelaSimples(
  ["Marco", "Previsão", "Significado"],
  [
    ["Aporte de R$ 250 mil captado", "fev/2027", "Libera a encomenda de hardware; até aqui nada pode ser comprado"],
    ["MVP homologado", "jul/2027", "Produto validado em campo e liberado para comercialização"],
    ["Lançamento comercial", "ago/2027", "Início da aquisição de clientes e da receita recorrente"],
  ],
  [4200, 1800, 8570],
);

const entregas = tabelaSimples(
  ["Data", "Entrega", "Situação"],
  [
    ["até 08/09/2026", "Termo de abertura, EAP, stakeholders e análise de mercado", "Concluído"],
    ["15/09/2026", "1.6 — Diagrama de Gantt", "Este documento"],
    ["17/09/2026", "1.7 — Levantamento de custos", "A fazer"],
    ["21/09/2026", "1.8 — Protótipo", "Em construção"],
    ["22/09/2026", "1.9 — Apresentação final", "A fazer"],
    ["25/09/2026", "1.10 — Relatório final", "A fazer"],
  ],
  [2400, 9170, 3000],
);

/* ---------------- legenda ---------------- */
const legenda = new Table({
  columnWidths: [500, 3200, 500, 3600, 500, 3200],
  width: { size: 11500, type: WidthType.DXA },
  rows: [new TableRow({
    children: [
      celula([par(txt(""))], { width: 500, fill: AZUL_CLARO }),
      celula([par(txt("Atividade com folga", { size: 15 }))], { width: 3200 }),
      celula([par(txt(""))], { width: 500, fill: VERMELHO_CLARO }),
      celula([par(txt("Atividade no caminho crítico", { size: 15 }))], { width: 3600 }),
      celula([par(txt("◆", { size: 16, color: "B87309", bold: true }), { align: AlignmentType.CENTER })], { width: 500 }),
      celula([par(txt("Marco do projeto", { size: 15 }))], { width: 3200 }),
    ],
  })],
});

/* ---------------- documento ---------------- */
const espaco = (n = 200) => new Paragraph({ children: [], spacing: { after: n } });

function titulo(texto) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text: texto, font: "Calibri", size: 26, bold: true, color: TINTA })],
  });
}

const doc = new Document({
  creator: "Hydro Mind",
  title: "Diagrama de Gantt — Água Alerta",
  description: "Cronograma do projeto Água Alerta",
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE },
        margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 },
      },
    },
    children: [
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: "HYDRO MIND  ·  ÁGUA ALERTA", font: "Consolas", size: 16, color: AZUL, bold: true })],
      }),
      new Paragraph({
        spacing: { after: 100 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: AZUL } },
        children: [new TextRun({ text: "Diagrama de Gantt do Projeto", font: "Calibri", size: 40, bold: true, color: TINTA })],
      }),
      new Paragraph({
        spacing: { before: 160, after: 200 },
        children: [new TextRun({
          text: "Cronograma das dez frentes da Estrutura Analítica do Projeto, com dependências entre atividades, marcos e caminho crítico. Horizonte de doze meses, de outubro de 2026 a setembro de 2027.",
          font: "Calibri", size: 19, color: CINZA,
        })],
      }),

      titulo("1.  Premissas de planejamento"),
      premissas,
      espaco(),

      titulo("2.  Diagrama de Gantt"),
      new Paragraph({
        spacing: { after: 160 },
        children: [new TextRun({
          text: "Cada linha é uma atividade; abaixo do nome está indicada a atividade da qual ela depende. As barras em vermelho compõem o caminho crítico — atrasos nelas empurram a data final do projeto na mesma medida.",
          font: "Calibri", size: 17, color: CINZA,
        })],
      }),
      tabelaGantt,
      espaco(160),
      legenda,
      espaco(),

      new Paragraph({ children: [new TextRun({ text: "", break: 1 })], pageBreakBefore: true }),

      titulo("3.  Marcos do projeto"),
      marcos,
      espaco(),

      titulo("4.  Caminho crítico"),
      new Paragraph({
        spacing: { after: 140 },
        children: [new TextRun({
          text: "1.1 Planejamento  →  1.2 Captação do aporte  →  1.4 Hardware e lote piloto  →  1.7 Integração IoT  →  1.3 Validação do MVP  →  1.9 Lançamento comercial  →  1.10 Encerramento",
          font: "Consolas", size: 17, bold: true, color: VERMELHO,
        })],
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({ text: "O gargalo é a captação. ", font: "Calibri", size: 19, bold: true, color: TINTA }),
          new TextRun({
            text: "Nenhum componente de hardware pode ser encomendado antes de o aporte entrar, e sem sensor físico não há integração, nem piloto, nem lançamento. Por isso a prospecção de investidores começa em dezembro, ainda durante o planejamento — quatro meses de antecedência para a única atividade crítica que não depende de mais ninguém para começar.",
            font: "Calibri", size: 19, color: TINTA,
          }),
        ],
      }),
      new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({
          text: "As frentes de software, IA e segurança/LGPD correm em paralelo justamente por não dependerem do aporte, e chegam prontas quando o sensor chega. É essa sobreposição que mantém o projeto em doze meses.",
          font: "Calibri", size: 19, color: TINTA,
        })],
      }),
      espaco(),

      titulo("5.  Entregas acadêmicas — setembro de 2026"),
      new Paragraph({
        spacing: { after: 160 },
        children: [new TextRun({
          text: "Cronograma de curto prazo da disciplina, anterior ao início do projeto modelado acima.",
          font: "Calibri", size: 17, color: CINZA,
        })],
      }),
      entregas,
      espaco(300),

      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINHA } },
        spacing: { before: 200, after: 60 },
        children: [new TextRun({
          text: "Hydro Mind — Água Alerta · Diagrama de Gantt, versão 1.0 · setembro de 2026.",
          font: "Calibri", size: 15, color: CINZA,
        })],
      }),
      new Paragraph({
        children: [new TextRun({
          text: "Estrutura baseada na Estrutura Analítica do Projeto elaborada pelos autores. Datas de início e durações são estimativas de planejamento, sujeitas a revisão após a captação do aporte.",
          font: "Calibri", size: 15, color: CINZA,
        })],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then((b) => {
  fs.writeFileSync(process.argv[2], b);
  console.log("gerado:", process.argv[2], (b.length / 1024).toFixed(1) + " KB");
});
