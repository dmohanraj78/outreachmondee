// src/config.js
export const N8N_CONFIG = {
  // Local n8n Webhook URLs
  FINDER_WEBHOOK: "http://localhost:5678/webhook/lead-finder",
  PERSONALIZATION_WEBHOOK: "http://localhost:5678/webhook/message-generate",
  SENDER_WEBHOOK: "http://localhost:5678/webhook/mail-send",
  FETCHER_WEBHOOK: "http://localhost:5678/webhook/get-leads",
  // Drafts Fetcher (for the final sheet)
  DRAFTS_FETCHER_WEBHOOK: "http://localhost:5678/webhook/get-drafts",
  // Query Management Webhooks
  GET_QUERIES_WEBHOOK: "http://localhost:5678/webhook/get-queries?signal=true", // Added query signal as requested
  SAVE_QUERY_WEBHOOK: "http://localhost:5678/webhook/save-query",
  DIRECT_FINDER_WEBHOOK: "http://localhost:5678/webhook/mail-input",
  // LinkedIn Ghost Webhooks
  CLOSER_WEBHOOK: "http://localhost:5678/webhook/linkedin-closer",
  RESEARCH_WEBHOOK: "http://localhost:5678/webhook/daily-social-research",
  // New: Drip & Diagnostics
  DRIP_ENROLL_WEBHOOK: "http://localhost:5678/webhook/drip-enroll",
  DIAGNOSTICS_WEBHOOK: "http://localhost:5678/webhook/diagnostics-test"
};
