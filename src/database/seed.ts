import type { SQLiteDatabase } from 'expo-sqlite';

interface SeedItem {
  id: string;
  name: string;
  slug: string;
}

const muscleGroups: SeedItem[] = [
  { id: 'mg-001', name: 'Peito', slug: 'peito' },
  { id: 'mg-002', name: 'Costas', slug: 'costas' },
  { id: 'mg-003', name: 'Pernas', slug: 'pernas' },
  { id: 'mg-004', name: 'Ombros', slug: 'ombros' },
  { id: 'mg-005', name: 'Braços', slug: 'bracos' },
  { id: 'mg-006', name: 'Abdômen', slug: 'abdomen' },
];

const movementGroups: SeedItem[] = [
  { id: 'mv-001', name: 'Empurrar', slug: 'empurrar' },
  { id: 'mv-002', name: 'Puxar', slug: 'puxar' },
  { id: 'mv-003', name: 'Agachar', slug: 'agachar' },
  { id: 'mv-004', name: 'Elevação', slug: 'elevacao' },
  { id: 'mv-005', name: 'Rotação', slug: 'rotacao' },
];

const equipmentItems: (SeedItem & { category: string })[] = [
  { id: 'eq-001', name: 'Barra', slug: 'barra', category: 'barras' },
  { id: 'eq-002', name: 'Halteres', slug: 'halteres', category: 'halteres' },
  { id: 'eq-003', name: 'Máquina', slug: 'maquina', category: 'maquinas' },
  { id: 'eq-004', name: 'Cabo', slug: 'cabo', category: 'cabos' },
  { id: 'eq-005', name: 'Peso Corporal', slug: 'peso-corporal', category: 'corporal' },
  { id: 'eq-006', name: 'Elástico', slug: 'elastico', category: 'acessorios' },
];

interface SeedExercise {
  id: string;
  name: string;
  slug: string;
  description: string;
  execution_tips: string;
  difficulty: string;
  thumbnail_url: string | null;
  muscle_group_id: string;
  movement_group_id: string;
  equipment_ids: string[];
  instructions: string[];
  alternatives: Array<{ exercise_id: string; reason: string }>;
}

