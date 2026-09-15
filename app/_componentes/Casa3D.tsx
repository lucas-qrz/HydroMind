"use client";

/*
 * Casa 3D da abertura: uma maquete em corte, no estilo "argila", com os
 * sensores do Água Alerta pulsando nos pontos hidráulicos.
 *
 * Toda a geometria é feita com primitivas (caixas, cilindros, esferas) em vez
 * de um modelo importado: não depende de arquivo de terceiros, carrega rápido
 * e cada peça pode ser ajustada direto no código.
 *
 * Interação (o estado mora em CasaInterativa):
 *   - ponteiro sobre a casa  -> ela amplia e os sensores ganham rótulo
 *   - ponteiro sobre cômodo  -> o piso acende e o cartão mostra o detalhe
 *   - clique no cômodo       -> a câmera aproxima dele
 * O zoom por cômodo fica no clique, não no hover: se a câmera se movesse ao
 * passar o mouse, o cômodo "fugiria" do cursor e a cena ficaria oscilando.
 */

import { useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { COMODOS, type Comodo, type IdComodo } from "./comodos";

const COR = {
  argila: "#F2F6F9",
  parede: "#FFFFFF",
  base: "#DCE7EE",
  marinho: "#0B2438",
  agua: "#35C4E8",
  aguaEscura: "#0C6E8E",
  grama: "#CDE9D9",
  folha: "#6FBF97",
  folhaClara: "#9AD4B5",
  tronco: "#C8A27A",
  critico: "#E5534B",
  metal: "#B7C7D3",
  vidro: "#BFE3F0",
  vidroChuveiro: "#9FD8EA",
  tapete: "#D3ECF5",
  armario: "#E3EEF4",
  realce: "#BDE7F5",
  piso: {
    cozinha: "#EAF3F8",
    sala: "#F0F4F7",
    banheiro: "#E0F1F7",
    area: "#EBF2F6",
  },
};

type V3 = [number, number, number];

export interface PropsCasa {
  hover: IdComodo | null;
  foco: IdComodo | null;
  sobreCasa: boolean;
  reduzido: boolean;
  /** `false` quando a casa saiu da tela: a renderização para e poupa bateria. */
  ativo: boolean;
  /** Telas de toque: menos resolução e sombra menor, para celulares simples. */
  leve: boolean;
  onHover: (id: IdComodo | null) => void;
  onFoco: (id: IdComodo) => void;
}

export default function Casa3D(props: PropsCasa) {
  return (
    <Canvas
      orthographic
      shadows
      flat
      frameloop={props.ativo ? "always" : "never"}
      dpr={props.leve ? [1, 1.5] : [1, 2]}
      camera={{ position: [10.8, 9.45, 10], zoom: 16, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "pan-y" }}
      onPointerLeave={() => {
        document.body.style.cursor = "";
      }}
    >
      <Cena {...props} />
    </Canvas>
  );
}

/* ------------------------------------------------------------------ */

const DESLOCAMENTO = new THREE.Vector3(10, 9, 10);
const CENTRO = new THREE.Vector3(0.8, 0.45, 0);

function Cena({ hover, foco, sobreCasa, reduzido, leve, onHover, onFoco }: PropsCasa) {
  const grupo = useRef<THREE.Group>(null);
  const olhar = useRef(CENTRO.clone());
  const alvo = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const cam = state.camera as THREE.OrthographicCamera;
    const { width, height } = state.size;

    // Zoom proporcional ao tamanho do canvas: a casa ocupa o mesmo espaço
    // relativo no celular e no monitor grande.
    const base = Math.min(width / 10.6, height / 7.6);
    const c = foco ? COMODOS.find((x) => x.id === foco) : undefined;
    const zoomAlvo = c ? base * 1.9 : sobreCasa ? base * 1.12 : base;

    if (c) alvo.set(...c.foco);
    else alvo.copy(CENTRO);

    // Suavização independente da taxa de quadros.
    const k = 1 - Math.exp(-delta * (reduzido ? 14 : 3.5));
    olhar.current.lerp(alvo, k);
    cam.position.copy(olhar.current).add(DESLOCAMENTO);
    cam.zoom = THREE.MathUtils.lerp(cam.zoom, zoomAlvo, k);
    cam.lookAt(olhar.current);
    cam.updateProjectionMatrix();

    const g = grupo.current;
    if (g) {
      // Leve giro acompanhando o mouse e flutuação contínua.
      const giro = reduzido || c ? 0 : state.pointer.x * 0.14;
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, giro, k);
      g.position.y = reduzido ? 0 : Math.sin(state.clock.elapsedTime * 0.9) * 0.05;
    }
  });

  const entrar = (id: IdComodo | null) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(id);
    document.body.style.cursor = id ? "pointer" : "";
  };
  const zona = (id: IdComodo) => ({
    onPointerOver: entrar(id),
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onFoco(id);
    },
  });
  const aceso = (id: IdComodo) => hover === id || foco === id;

  return (
    <>
      <ambientLight intensity={0.85} />
      <hemisphereLight args={["#ffffff", "#cfe3ee", 0.7]} />
      <directionalLight
        position={[5, 11, 6]}
        intensity={1.5}
        castShadow
        shadow-mapSize={leve ? [512, 512] : [1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0006}
      />

      <group ref={grupo}>
        {/* Base, laje e paredes: não pertencem a nenhum cômodo */}
        <group onPointerOver={entrar(null)}>
          <RoundedBox
            args={[8.8, 0.4, 5.2]}
            radius={0.14}
            smoothness={4}
            position={[0.8, -0.2, 0]}
            receiveShadow
          >
            <meshStandardMaterial color={COR.base} roughness={0.9} />
          </RoundedBox>
          <B p={[0, 0.02, 0]} s={[6.2, 0.04, 4.2]} cor={COR.argila} />
          <Paredes />
        </group>

        <group {...zona("cozinha")}>
          <Piso p={[-1.5, 0.05, -1]} s={[3, 0.02, 2]} cor={COR.piso.cozinha} ativo={aceso("cozinha")} />
          <Cozinha />
        </group>

        <group onPointerOver={entrar(null)}>
          <Piso p={[1.5, 0.05, -1]} s={[3, 0.02, 2]} cor={COR.piso.sala} ativo={false} />
          <Sala />
        </group>

        <group {...zona("banheiro")}>
          <Piso p={[-1.9, 0.05, 1]} s={[2.2, 0.02, 2]} cor={COR.piso.banheiro} ativo={aceso("banheiro")} />
          <Banheiro />
        </group>

        <group {...zona("area")}>
          <Piso p={[1.1, 0.05, 1]} s={[3.8, 0.02, 2]} cor={COR.piso.area} ativo={aceso("area")} />
          <AreaServico />
        </group>

        <group {...zona("jardim")}>
          <Jardim ativo={aceso("jardim")} />
        </group>

        <group {...zona("caixa")}>
          <CaixaDagua />
        </group>

        {COMODOS.map((c) => (
          <Sensor
            key={c.id}
            c={c}
            destaque={aceso(c.id)}
            rotulo={sobreCasa || foco !== null}
            reduzido={reduzido}
          />
        ))}
      </group>

      {/* Sombra macia só sob a base. `far` curto captura apenas a plataforma
          (e não paredes e caixa d'água), e `scale` menor evita que o borrão
          ultrapasse a borda do canvas e apareça cortado. */}
      <ContactShadows
        position={[0.8, -0.41, 0]}
        opacity={0.28}
        scale={12}
        blur={2.4}
        far={1.2}
        resolution={512}
        color={COR.marinho}
      />
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Primitivas
 * ------------------------------------------------------------------ */

function B({
  p,
  s,
  cor,
  opacidade,
  sombra = true,
}: {
  p: V3;
  s: V3;
  cor: string;
  opacidade?: number;
  sombra?: boolean;
}) {
  const transparente = opacidade !== undefined;
  return (
    <mesh position={p} castShadow={sombra} receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial
        color={cor}
        roughness={0.8}
        transparent={transparente}
        opacity={opacidade ?? 1}
        depthWrite={!transparente}
      />
    </mesh>
  );
}

function C({ p, r, h, cor, rot }: { p: V3; r: number; h: number; cor: string; rot?: V3 }) {
  return (
    <mesh position={p} rotation={rot} castShadow receiveShadow>
      <cylinderGeometry args={[r, r, h, 28]} />
      <meshStandardMaterial color={cor} roughness={0.75} />
    </mesh>
  );
}

function E({ p, r, cor }: { p: V3; r: number; cor: string }) {
  return (
    <mesh position={p} castShadow receiveShadow>
      <sphereGeometry args={[r, 24, 24]} />
      <meshStandardMaterial color={cor} roughness={0.85} />
    </mesh>
  );
}

function R({ p, s, cor, raio = 0.06 }: { p: V3; s: V3; cor: string; raio?: number }) {
  return (
    <RoundedBox args={s} radius={raio} smoothness={3} position={p} castShadow receiveShadow>
      <meshStandardMaterial color={cor} roughness={0.8} />
    </RoundedBox>
  );
}

/** Piso que muda de cor suavemente quando o cômodo está aceso. */
function Piso({ p, s, cor, ativo }: { p: V3; s: V3; cor: string; ativo: boolean }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const corBase = useMemo(() => new THREE.Color(cor), [cor]);
  const corAtiva = useMemo(() => new THREE.Color(COR.realce), []);
  useFrame((_, d) => {
    mat.current?.color.lerp(ativo ? corAtiva : corBase, 1 - Math.exp(-d * 10));
  });
  return (
    <mesh position={p} receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial ref={mat} color={cor} roughness={0.9} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ *
 * Sensor: pino luminoso com anel pulsando e rótulo
 * ------------------------------------------------------------------ */

function Sensor({
  c,
  destaque,
  rotulo,
  reduzido,
}: {
  c: Comodo;
  destaque: boolean;
  rotulo: boolean;
  reduzido: boolean;
}) {
  const pino = useRef<THREE.Group>(null);
  const anel = useRef<THREE.Mesh>(null);
  const alerta = c.estado === "atencao";
  const cor = alerta ? COR.critico : COR.agua;
  const fase = c.pino[0] * 0.37;

  useFrame(({ clock }, d) => {
    const t = clock.elapsedTime + fase;
    const g = pino.current;
    if (g) {
      const escala = THREE.MathUtils.lerp(g.scale.x, destaque ? 1.6 : 1, 1 - Math.exp(-d * 10));
      g.scale.setScalar(escala);
      g.position.y = c.pino[1] + (reduzido ? 0 : Math.sin(t * 2.2) * 0.05);
    }
    const a = anel.current;
    if (a) {
      // O anel do sensor em alerta pulsa mais rápido.
      const f = reduzido ? 0.4 : (t * (alerta ? 1.3 : 0.8)) % 1;
      a.scale.setScalar(1 + f * 2.4);
      (a.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - f);
    }
  });

  return (
    <group position={[c.pino[0], 0, c.pino[2]]}>
      <group ref={pino} position={[0, c.pino[1], 0]}>
        <mesh>
          <sphereGeometry args={[0.085, 24, 24]} />
          <meshStandardMaterial color={cor} emissive={cor} emissiveIntensity={0.9} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.15, 24, 24]} />
          <meshBasicMaterial color={cor} transparent opacity={0.22} depthWrite={false} />
        </mesh>
        <mesh ref={anel} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.12, 0.16, 40]} />
          <meshBasicMaterial
            color={cor}
            transparent
            opacity={0.5}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        {rotulo && (
          <Html position={[0, 0.34, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
            <span
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-lg transition-colors ${
                destaque ? "bg-tinta text-fundo border-tinta" : "bg-superficie text-tinta border-linha"
              }`}
            >
              {alerta && <i className="inline-block h-1.5 w-1.5 rounded-full bg-critico" />}
              {c.nome}
            </span>
          </Html>
        )}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Estrutura e cômodos
 * ------------------------------------------------------------------ */

function Paredes() {
  const H = 0.95; // paredes do fundo: altura cheia
  const h = 0.32; // paredes da frente: baixas, para ver o interior
  const T = 0.12;
  const Hi = 0.6; // divisórias internas
  const t = 0.08;
  return (
    <>
      <B p={[0, H / 2, -2.04]} s={[6.2, H, T]} cor={COR.parede} />
      <B p={[-3.04, H / 2, 0]} s={[T, H, 4.2]} cor={COR.parede} />
      <B p={[0, h / 2, 2.04]} s={[6.2, h, T]} cor={COR.parede} />
      <B p={[3.04, h / 2, 0]} s={[T, h, 4.2]} cor={COR.parede} />

      {/* Faixa na cor da marca no topo das paredes altas */}
      <B p={[0, H + 0.012, -2.04]} s={[6.2, 0.024, T + 0.004]} cor={COR.agua} sombra={false} />
      <B p={[-3.04, H + 0.012, 0]} s={[T + 0.004, 0.024, 4.2]} cor={COR.agua} sombra={false} />

      {/* Janelas */}
      <B p={[1.5, 0.58, -2.03]} s={[1.2, 0.36, T + 0.02]} cor={COR.vidro} sombra={false} />
      <B p={[-3.03, 0.62, 0.7]} s={[T + 0.02, 0.28, 0.5]} cor={COR.vidro} sombra={false} />

      {/* Divisórias internas, com vãos de porta */}
      <B p={[-2.6, Hi / 2, 0]} s={[0.8, Hi, t]} cor={COR.parede} />
      <B p={[-0.5, Hi / 2, 0]} s={[1.8, Hi, t]} cor={COR.parede} />
      <B p={[2.1, Hi / 2, 0]} s={[1.8, Hi, t]} cor={COR.parede} />
      <B p={[0, Hi / 2, -1.4]} s={[t, Hi, 1.2]} cor={COR.parede} />
      <B p={[-0.8, Hi / 2, 1.4]} s={[t, Hi, 1.2]} cor={COR.parede} />
    </>
  );
}

function Cozinha() {
  return (
    <>
      {/* Bancada com tampo, cuba e torneira */}
      <B p={[-1.9, 0.25, -1.72]} s={[2.1, 0.4, 0.5]} cor={COR.parede} />
      <B p={[-1.9, 0.47, -1.72]} s={[2.16, 0.04, 0.54]} cor={COR.marinho} />
      <B p={[-1.5, 0.495, -1.72]} s={[0.5, 0.012, 0.34]} cor={COR.metal} />
      <C p={[-1.5, 0.57, -1.9]} r={0.022} h={0.16} cor={COR.metal} />
      <B p={[-1.5, 0.64, -1.83]} s={[0.035, 0.03, 0.15]} cor={COR.metal} />
      {/* Geladeira */}
      <R p={[-0.45, 0.52, -1.68]} s={[0.6, 1.0, 0.55]} cor={COR.parede} raio={0.05} />
      <B p={[-0.22, 0.62, -1.39]} s={[0.03, 0.3, 0.03]} cor={COR.metal} />
      {/* Mesa e bancos */}
      <C p={[-1.4, 0.4, -0.6]} r={0.4} h={0.04} cor={COR.parede} />
      <C p={[-1.4, 0.2, -0.6]} r={0.04} h={0.38} cor={COR.metal} />
      <R p={[-1.98, 0.17, -0.6]} s={[0.26, 0.3, 0.26]} cor={COR.agua} raio={0.05} />
      <R p={[-0.82, 0.17, -0.6]} s={[0.26, 0.3, 0.26]} cor={COR.agua} raio={0.05} />
    </>
  );
}

function Sala() {
  return (
    <>
      <B p={[1.55, 0.07, -0.95]} s={[2, 0.02, 1.2]} cor={COR.tapete} sombra={false} />
      {/* Sofá */}
      <R p={[1.6, 0.21, -1.62]} s={[1.7, 0.3, 0.6]} cor={COR.marinho} raio={0.07} />
      <R p={[1.6, 0.44, -1.86]} s={[1.7, 0.42, 0.16]} cor={COR.marinho} raio={0.06} />
      <R p={[0.82, 0.3, -1.66]} s={[0.16, 0.36, 0.62]} cor={COR.marinho} raio={0.05} />
      <R p={[2.38, 0.3, -1.66]} s={[0.16, 0.36, 0.62]} cor={COR.marinho} raio={0.05} />
      {/* Mesa de centro e planta */}
      <C p={[1.6, 0.24, -0.85]} r={0.3} h={0.05} cor={COR.parede} />
      <C p={[1.6, 0.13, -0.85]} r={0.035} h={0.18} cor={COR.metal} />
      <C p={[2.7, 0.2, -0.4]} r={0.13} h={0.3} cor={COR.parede} />
      <E p={[2.7, 0.5, -0.4]} r={0.22} cor={COR.folha} />
    </>
  );
}

function Banheiro() {
  return (
    <>
      {/* Vaso com caixa acoplada, encostado na divisória */}
      <R p={[-2.6, 0.44, 0.16]} s={[0.4, 0.34, 0.15]} cor={COR.parede} raio={0.03} />
      <C p={[-2.6, 0.16, 0.44]} r={0.17} h={0.24} cor={COR.parede} />
      <C p={[-2.6, 0.295, 0.44]} r={0.18} h={0.03} cor={COR.argila} />
      {/* Pia, cuba e espelho */}
      <B p={[-2.78, 0.22, 1.45]} s={[0.34, 0.34, 0.6]} cor={COR.marinho} />
      <C p={[-2.78, 0.41, 1.45]} r={0.13} h={0.04} cor={COR.parede} />
      <B p={[-2.96, 0.66, 1.45]} s={[0.03, 0.34, 0.3]} cor={COR.vidro} sombra={false} />
      {/* Box do chuveiro */}
      <B p={[-1.3, 0.08, 1.42]} s={[0.86, 0.04, 0.86]} cor={COR.parede} />
      <B
        p={[-1.3, 0.52, 1.42]}
        s={[0.86, 0.86, 0.86]}
        cor={COR.vidroChuveiro}
        opacidade={0.25}
        sombra={false}
      />
      <C p={[-1.3, 0.9, 1.05]} r={0.07} h={0.02} cor={COR.metal} />
    </>
  );
}

function AreaServico() {
  const deitado: V3 = [Math.PI / 2, 0, 0];
  return (
    <>
      {/* Máquina de lavar, com a porta virada para a câmera */}
      <R p={[0.1, 0.39, 0.36]} s={[0.62, 0.66, 0.55]} cor={COR.parede} raio={0.06} />
      <C p={[0.1, 0.38, 0.64]} r={0.2} h={0.02} cor={COR.marinho} rot={deitado} />
      <C p={[0.1, 0.38, 0.652]} r={0.135} h={0.02} cor={COR.vidro} rot={deitado} />
      {/* Tanque */}
      <B p={[1.55, 0.28, 0.32]} s={[0.62, 0.44, 0.48]} cor={COR.parede} />
      <B p={[1.55, 0.505, 0.32]} s={[0.5, 0.012, 0.36]} cor={COR.metal} />
      <C p={[1.55, 0.58, 0.12]} r={0.02} h={0.14} cor={COR.metal} />
      {/* Armário, cesto e planta */}
      <B p={[2.4, 0.3, 0.26]} s={[0.9, 0.5, 0.4]} cor={COR.armario} />
      <C p={[1.6, 0.18, 1.3]} r={0.16} h={0.26} cor={COR.agua} />
      <C p={[2.7, 0.2, 1.6]} r={0.13} h={0.3} cor={COR.parede} />
      <E p={[2.7, 0.5, 1.6]} r={0.2} cor={COR.folha} />
    </>
  );
}

function Jardim({ ativo }: { ativo: boolean }) {
  const pedras: [number, number][] = [
    [3.55, -0.35],
    [3.85, 0.05],
    [3.6, 0.45],
    [3.9, 0.85],
  ];
  return (
    <>
      <Piso p={[4.2, 0.04, 0]} s={[1.9, 0.08, 5]} cor={COR.grama} ativo={ativo} />
      <C p={[4.55, 0.33, 1.55]} r={0.06} h={0.5} cor={COR.tronco} />
      <E p={[4.55, 0.78, 1.55]} r={0.38} cor={COR.folha} />
      <C p={[3.75, 0.26, 2.05]} r={0.05} h={0.36} cor={COR.tronco} />
      <E p={[3.75, 0.58, 2.05]} r={0.26} cor={COR.folhaClara} />
      <E p={[4.85, 0.22, -0.2]} r={0.18} cor={COR.folha} />
      <E p={[4.9, 0.2, 0.3]} r={0.15} cor={COR.folhaClara} />
      {pedras.map(([x, z]) => (
        <C key={`${x}${z}`} p={[x, 0.09, z]} r={0.14} h={0.02} cor={COR.parede} />
      ))}
      {/* Torneira externa */}
      <B p={[3.4, 0.28, 0.6]} s={[0.12, 0.42, 0.12]} cor={COR.parede} />
      <C p={[3.48, 0.4, 0.6]} r={0.028} h={0.12} cor={COR.metal} rot={[0, 0, Math.PI / 2]} />
    </>
  );
}

function CaixaDagua() {
  const pernas: [number, number][] = [
    [4.05, -1.85],
    [4.55, -1.85],
    [4.05, -1.35],
    [4.55, -1.35],
  ];
  return (
    <>
      {pernas.map(([x, z]) => (
        <C key={`${x}${z}`} p={[x, 0.62, z]} r={0.035} h={1.1} cor={COR.metal} />
      ))}
      <B p={[4.3, 1.19, -1.6]} s={[0.72, 0.06, 0.72]} cor={COR.parede} />
      <C p={[4.3, 1.49, -1.6]} r={0.4} h={0.55} cor={COR.parede} />
      <C p={[4.3, 1.49, -1.6]} r={0.406} h={0.1} cor={COR.agua} />
      <C p={[4.3, 1.8, -1.6]} r={0.33} h={0.06} cor={COR.aguaEscura} />
      {/* Tubulação até a casa */}
      <C p={[3.7, 0.95, -1.6]} r={0.03} h={1.2} cor={COR.metal} rot={[0, 0, Math.PI / 2]} />
      <C p={[3.1, 0.64, -1.6]} r={0.03} h={0.62} cor={COR.metal} />
    </>
  );
}
