import { Decimal } from '@prisma/client/runtime/library'

export function prismaDecimalToNumber(obj: any): any {
  if (obj === null || obj === undefined) return obj

  if (typeof obj === 'object') {
    if (obj instanceof Decimal) return obj.toNumber()
    if (Array.isArray(obj)) return obj.map(prismaDecimalToNumber)
    const result: any = {}

    for (const key in obj) {
      result[key] = prismaDecimalToNumber(obj[key])
    }

    return result
  }

  return obj
}
