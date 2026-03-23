// src/config.js
export const N8N_CONFIG = {
  // Replace these with your Production Webhook URLs from n8n
  FINDER_WEBHOOK: "https://dhanushmondee.app.n8n.cloud/webhook/lead-finder",
  PERSONALIZATION_WEBHOOK: "https://dhanushmondee.app.n8n.cloud/webhook/message-generate",
  SENDER_WEBHOOK: "https://dhanushmondee.app.n8n.cloud/webhook/mail-send",
  FETCHER_WEBHOOK: "https://dhanushmondee.app.n8n.cloud/webhook/get-leads",
  // NEW: Drafts Fetcher (for the final sheet)
  DRAFTS_FETCHER_WEBHOOK: "https://dhanushmondee.app.n8n.cloud/webhook/get-drafts",
  // NEW: Query Management Webhooks
  GET_QUERIES_WEBHOOK: "https://dhanushmondee.app.n8n.cloud/webhook/get-queries",
  SAVE_QUERY_WEBHOOK: "https://dhanushmondee.app.n8n.cloud/webhook/save-query"
};
