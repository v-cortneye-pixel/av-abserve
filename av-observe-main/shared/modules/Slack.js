import { WebClient } from '@slack/web-api';
import { getCredentials } from '../credentials.js';
import fs from 'fs';
const config = JSON.parse(fs.readFileSync('./shared/config.json'), 'utf8');

class Slack {
  constructor() {
    const credentials = getCredentials('slack');
    
    if (!credentials) {
      throw new Error('Failed to get Slack credentials');
    }

    this.channelId = config.slack.channelIds.alert;
    this.testChannelId = config.slack.channelIds.testAlert;
    this.testSiteChannelId = config.slack.channelIds.testSiteAlert;
    this.olympicChannelId = config.slack.channelIds.Olympic;
    this.liveAlertsChannelId = config.slack.channelIds['live-alerts'];
    this.siteChannelIds = config.slack.channelIds;
    this.client = new WebClient(credentials.token);
    this.defaultChannel = this.channelId;
  }

  async sendMessage(message, channel = this.defaultChannel) {
    try {
      // If message is a string, convert it to an object
      if (typeof message === 'string') {
        message = { text: message };
      }
      

      // Ensure we have a text field for fallback
      if (!message.text && message.blocks) {
        message.text = "New notification";
      }

      // Send the message
      const result = await this.client.chat.postMessage({
        channel,
        ...message
      });

      return result;

    } catch (error) {
      console.error('Slack API Error:', {
        error: error.message,
        data: error.data,
        code: error.code,
        name: error.name,
        channel: this.defaultChannel
      });
      throw error;
    }
  }

  async sendBlocks(blocks, channel) {
    return this.sendMessage({ blocks, channel });
  }

  async sendText(text, channel) {
    return this.sendMessage({ text, channel });
  }

  async handleBlockActions(payload) {
    try {
      const action = payload.actions[0];
      const value = action.value ? JSON.parse(action.value) : null;

      switch (action.action_id) {
        case 'change_name':
          await this.openChangeNameModal(payload.trigger_id, value);
          return { text: "Opening name change dialog..." };

        case 'mute_alert':
          await this.openMuteAlertModal(payload.trigger_id, value);
          return { text: "Opening mute alert confirmation..." };

        default:
          console.warn(`Unhandled action: ${action.action_id}`);
          return { text: "Unknown action" };
      }
    } catch (error) {
      console.error('Error in handleBlockActions:', error);
      throw error;
    }
  }

  async handleModalSubmission(payload, domotz) {
    try {
      const view = payload.view;
      const metadata = JSON.parse(view.private_metadata);
      let result;

      switch (view.callback_id) {

        case 'change_name_modal':
          const newName = view.state.values.name_input.name_value.value;
          const changedNameResult = await domotz.changeDeviceName(metadata.agentId, metadata.deviceId, newName);
          
          if (changedNameResult.success) {
            // Send confirmation message
            await this.sendMessage(changedNameResult.confirmationMessage);
          }
          
          result = { 
            status: changedNameResult.success ? 200 : changedNameResult.status,
            text: changedNameResult.message 
          };
          break;

        case 'mute_alert_modal':
          const muteResult = await domotz.muteAlert(metadata.agentId, metadata.deviceId);
          console.log('mute result:');
          console.log(muteResult);          
          if (muteResult.success) {
            // Send confirmation message
            await this.sendMessage(muteResult.confirmationMessage);
          } else {
            await this.sendMessage(`:warning:Domotz had an error muting the alert for ${metadata.deviceName} with message:\n:message:${muteResult.message}`)
          }
          
          result = {
            status: muteResult.success ? 200 : muteResult.status,
            text: muteResult.message
          };
          break;

        default:
          console.warn(`Unhandled modal submission: ${view.callback_id}`);
          result = { text: 'Unknown modal submission' };
      }
      console.log(`returning:`, result)
      return result;
    } catch (error) {
      console.error('Error in handleModalSubmission:', error);
      throw error;
    }
  }

