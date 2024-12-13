import { createHash } from 'crypto'

const hashedContent = (plainText: string): string => {
  const hashed = createHash('sha256').update(plainText).digest('hex')
  return hashed
}

const compareContent = (plainText: string, hashed: string): boolean => {
  const hashContent = hashedContent(plainText)
  const isMatched = hashContent === hashed
  return isMatched
}

export { hashedContent, compareContent }
