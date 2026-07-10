// src/config.js - Standalone LinkedIn & Closer Agent Configuration
export const N8N_CONFIG = {
  // LinkedIn Ghost & Closer Webhooks
  CLOSER_WEBHOOK: "https://n8n.mondee.com/webhook/linkedin-closer",
  RESEARCH_WEBHOOK: "https://n8n.mondee.com/webhook/daily-social-research",
  SOCIAL_DISPATCH_WEBHOOK: "https://n8n.mondee.com/webhook/social-dispatch",
  GET_SOCIAL_DRAFTS_WEBHOOK: "https://n8n.mondee.com/webhook/get-linkedinposts",
  UPDATE_SOCIAL_DRAFT_WEBHOOK: "https://n8n.mondee.com/webhook/update-link",
  
  // Base Fetcher (Used for Connection Requests)
  FETCHER_WEBHOOK: "https://n8n.mondee.com/webhook/get-leads"
};

export const UNIPILE_CONFIG = {
  API_KEY: "bh0GGBfl.ep5WWB7brQjkbhaepZT/UrIcc/h51fyn5tqxij74tR8=",
  ACCOUNT_ID: "p-5SC7QDTmaAe0cut_cU0A",
  BASE_URL: "https://api33.unipile.com:16335/api/v1"
};
