import type { BoardState } from '../types'
import { generateId } from './id'

export function createSeedState(): BoardState {
  const backlogId   = generateId()
  const inProgId    = generateId()
  const reviewId    = generateId()
  const doneId      = generateId()

  const t1  = generateId()
  const t2  = generateId()
  const t3  = generateId()
  const t4  = generateId()
  const t5  = generateId()
  const t6  = generateId()
  const t7  = generateId()
  const t8  = generateId()

  const now = Date.now()

  return {
    columnOrder: [backlogId, inProgId, reviewId, doneId],

    columns: {
      [backlogId]: {
        id: backlogId,
        title: 'Backlog',
        taskIds: [t1, t2, t3],
      },
      [inProgId]: {
        id: inProgId,
        title: 'In Progress',
        taskIds: [t4, t5],
      },
      [reviewId]: {
        id: reviewId,
        title: 'In Review',
        taskIds: [t6, t7],
      },
      [doneId]: {
        id: doneId,
        title: 'Done',
        taskIds: [t8],
      },
    },

    tasks: {
      [t1]: {
        id: t1,
        title: 'Design system tokens',
        description: 'Define color palette, spacing scale, and typography variables for the component library.',
        createdAt: now - 86400000 * 5,
      },
      [t2]: {
        id: t2,
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions to run tests and deploy on merge to main.',
        createdAt: now - 86400000 * 4,
      },
      [t3]: {
        id: t3,
        title: 'Write API documentation',
        createdAt: now - 86400000 * 3,
      },
      [t4]: {
        id: t4,
        title: 'Implement drag-and-drop',
        description: 'Use dnd-kit to support card and column reordering with smooth animations.',
        createdAt: now - 86400000 * 2,
      },
      [t5]: {
        id: t5,
        title: 'Add dark mode support',
        description: 'Use Tailwind dark: variants and persist preference in localStorage.',
        createdAt: now - 86400000 * 1,
      },
      [t6]: {
        id: t6,
        title: 'Accessibility audit',
        description: 'Run axe-core and fix all A and AA violations.',
        createdAt: now - 3600000 * 8,
      },
      [t7]: {
        id: t7,
        title: 'Performance profiling',
        description: 'Use React DevTools Profiler to identify and fix unnecessary re-renders.',
        createdAt: now - 3600000 * 4,
      },
      [t8]: {
        id: t8,
        title: 'Project scaffolding',
        description: 'Vite + React + TypeScript + Tailwind boilerplate is ready.',
        createdAt: now - 86400000 * 7,
      },
    },
  }
}
