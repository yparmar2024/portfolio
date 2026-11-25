export const projects = [
  {
    title: 'Morf',
    body: 'What changed between two versions of a 3D model? Morf compares OBJ meshes and lets you review a three-way merge in Git.',
    stack: 'C++17 · CMake · Git LFS',
    repo: 'morf',
  },
  {
    title: 'Graphos',
    body: 'A research framework for studying what an AI agent observes and remembers during a security assessment in a controlled lab.',
    stack: 'Python · Docker Compose · MCP',
    repo: 'graphos',
  },
  {
    title: 'SleepyU',
    body: 'An 8-bit CPU I helped design.\n• BOOST adds.\n• FALL subtracts.\n• FETCH loads from memory.\n• TUCK stores to memory.',
    stack: 'Logisim-Evolution · Python assembler',
    repo: 'SleepyU',
  },
];

export const roles = [
  [
    'Jul 2025',
    'Oct 2025',
    'Quantum Pulse Consulting',
    'Software Engineering Intern',
  ],
  [
    'Sep 2025',
    'Jul 2026',
    'Stevens Institute of Technology',
    'Course Assistant',
  ],
  ['Jan 2026', 'Present', 'Stevens Blueprint Club', 'Software Engineer'],
  [
    'Jun 2026',
    'Oct 2026',
    'Stevens Institute of Technology',
    'Research Assistant',
  ],
  ['Jul 2026', 'Sep 2026', 'KION Group', 'Software Engineering Intern'],
];

export function readingPage(name, index) {
  if (name === 'Projects') {
    const p = projects[index];
    return [
      `PROJECT NOTEBOOK  /  ${index + 1} OF ${projects.length}`,
      p.title,
      p.body,
      p.stack,
    ];
  }
  const [start, end, company, role] = roles[index];
  return ['EXPERIENCE', role, company, `${start} – ${end}`];
}
