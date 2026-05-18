function formatTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString.endsWith('Z') ? isoString : `${isoString}Z`);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

function avEmoji(status) {
  switch (status) {
    case 'ready':
      return ':white_check_mark:';
    case 'attention':
      return ':warning:';
    case 'remote':
      return ':globe_with_meridians:';
    default:
      return ':grey_question:';
  }
}

/**
 * Build Slack message (blocks + fallback text) for a workplace brief.
 */
export function generateSlackBrief(briefData, options = {}) {
  const { betaName = 'Workplace Brief', version = '0.1.0-beta' } = options;
  const lines = [];
  const blocks = [];

  const header = `:sunrise: *${betaName}* (beta ${version})`;
  lines.push(`${betaName} — your day at a glance`);
  blocks.push({
    type: 'header',
    text: { type: 'plain_text', text: `${betaName} (beta)`, emoji: true }
  });
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*Your day at a glance*\n_${briefData.generatedAt ? `Generated ${formatTime(briefData.generatedAt)}` : 'Generated just now'}_ · Mode: \`${briefData.mode}\``
    }
  });
  blocks.push({ type: 'divider' });

  if (!briefData.events?.length) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: '_No upcoming events in the pilot window._' }
    });
    return { text: lines.join('\n'), blocks };
  }

  for (const event of briefData.events) {
    const timeRange = `*${formatTime(event.start)}* → ${formatTime(event.end)}`;
    const locationLine = event.spaceDisplayName || event.location || 'No location';
    const avLine = `${avEmoji(event.avStatus)} AV: *${event.avLabel}*`;
    const important = event.isImportant ? ' :star: _Priority_' : '';

    let detail = `${timeRange}\n*${event.subject || 'Untitled'}*${important}\n:office: ${locationLine}\n${avLine}`;
    lines.push(`${event.subject} @ ${locationLine}`);

    const accessoryButtons = [];

    if (event.wayfinderUrl) {
      detail += `\n:world_map: <${event.wayfinderUrl}|Get directions (iOffice wayfinder)>`;
    }

    if (event.joinUrl) {
      detail += `\n:video_camera: <${event.joinUrl}|Join meeting>`;
    }

    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: detail }
    });

    const actions = [];
    if (event.wayfinderUrl) {
      actions.push({
        type: 'button',
        text: { type: 'plain_text', text: 'Wayfinder' },
        url: event.wayfinderUrl,
        action_id: `wayfinder_${event.subject?.slice(0, 20) || 'event'}`
      });
    }
    if (event.joinUrl) {
      actions.push({
        type: 'button',
        text: { type: 'plain_text', text: 'Join' },
        url: event.joinUrl,
        action_id: `join_${event.subject?.slice(0, 20) || 'event'}`
      });
    }

    if (actions.length) {
      blocks.push({
        type: 'actions',
        elements: actions
      });
    }

    blocks.push({ type: 'divider' });
  }

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: 'Powered by AV Observe · Calendar + Zoom room health + iOffice wayfinder (pilot). Feedback welcome in #av-workplace-brief-beta.'
      }
    ]
  });

  return {
    text: lines.join('\n'),
    blocks
  };
}
