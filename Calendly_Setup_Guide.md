# Calendly Webhook Integration Guide

This guide explains how to connect your Calendly account to the Miraee Agentic OS so that new bookings automatically update your Master Google Sheet.

## 1. Get your Webhook URL
In your n8n instance, the new **Calendly Conversion Webhook** workflow provides a Webhook node.
- **Production URL**: Usually `https://n8n.your-domain.com/webhook/calendly-booking`
- **Test URL**: Use this for initial setup and testing.

## 2. Configure Calendly
1. Log in to your Calendly account.
2. Go to **Integrations** -> **Webhooks**.
3. Click **Create New Webhook**.
4. **Subscription**: Select `invitee.created`.
5. **URL**: Paste your n8n Webhook URL.
6. **Actions**: Every time someone books a meeting via `calendly.com/dmohanraj-mondee`, this node will trigger.

## 3. Custom Qualifying Questions
The system is configured to parse **all** "Questions and Answers" from your Calendly form. These will be logged into the `Meeting_Notes` column in your Google Sheet.

## 4. Email Notifications
The workflow includes a Gmail/SMTP node. 
> [!IMPORTANT]
> **Action Required**: Open the `Internal Notification` node in n8n and update the **Send To** field with your actual email address (e.g., `dmohanraj-mondee@example.com`).

## 5. Google Sheet Update
The workflow will:
1. Match the lead by **Email**.
2. Set `Meeting_Status` to **"Booked"**.
3. Update `Meeting_Date` with the start time.
4. Set `Sequence_Status` to **"Converted"** (this stops all automated follow-ups immediately).
