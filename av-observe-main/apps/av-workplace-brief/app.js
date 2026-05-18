/**
 * Workplace Brief — beta
 * Proactive Slack briefings: calendar + AV readiness + iOffice wayfinder links.
 * Cloned patterns from av-daily-update; reuses @av-observe/shared modules.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Slack } from '@av-observe/shared/modules/index.js';
import { collectBriefData } from './lib/collectBriefData.js';
import { generateSlackBrief } from './lib/generateSlackBrief.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8')
);

const OUTPUT_DIR = process.env.CI ? '.data' : '.ignore';

async function saveArtifact(briefData, slackMessage) {
  const dir = path.join(process.cwd(), OUTPUT_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const payload = {
    lastUpdated: new Date().toISOString(),
    briefData,
    slackMessage
  };

  const outPath = path.join(dir, 'workplace-brief.json');
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${outPath}`);
  return outPath;
}

async function main() {
  console.log('Workplace Brief beta — starting run');
  console.log(`  demo=${process.env.WORKPLACE_DEMO === 'true'}`);
  console.log(`  mode=${process.env.mode || 'production'}`);
  console.log(`  dry_run=${process.env.WORKPLACE_DRY_RUN === 'true'}`);
  console.log(`  tier1_only=${process.env.WORKPLACE_TIER1_ONLY !== 'false'}`);

  const briefData = await collectBriefData(appConfig);
  console.log(
    `  events=${briefData.events.length} (tier1: ${briefData.meta?.totalBefore ?? '?'} → ${briefData.meta?.totalAfter ?? '?'})`
  );

  if (
    briefData.events.length === 0 &&
    !appConfig.briefing?.postToSlackWhenEmpty
  ) {
    await saveArtifact(briefData, { text: 'No tier-1 events in window.', blocks: [] });
    console.log('No tier-1 events — skipping Slack post (set briefing.postToSlackWhenEmpty to override).');
    if (process.env.WORKPLACE_DRY_RUN === 'true') return;
    return;
  }

  const slackMessage = generateSlackBrief(briefData, {
    betaName: appConfig.beta?.name,
    version: appConfig.beta?.version
  });

  await saveArtifact(briefData, slackMessage);

  if (process.env.WORKPLACE_DRY_RUN === 'true') {
    console.log('\n--- Slack preview (dry run) ---\n');
    console.log(slackMessage.text);
    console.log('\n--- end preview ---\n');
    return;
  }

  const slack = new Slack();
  const channel =
    process.env.mode === 'testing' || appConfig.slack?.useTestChannelWhenTesting
      ? slack.testChannelId
      : slack.channelId;

  await slack.sendMessage(slackMessage, channel);
  console.log(`Posted Workplace Brief to Slack channel ${channel}`);
}

main().catch((error) => {
  console.error('Workplace Brief failed:', error.message);
  process.exit(1);
});