const exercises: SeedExercise[] = [
  {
    id: 'ex-001',
    name: 'Supino Reto',
    slug: 'supino-reto',
    description: 'Exercício fundamental para desenvolvimento do peitoral maior. Deitado em um banco reto, segure a barra com as mãos na largura dos ombros e realize o movimento de flexão e extensão dos braços.',
    execution_tips: 'Mantenha os pés firmes no chão. Controle a descida da barra até encostar no peito. Expire ao subir. Não trave os cotovelos no topo.',
    difficulty: 'intermediate',
    thumbnail_url: null,
    muscle_group_id: 'mg-001',
    movement_group_id: 'mv-001',
    equipment_ids: ['eq-001', 'eq-002'],
    instructions: [
      'Deite-se em um banco reto com os pés apoiados no chão',
      'Segure a barra com as mãos na largura dos ombros',
      'Estenda os braços para levantar a barra do suporte',
      'Desça a barra lentamente até tocar o peito',
      'Empurre a barra de volta à posição inicial expandindo os braços',
    ],
    alternatives: [
      { exercise_id: 'ex-003', reason: 'Mesmo grupo muscular, variação com halteres' },
    ],
  },
  {
    id: 'ex-002',
    name: 'Remada Curvada',
    slug: 'remada-curvada',
    description: 'Exercício composto para desenvolvimento das costas. Com o tronco inclinado, puxe a barra em direção ao abdômen contraindo as escápulas.',
    execution_tips: 'Mantenha a coluna neutra. Não use impulso. Contraia as escápulas no topo do movimento. Controle a descida.',
    difficulty: 'intermediate',
    thumbnail_url: null,
    muscle_group_id: 'mg-002',
    movement_group_id: 'mv-002',
    equipment_ids: ['eq-001', 'eq-002'],
    instructions: [
      'Em pé, segure a barra com as mãos na largura dos ombros',
      'Incline o tronco para frente mantendo a coluna reta',
      'Puxe a barra em direção ao abdômen',
      'Segure por 1 segundo contraindo as costas',
      'Estenda os braços controladamente',
    ],
    alternatives: [
      { exercise_id: 'ex-004', reason: 'Variação unilateral com halteres' },
    ],
  },
  {
    id: 'ex-003',
    name: 'Supino Inclinado com Halteres',
    slug: 'supino-inclinado-halteres',
    description: 'Variação do supino com halteres em banco inclinado. Ênfase na parte superior do peitoral.',
    execution_tips: 'Ajuste o banco para 30-45 graus. Mantenha os halteres paralelos no topo. Desça controladamente.',
    difficulty: 'intermediate',
    thumbnail_url: null,
    muscle_group_id: 'mg-001',
    movement_group_id: 'mv-001',
    equipment_ids: ['eq-002'],
    instructions: [
      'Sente-se em um banco inclinado a 45 graus',
      'Segure um halter em cada mão na altura dos ombros',
      'Empurre os halteres para cima estendendo os braços',
      'Desça os halteres lentamente até a lateral do peito',
      'Repita o movimento',
    ],
    alternatives: [],
  },
  {
    id: 'ex-004',
    name: 'Remada Unilateral com Halteres',
    slug: 'remada-unilateral-halteres',
    description: 'Remada executada com um halter de cada vez, permitindo maior amplitude de movimento e foco unilateral.',
    execution_tips: 'Apoie o joelho e a mão no banco para estabilidade. Puxe o halter em direção ao quadril. Não gire o tronco.',
    difficulty: 'beginner',
    thumbnail_url: null,
    muscle_group_id: 'mg-002',
    movement_group_id: 'mv-002',
    equipment_ids: ['eq-002'],
    instructions: [
      'Apoie o joelho direito e a mão direita em um banco',
      'Segure o halter com a mão esquerda',
      'Puxe o halter em direção ao quadril',
      'Contraia as costas no topo',
      'Desça controladamente',
    ],
    alternatives: [],
  },
  {
    id: 'ex-005',
    name: 'Agachamento',
    slug: 'agachamento',
    description: 'Exercício fundamental para desenvolvimento de pernas e glúteos. Com a barra nas costas, realize o movimento de agachar mantendo a coluna neutra.',
    execution_tips: 'Mantenha o peito aberto e a coluna neutra. Os joelhos devem acompanhar a direção dos pés. Desça até que as coxas estejam paralelas ao chão.',
    difficulty: 'advanced',
    thumbnail_url: null,
    muscle_group_id: 'mg-003',
    movement_group_id: 'mv-003',
    equipment_ids: ['eq-001'],
    instructions: [
      'Posicione a barra sobre o trapézio',
      'Pés na largura dos ombros com pontas levemente viradas para fora',
      'Flexione os joelhos e quadris simultaneamente',
      'Desça até as coxas ficarem paralelas ao chão',
      'Estenda as pernas para retornar à posição inicial',
    ],
    alternatives: [
      { exercise_id: 'ex-007', reason: 'Variação com halteres para iniciantes' },
    ],
  },
  {
    id: 'ex-006',
    name: 'Desenvolvimento com Halteres',
    slug: 'desenvolvimento-halteres',
    description: 'Exercício para ombros executado sentado, elevando halteres acima da cabeça.',
    execution_tips: 'Mantenha o core contraído. Não arqueie as costas. Controle o movimento tanto na subida quanto na descida.',
    difficulty: 'intermediate',
    thumbnail_url: null,
    muscle_group_id: 'mg-004',
    movement_group_id: 'mv-001',
    equipment_ids: ['eq-002'],
    instructions: [
      'Sente-se em um banco com halteres na altura dos ombros',
      'Empurre os halteres acima da cabeça estendendo os braços',
      'Desça os halteres lentamente até a altura dos ombros',
      'Repita o movimento',
    ],
    alternatives: [],
  },
  {
    id: 'ex-007',
    name: 'Agachamento Goblet',
    slug: 'agachamento-goblet',
    description: 'Variação do agachamento segurando um halter junto ao peito. Excelente para iniciantes.',
    execution_tips: 'Segure o halter junto ao peito com ambas as mãos. Mantenha os cotovelos apontados para baixo. Desça até que os cotovelos toquem os joelhos.',
    difficulty: 'beginner',
    thumbnail_url: null,
    muscle_group_id: 'mg-003',
    movement_group_id: 'mv-003',
    equipment_ids: ['eq-002'],
    instructions: [
      'Segure um halter na vertical junto ao peito',
      'Pés na largura dos ombros',
      'Agache mantendo o peito aberto',
      'Desça controladamente',
      'Suba estendendo as pernas',
    ],
    alternatives: [],
  },
  {
    id: 'ex-008',
    name: 'Rosca Direta',
    slug: 'rosca-direta',
    description: 'Exercício isolador para bíceps. Com a barra, realize a flexão dos cotovelos mantendo os braços fixos ao lado do corpo.',
    execution_tips: 'Mantenha os cotovelos fixos ao lado do corpo. Não use impulso. Contraia o bíceps no topo. Controle a descida.',
    difficulty: 'beginner',
    thumbnail_url: null,
    muscle_group_id: 'mg-005',
    movement_group_id: 'mv-002',
    equipment_ids: ['eq-001', 'eq-002'],
    instructions: [
      'Em pé, segure a barra com as mãos na largura dos ombros',
      'Mantenha os cotovelos junto ao corpo',
      'Flexione os cotovelos elevando a barra em direção aos ombros',
      'Contraia o bíceps no topo',
      'Desça a barra lentamente',
    ],
    alternatives: [],
  },
];

