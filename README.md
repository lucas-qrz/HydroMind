# HydroMind — Água Alerta

Monitoramento de consumo de água com detecção de vazamentos, estimativa de conta
em tempo real e identificação da zona de origem do desperdício.

Projeto acadêmico. **Hydro Mind** é a empresa; **Água Alerta**, o produto.

---

## A tese

Campinas tem o **menor índice de perdas na rede pública do Brasil** — 15,2%,
contra uma média nacional de 39,53% (SINISA / Instituto Trata Brasil, base
2023–24). A conclusão que orienta todo o produto: o desperdício que resta não
está na rua, está **dentro do imóvel** — vaso sanitário com vedação gasta,
torneira gotejando, tubulação enterrada. Vazamentos que ninguém vê, e que só
aparecem na conta no fim do mês.

## Como rodar

```bash
npm install
npm run verificar   # prova que o motor de detecção funciona
npm run dev         # sobe o site e o painel
```

## Estrutura

```
lib/
  simulador.ts    gera consumo realista por eventos + injeta vazamentos
  detectores.ts   os quatro detectores de anomalia
  tarifa.ts       tarifa progressiva por faixas e projeção de conta
prisma/
  schema.prisma   Organizacao → Imovel → Zona → Sensor → Leitura
scripts/
  verificar.ts    verificação ponta a ponta do motor
app/              site de vendas (/) e painel (/painel)
```

### O simulador

O projeto não terá hardware físico, então o simulador **é a fonte de dados do
produto**, não um improviso. Ele gera consumo por **eventos discretos** (um
banho, uma descarga, um ciclo de máquina de lavar) em vez de uma curva suave por
hora — porque é a existência de **pausas** entre os usos que dá sentido ao
detector de fluxo contínuo. Uma curva suave nunca zera, e faria o detector
acusar vazamento o tempo todo.

O gerador é determinístico: a mesma semente produz sempre a mesma série.

### Os detectores

Nenhum deles é rede neural — é por isso que funcionam com poucos dados e são
explicáveis para o cliente. Um alerta que o morador não entende é um alerta que
ele ignora.

| Detector | Como funciona | O que pega |
|---|---|---|
| **Fluxo contínuo** | Vazão acima do mínimo por 45 min ininterruptos | Vazamento silencioso |
| **Piso de madrugada** | Consumo entre 2h e 5h no horário de Campinas | Vazamento estrutural — menor taxa de falso positivo |
| **Desvio da linha de base** | Z-score da hora cheia contra o histórico do mesmo dia da semana e mesma hora | Consumo anormal |
| **Assinatura de vazão** | Classifica vazão média e coeficiente de variação | **Onde** está vazando — o diferencial |

Verificado em `scripts/verificar.ts`: casa sem vazamento produz **zero** alertas;
com um vazamento de 0,31 L/min injetado, os detectores acusam fluxo contínuo,
consumo de madrugada e classificam corretamente o ponto como vedação de caixa
acoplada.

### A tarifa é progressiva

A conta de água não é linear: cada m³ é cobrado pelo preço da faixa em que cai.
Isso muda o argumento de venda — não é *"você economiza 260 litros"*, é
**"corrigir esse vazamento mantém o condomínio na faixa 2 e evita um degrau
inteiro de preço"**.

> ⚠️ Os preços em `TARIFA_SANASA_RESIDENCIAL` são **estimativas**. A estrutura de
> faixas está correta; os valores precisam ser substituídos pela tabela oficial
> da Sanasa antes de qualquer uso não acadêmico.

## Histórico

O projeto começou com um backend NestJS + Postgres e um protótipo estático de
painel. Ambos foram substituídos por um app Next.js único — a decisão está
registrada no commit de reestruturação, e o código anterior continua acessível
no histórico do repositório. O `schema.prisma` foi aproveitado e adaptado.

## Fontes

- Instituto Trata Brasil / GO Associados — Estudo de Perdas de Água 2025 e 2026 (dados SINISA, base 2023/2024)
- Censo Condominial 2024/25 (ABRASSP)
- Mordor Intelligence — Smart Water Management
- Sanasa / ARES-PCJ — estrutura tarifária
