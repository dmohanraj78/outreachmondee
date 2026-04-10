// src/config.js
export const N8N_CONFIG = {
  // Hosted n8n Webhook URLs
  FINDER_WEBHOOK: "https://n8n.mondee.com/webhook/lead-finder",
  PERSONALIZATION_WEBHOOK: "https://n8n.mondee.com/webhook/message-generate",
  SENDER_WEBHOOK: "https://n8n.mondee.com/webhook/mail-send",
  FETCHER_WEBHOOK: "https://n8n.mondee.com/webhook/get-leads",
  // Drafts Fetcher (for the final sheet)
  DRAFTS_FETCHER_WEBHOOK: "https://n8n.mondee.com/webhook/get-drafts",
  // Query Management Webhooks
  GET_QUERIES_WEBHOOK: "https://n8n.mondee.com/webhook/get-queries?signal=true",
  SAVE_QUERY_WEBHOOK: "https://n8n.mondee.com/webhook/save-query",
  DIRECT_FINDER_WEBHOOK: "https://n8n.mondee.com/webhook/mail-input",
  // LinkedIn Ghost Webhooks
  CLOSER_WEBHOOK: "https://n8n.mondee.com/webhook/linkedin-closer",
  RESEARCH_WEBHOOK: "https://n8n.mondee.com/webhook/daily-social-research",
  // New: Drip & Diagnostics
  DRIP_ENROLL_WEBHOOK: "https://n8n.mondee.com/webhook/drip-enroll",
  DIAGNOSTICS_WEBHOOK: "https://n8n.mondee.com/webhook/diagnostics-test",
  LEAD_CAPTURE_WEBHOOK: "https://n8n.mondee.com/webhook/lead-capture"
};

export const UNIPILE_CONFIG = {
  API_KEY: "bh0GGBfl.ep5WWB7brQjkbhaepZT/UrIcc/h51fyn5tqxij74tR8=",
  ACCOUNT_ID: "p-5SC7QDTmaAe0cut_cU0A",
  BASE_URL: "https://api33.unipile.com:16335/api/v1"
};
