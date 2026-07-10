const fs = require('fs');

const GHOST_FILE = 'LinkedIn Social Ghost (LinkedIn-Optimized) (1).json';
let ghostData = JSON.parse(fs.readFileSync(GHOST_FILE));

// 1. Update Merge Data to include ID and Status
const mergeNode = ghostData.nodes.find(n => n.name === 'Merge Data');
if (mergeNode) {
    mergeNode.parameters.jsCode = `
const filterResults = $('LinkedIn Filter').all();
const ollamaResults = $('Ollama').all();

// Assuming webhook body has the raw query topic
const topic = $('Webhook').first().json.body.query || 'Unknown Topic';

return ollamaResults.map((item, i) => {
  return {
    json: {
      ID: 'LNK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      Topic: topic,
      Title: filterResults[i].json.title,
      Link: filterResults[i].json.link,
      Content: item.json.content,
      Status: 'Pending'
    }
  }
});
`;
}

// 2. Add Google Sheets Append Node
const gsheetNode = {
  parameters: {
    operation: "append",
    documentId: {
      __rl: true,
      value: "1vFgXfOnsiCbVOvOJxj6E-sErHtLQ03AaVj4mP3YjAls",
      mode: "list",
      cachedResultName: "ICP",
      cachedResultUrl: "https://docs.google.com/spreadsheets/d/1vFgXfOnsiCbVOvOJxj6E-sErHtLQ03AaVj4mP3YjAls/edit?usp=drivesdk"
    },
    sheetName: {
      __rl: true,
      value: "LinkedIn Drafts",
      mode: "name",
      cachedResultName: "LinkedIn Drafts"
    },
    columns: {
      mappingMode: "defineBelow",
      value: {
        "ID": "={{$json.ID}}",
        "Topic": "={{$json.Topic}}",
        "Title": "={{$json.Title}}",
        "Link": "={{$json.Link}}",
        "Content": "={{$json.Content}}",
        "Status": "={{$json.Status}}"
      },
      matchingColumns: []
    },
    options: {}
  },
  id: "sheet-append-" + Date.now(),
  name: "Save to DB",
  type: "n8n-nodes-base.googleSheets",
  typeVersion: 4.1,
  position: [1300, 0],
  credentials: {
    googleSheetsOAuth2Api: {
      id: "RQHgqiU45PVMtr8V",
      name: "Mondee 2"
    }
  }
};

ghostData.nodes = ghostData.nodes.filter(n => n.name !== 'Save to DB');
ghostData.nodes.push(gsheetNode);

ghostData.nodes.find(n => n.name === 'Respond to Webhook').position = [1500, 0];

// Shift connections: Merge Data -> Save to DB -> Respond to Webhook
ghostData.connections['Merge Data'] = { main: [[{ node: "Save to DB", type: "main", index: 0 }]] };
ghostData.connections['Save to DB'] = { main: [[{ node: "Respond to Webhook", type: "main", index: 0 }]] };

fs.writeFileSync(GHOST_FILE, JSON.stringify(ghostData, null, 2));


// 3. Create Fetch Social Drafts
const fetchWorkflow = {
  name: "Fetch Social Drafts",
  nodes: [
    {
      parameters: {
        httpMethod: "GET",
        path: "get-social-drafts",
        responseMode: "responseNode",
        options: {}
      },
      id: "webhook-fetch",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [0, 0]
    },
    {
      parameters: {
        operation: "getAll",
        documentId: {
          __rl: true,
          value: "1vFgXfOnsiCbVOvOJxj6E-sErHtLQ03AaVj4mP3YjAls",
          mode: "list"
        },
        sheetName: {
          __rl: true,
          value: "LinkedIn Drafts",
          mode: "name"
        },
        options: {}
      },
      id: "sheet-get",
      name: "Google Sheets",
      type: "n8n-nodes-base.googleSheets",
      typeVersion: 4.1,
      position: [250, 0],
      credentials: {
        googleSheetsOAuth2Api: {
          id: "RQHgqiU45PVMtr8V",
          name: "Mondee 2"
        }
      }
    },
    {
      parameters: {
        respondWith: "allIncomingItems",
        options: {}
      },
      id: "respond",
      name: "Respond to Webhook",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.5,
      position: [500, 0]
    }
  ],
  connections: {
    "Webhook": { main: [[{ node: "Google Sheets", type: "main", index: 0 }]] },
    "Google Sheets": { main: [[{ node: "Respond to Webhook", type: "main", index: 0 }]] }
  },
  active: true
};
fs.writeFileSync('Fetch Social Drafts.json', JSON.stringify(fetchWorkflow, null, 2));


// 4. Create Update Social Drafts
const updateWorkflow = {
  name: "Update Social Drafts",
  nodes: [
    {
      parameters: {
        httpMethod: "POST",
        path: "update-social-draft",
        responseMode: "responseNode",
        options: {}
      },
      id: "webhook-update",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1,
      position: [0, 0]
    },
    {
      parameters: {
        operation: "update",
        documentId: {
          __rl: true,
          value: "1vFgXfOnsiCbVOvOJxj6E-sErHtLQ03AaVj4mP3YjAls",
          mode: "list"
        },
        sheetName: {
          __rl: true,
          value: "LinkedIn Drafts",
          mode: "name"
        },
        columns: {
          mappingMode: "defineBelow",
          value: {
            "ID": "={{$json.body.ID}}",
            "Status": "={{$json.body.Status}}",
            "Content": "={{$json.body.Content}}"
          },
          matchingColumns: ["ID"]
        },
        options: {}
      },
      id: "sheet-update",
      name: "Google Sheets",
      type: "n8n-nodes-base.googleSheets",
      typeVersion: 4.1,
      position: [250, 0],
      credentials: {
        googleSheetsOAuth2Api: {
          id: "RQHgqiU45PVMtr8V",
          name: "Mondee 2"
        }
      }
    },
    {
      parameters: {
        respondWith: "json",
        responseBody: "{\n \"status\": \"success\"\n}",
        options: {}
      },
      id: "respond2",
      name: "Respond to Webhook",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.5,
      position: [500, 0]
    }
  ],
  connections: {
    "Webhook": { main: [[{ node: "Google Sheets", type: "main", index: 0 }]] },
    "Google Sheets": { main: [[{ node: "Respond to Webhook", type: "main", index: 0 }]] }
  },
  active: true
};
fs.writeFileSync('Update Social Draft.json', JSON.stringify(updateWorkflow, null, 2));

console.log("JSON generated");
