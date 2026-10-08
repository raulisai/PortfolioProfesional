// Íconos para las tecnologías: marcas de Simple Icons y, para conceptos sin marca, íconos de línea.
import {
  siPython, siGnubash, siRedhatopenshift, siKubernetes, siJenkins, siGithubactions, siAnsible, siKibana,
  siLinux, siGit, siSpring, siUipath, siLangchain, siTensorflow, siScikitlearn, siApachespark, siModelcontextprotocol,
} from 'simple-icons';

type SimpleIcon = { path: string; hex: string };
export type TechIcon = { kind: 'brand' | 'line'; path: string; color: string };

const brands: Record<string, SimpleIcon> = {
  python: siPython, bash: siGnubash, openshift: siRedhatopenshift, kubernetes: siKubernetes, jenkins: siJenkins,
  'github actions': siGithubactions, ansible: siAnsible, kibana: siKibana, linux: siLinux, git: siGit, spring: siSpring,
  uipath: siUipath, langchain: siLangchain, tensorflow: siTensorflow, 'scikit-learn': siScikitlearn, spark: siApachespark,
  'mcp servers': siModelcontextprotocol,
};

const lines: Record<string, string> = {
  aws: 'M17.5 19H7a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10.5a4.25 4.25 0 0 1-1.5 8.5Z',
  'on-premise': 'M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01',
  'ci/cd': 'M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z',
  microservicios: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  troubleshooting: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4Z',
  'rest apis': 'M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1',
  java: 'M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4ZM6 2v2M10 2v2M14 2v2',
  sql: 'M12 3c4.97 0 9 1.34 9 3s-4.03 3-9 3-9-1.34-9-3 4.03-3 9-3ZM3 6v12c0 1.66 4.03 3 9 3s9-1.34 9-3V6M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3',
  'servicios web': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18',
  'migración cloud': 'M12 12v9M8 16l4-4 4 4M20 16.6A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.3',
  orchestrator: 'M9 3h6v6H9zM3 15h6v6H3zM15 15h6v6h-6zM12 9v3M6 15v-3h12v3',
  rpa: 'M12 8V4H8M4 8h16v12H4zM2 14h2M20 14h2M9 13v2M15 13v2',
  'visual basic': 'M16 18l6-6-6-6M8 6l-6 6 6 6',
  automatización: 'M13 2 3 14h9l-1 8 10-12h-9l1-8Z',
  monitoreo: 'M22 12h-4l-3 9L9 3l-3 9H2',
};
const fallback = 'M12 3l9 5-9 5-9-5 9-5ZM3 13l9 5 9-5';

// Las marcas muy oscuras no se verían sobre el fondo: se aclaran a lavanda
const readable = (hex: string) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.22 ? '#c9ccff' : `#${hex}`;
};

export function techIcon(name: string): TechIcon {
  const key = name.toLowerCase();
  const brand = brands[key];
  if (brand) return { kind: 'brand', path: brand.path, color: readable(brand.hex) };
  return { kind: 'line', path: lines[key] ?? fallback, color: '#a5adff' };
}
