// Runnable self-check for the process-follow-ups eligibility helpers. No framework.
//   deno run client-crm/supabase/functions/process-follow-ups/followups_selfcheck.ts
// Passes silently; throws on the first failed assertion.
import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { proposalDueDate, callNudgeDueDate, DAY_MS } from './index.ts'

const now = new Date('2026-07-20T12:00:00Z')
const ago = (days) => new Date(now.getTime() - days * DAY_MS).toISOString()

// proposal_3d: in 'Proposal Sent' 4 days -> eligible; due = sentAt + 3d.
const p4 = { pipeline_stage: 'Proposal Sent', proposal_sent_at: ago(4) }
assertEquals(proposalDueDate(p4, now, 3), new Date(new Date(p4.proposal_sent_at).getTime() + 3 * DAY_MS).toISOString())
// ...but not yet due for the 7-day one.
assertEquals(proposalDueDate(p4, now, 7), null)
// 8 days in -> both 3d and 7d eligible.
const p8 = { pipeline_stage: 'Proposal Sent', proposal_sent_at: ago(8) }
assertEquals(proposalDueDate(p8, now, 7) !== null, true)
// 1 day in -> nothing yet.
assertEquals(proposalDueDate({ pipeline_stage: 'Proposal Sent', proposal_sent_at: ago(1) }, now, 3), null)
// Left the stage (responded) -> no follow-up even if the timestamp is old.
assertEquals(proposalDueDate({ pipeline_stage: 'Contracts Signed', proposal_sent_at: ago(9) }, now, 3), null)
// No timestamp -> null.
assertEquals(proposalDueDate({ pipeline_stage: 'Proposal Sent', proposal_sent_at: null }, now, 3), null)

// call nudge: meeting 2 days ago, no no-show -> eligible; due = sched + 24h.
const c2 = { scheduled_date: ago(2), no_show_date: null }
assertEquals(callNudgeDueDate(c2, now), new Date(new Date(c2.scheduled_date).getTime() + DAY_MS).toISOString())
// meeting only 12h ago -> not due yet.
assertEquals(callNudgeDueDate({ scheduled_date: new Date(now.getTime() - DAY_MS / 2).toISOString(), no_show_date: null }, now), null)
// no-show -> never nudge.
assertEquals(callNudgeDueDate({ scheduled_date: ago(2), no_show_date: ago(2) }, now), null)
// no meeting date -> null (manual button covers this case).
assertEquals(callNudgeDueDate({ scheduled_date: null, no_show_date: null }, now), null)

console.log('✅ process-follow-ups self-check passed')
