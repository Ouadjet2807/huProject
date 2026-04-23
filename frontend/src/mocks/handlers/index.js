import { handlers as treatmentsHandlers } from './treatments'

// The root-level request handlers combine
// all the domain-based handlers into a single
// network description array.
export const handlers = [...treatmentsHandlers]