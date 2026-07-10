const fs = require('fs');
const file = 'LinkedIn Social Ghost (LinkedIn-Optimized) (1).json';
const data = JSON.parse(fs.readFileSync(file));

data.nodes.push({
  parameters: {
    jsCode: "const filterResults = $('LinkedIn Filter').all();\nconst ollamaResults = $('Ollama').all();\n\nreturn ollamaResults.map((item, i) => {\n  return {\n    json: {\n      title: filterResults[i].json.title,\n      link: filterResults[i].json.link,\n      content: item.json.content\n    }\n  }\n});"
  },
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [1100, 0],
  id: 'merge-data-node',
  name: 'Merge Data'
});

data.connections['Ollama'] = { main: [[{ node: 'Merge Data', type: 'main', index: 0 }]] };
data.connections['Merge Data'] = { main: [[{ node: 'Respond to Webhook', type: 'main', index: 0 }]] };
data.nodes.find(n => n.name === 'Respond to Webhook').parameters = { respondWith: 'allIncomingItems', options: {} };

fs.writeFileSync(file, JSON.stringify(data, null, 2));
