export type ReleaseType = 'new' | 'improved' | 'fix'

export interface Release {
  id: string
  date: string
  title: string
  summary: string
  type: ReleaseType
  link?: string
}
