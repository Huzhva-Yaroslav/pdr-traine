import { BankValidationError, validateBank } from '../domain'
import type { Manifest, Question, Topic } from '../domain'

const base = '/data/v1'

class QuestionBankLoadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'QuestionBankLoadError'
  }
}

export async function loadQuestionBank(): Promise<{
  manifest: Manifest
  questions: Question[]
  topics: Topic[]
}> {
  const [manifestText, questionsText, topicsText] = await Promise.all([
    readText(`${base}/manifest.json`),
    readText(`${base}/questions.json`),
    readText(`${base}/topics.json`),
  ])
  const manifest = parseJson<Manifest>(manifestText, 'manifest')
  const questions = parseJson<Question[]>(questionsText, 'questions')
  const topics = parseJson<Topic[]>(topicsText, 'topics')
  await expectChecksum(manifest, 'questions.json', questionsText)
  await expectChecksum(manifest, 'topics.json', topicsText)
  try {
    validateBank(questions, topics, manifest)
  } catch (error) {
    if (error instanceof BankValidationError) {
      throw new QuestionBankLoadError(error.message)
    }
    throw error
  }
  return { manifest, questions, topics }
}

async function readText(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) throw new QuestionBankLoadError(`HTTP_${response.status}`)
  return response.text()
}

function parseJson<T>(text: string, label: string): T {
  try {
    return JSON.parse(text) as T
  } catch {
    throw new QuestionBankLoadError(`INVALID_${label}`)
  }
}

async function expectChecksum(manifest: Manifest, fileName: string, text: string): Promise<void> {
  const expected = manifest.checksums[fileName]
  if (!expected) throw new QuestionBankLoadError(`MISSING_CHECKSUM_${fileName}`)
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  const actual = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  if (actual !== expected) throw new QuestionBankLoadError(`CHECKSUM_${fileName}`)
}
