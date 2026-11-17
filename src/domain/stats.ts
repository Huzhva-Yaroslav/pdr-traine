import type { Question, Topic, UserProgress } from './types'

type TopicStat = {
  topicId: string
  title: string
  seen: number
  correct: number
  accuracy: number
}

export function topicStats(
  questions: Question[],
  topics: Topic[],
  progress: UserProgress[],
): TopicStat[] {
  return [...topics]
    .sort((left, right) => left.order - right.order)
    .map((topic) => {
      const ids = new Set(
        questions.filter((question) => question.topicId === topic.id).map((question) => question.id),
      )
      const rows = progress.filter((row) => ids.has(row.questionId) && row.orphaned !== true && row.status !== 'new')
      const correct = rows.filter((row) => row.status === 'mastered' || row.status === 'learning').length
      const seen = rows.length
      return {
        topicId: topic.id,
        title: topic.title,
        seen,
        correct,
        accuracy: seen === 0 ? 0 : correct / seen,
      }
    })
}

export function weakTopics(stats: TopicStat[], limit = 3): TopicStat[] {
  return stats
    .filter((stat) => stat.seen > 0 && stat.accuracy < 1)
    .sort((left, right) => left.accuracy - right.accuracy)
    .slice(0, limit)
}
