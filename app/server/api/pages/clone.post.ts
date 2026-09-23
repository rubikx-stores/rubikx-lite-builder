import { getHeader } from 'h3'
import { cloneSourceToTargets, type CloneResult } from '../../utils/clonePages'

interface CloneTarget {
  companyId: number
  pageKey: string
}

interface CloneBody {
  sourceCompanyId: number
  sourcePageKey: string
  sourceVersion?: number
  targets: CloneTarget[]
}

export default defineEventHandler(async (event): Promise<{ results: CloneResult[] }> => {
  const body = await readBody<CloneBody>(event)

  if (!body?.sourceCompanyId || !body?.sourcePageKey || !Array.isArray(body?.targets) || body.targets.length === 0) {
    throw createError({ statusCode: 400, message: 'sourceCompanyId, sourcePageKey and at least one target are required' })
  }

  // Forward the session cookie so the downstream /api/pages and
  // /api/proxy/odoo/cms calls see the same authenticated user this request
  // came in as (both read rb_auth_token from the cookie header).
  const cookie = getHeader(event, 'cookie') ?? ''

  const results = await cloneSourceToTargets({
    sourceCompanyId: body.sourceCompanyId,
    sourcePageKey: body.sourcePageKey,
    sourceVersion: body.sourceVersion,
    targets: body.targets,
    cookie,
  })

  return { results }
})