export async function runSeed(db: SQLiteDatabase): Promise<void> {
  const existing = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM exercises');

  if (existing && existing.count > 0) {
    return;
  }

  for (const mg of muscleGroups) {
    await db.runAsync(
      `INSERT OR IGNORE INTO muscle_groups (id, name, slug, order_index) VALUES (?, ?, ?, ?)`,
      mg.id, mg.name, mg.slug, 0
    );
  }

  for (const mv of movementGroups) {
    await db.runAsync(
      `INSERT OR IGNORE INTO movement_groups (id, name, slug, order_index) VALUES (?, ?, ?, ?)`,
      mv.id, mv.name, mv.slug, 0
    );
  }

  for (const eq of equipmentItems) {
    await db.runAsync(
      `INSERT OR IGNORE INTO equipments (id, name, slug, category, order_index) VALUES (?, ?, ?, ?, ?)`,
      eq.id, eq.name, eq.slug, eq.category, 0
    );
  }

  const now = new Date().toISOString();

  for (const ex of exercises) {
    await db.runAsync(
      `INSERT OR IGNORE INTO exercises (id, name, slug, description, execution_tips, difficulty,
        target_muscle_primary, muscle_group_id, movement_group_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ex.id,
      ex.name,
      ex.slug,
      ex.description,
      ex.execution_tips,
      ex.difficulty,
      null,
      ex.muscle_group_id,
      ex.movement_group_id,
      now,
      now
    );

    for (const eqId of ex.equipment_ids) {
      await db.runAsync(
        `INSERT OR IGNORE INTO exercise_equipments (exercise_id, equipment_id) VALUES (?, ?)`,
        ex.id, eqId
      );
    }

    for (let i = 0; i < ex.instructions.length; i++) {
      await db.runAsync(
        `INSERT OR IGNORE INTO exercise_instructions (id, exercise_id, step_order, description)
        VALUES (?, ?, ?, ?)`,
        `${ex.id}-inst-${i + 1}`, ex.id, i + 1, ex.instructions[i]
      );
    }

    for (const alt of ex.alternatives) {
      await db.runAsync(
        `INSERT OR IGNORE INTO exercise_alternatives (id, exercise_id, alternative_exercise_id, reason)
        VALUES (?, ?, ?, ?)`,
        `${ex.id}-alt-${alt.exercise_id}`, ex.id, alt.exercise_id, alt.reason
      );
    }
  }
}
