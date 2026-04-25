import { handlers as treatmentsHandlers } from './treatments'
import { handlers as archivedTreatmentsHandlers } from './archivedTreatments'
import { handlers as treatmentHandlers } from './archivedTreatments'

// The root-level request handlers combine
// all the domain-based handlers into a single
// network description array.
export const handlers = [...treatmentsHandlers, ...archivedTreatmentsHandlers, ...treatmentHandlers]