  async openChangeNameModal(triggerId, metadata) {
    const modal = {
      type: "modal",
      callback_id: "change_name_modal",
      title: {
        type: "plain_text",
        text: "Change Device Name",
        emoji: true
      },
      submit: {
        type: "plain_text",
        text: "Submit",
        emoji: true
      },
      close: {
        type: "plain_text",
        text: "Cancel",
        emoji: true
      },
      blocks: [
        {
          type: "input",
          block_id: "name_input",
          element: {
            type: "plain_text_input",
            action_id: "name_value",
            "placeholder": {
              "type": "plain_text",
              "text": "enter device name here"
            }
          },
          label: {
            type: "plain_text",
            text: "New Device Name",
            emoji: true
          }
        }
      ],
      private_metadata: JSON.stringify(metadata)
    };

    try {
      await this.client.views.open({
        trigger_id: triggerId,
        view: modal
      });
    } catch (error) {
      console.error('Error opening change name modal:', error);
      throw error;
    }
  }

  async openMuteAlertModal(triggerId, metadata) {
    const modal = {
      type: "modal",
      callback_id: "mute_alert_modal",
      title: {
        type: "plain_text",
        text: "Mute Alert",
        emoji: true
      },
      submit: {
        type: "plain_text",
        text: "Submit",
        emoji: true
      },
      close: {
        type: "plain_text",
        text: "Cancel",
        emoji: true
      },
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Are you sure you want to mute alerts for *${metadata.deviceName}*?`
          }
        },
        {
          type: "input",
          block_id: "mute_confirmation",
          element: {
            type: "radio_buttons",
            options: [
              {
                text: {
                  type: "plain_text",
                  text: "Yes",
                  emoji: true
                },
                value: "yes"
              },
              {
                text: {
                  type: "plain_text",
                  text: "No",
                  emoji: true
                },
                value: "no"
              }
            ],
            action_id: "mute_value"
          },
          label: {
            type: "plain_text",
            text: "Confirm your choice",
            emoji: true
          }
        }
      ],
      private_metadata: JSON.stringify(metadata)
    };

    try {
      await this.client.views.open({
        trigger_id: triggerId,
        view: modal
      });
    } catch (error) {
      console.error('Error opening mute alert modal:', error);
      throw error;
    }
  }

  async handleSetImportance(payload, domotz) {
    try {
      const action = payload.actions[0];
      const value = action.value ? JSON.parse(action.value) : null;

      let view;
      switch (action.action_id) {
        case 'set_importance':
          view = {
            type: "modal",
            callback_id: "set_importance_modal",
            title: {
              type: "plain_text",
              text: "Set Device Importance",
              emoji: true
            },
            submit: {
              type: "plain_text",
              text: "Submit",
              emoji: true
            },
            close: {
              type: "plain_text",
              text: "Cancel",
              emoji: true
            },
            blocks: [
              {
                type: "input",
                block_id: "importance_input",
                element: {
                  type: "static_select",
                  action_id: "importance_value",
                  initial_option: {
                    text: {
                      type: "plain_text",
                      text: this.capitalizeFirstLetter(value.currentImportance),
                      emoji: true
                    },
                    value: value.currentImportance
                  },
                  options: [
                    {
                      text: {
                        type: "plain_text",
                        text: "Vital",
                        emoji: true
                      },
                      value: "VITAL"
                    },
                    {
                      text: {
                        type: "plain_text",
                        text: "Floating",
                        emoji: true
                      },
                      value: "FLOATING"
                    }
                  ]
                },
                label: {
                  type: "plain_text",
                  text: "Select Importance Level",
                  emoji: true
                }
              }
            ],
            private_metadata: JSON.stringify(value)
          };
          break;
      }

      if (view) {
        await this.client.views.open({
          trigger_id: payload.trigger_id,
          view: view
        });

        return {
          response_type: 'ephemeral',
          text: 'Opening dialog...'
        };
      }
      return {
        response_type: 'ephemeral',
        text: 'Processing your request...'
      };
    } catch (error) {
      console.error('Error in handleSetImportance:', error);
      throw error;
    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
  }
}

export default Slack;
