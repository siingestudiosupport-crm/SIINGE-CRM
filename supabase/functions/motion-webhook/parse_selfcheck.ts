// Runnable self-check for the motion-webhook parsing helpers. No framework.
//   deno run client-crm/supabase/functions/motion-webhook/parse_selfcheck.ts
// Passes silently; throws on the first failed assertion.
import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { findOption, normalizeBrandStage, CHALLENGE_OPTIONS, BRAND_STAGE_OPTIONS } from './index.ts'

// (a) Current dropdown-format email: answer text appears verbatim.
const dropdownEmail = [
  'Questions:',
  'What current design or product development challenges are you facing?',
  'Sourcing or manufacturer guidance',
  "How would you best describe your brand's current stage of growth",
  'Pre-launch with capital allocated for product development',
].join('\n')

assertEquals(findOption(dropdownEmail, CHALLENGE_OPTIONS), 'Sourcing or manufacturer guidance')
assertEquals(
  normalizeBrandStage(findOption(dropdownEmail, BRAND_STAGE_OPTIONS)),
  'Pre-launch with capital allocated for product development',
)

// The "Scaling" option the old parser didn't recognize.
const scalingEmail = 'stage of growth\nScaling with multiple collections or expanding distribution (DTC/retail)'
assertEquals(
  normalizeBrandStage(findOption(scalingEmail, BRAND_STAGE_OPTIONS)),
  'Scaling with multiple collections or expanding distribution (DTC/retail)',
)

// (b) Legacy free-text answer still normalizes via keyword.
assertEquals(
  normalizeBrandStage('I am in the process of building my fashion brand, but we have not launched yet'),
  'Pre-launch with capital allocated for product development',
)
assertEquals(normalizeBrandStage('We are generating sales with an early product line'), 'Generating sales with an early product line')
assertEquals(normalizeBrandStage('Established brand looking to expand'), 'Established brand investing in new product development or expansion')

// No known option present -> null (card shows its fallback).
assertEquals(findOption('nothing relevant here', CHALLENGE_OPTIONS), null)

console.log('✅ motion-webhook parse self-check passed')
