// JSON → AL Generator for Business Central (client-side only)
// - Parses JSON
// - Flattens nested objects with prefixes
// - Maps types to AL (Integer, Decimal, Boolean, Text[250], Date, DateTime)
// - Sanitizes identifiers, PascalCase captions, ensures uniqueness
// - Generates: Table, List Page, Card Page

(function(){
  const els = {
    jsonInput: document.getElementById('jsonInput'),
    baseId: document.getElementById('baseId'),
    optTable: document.getElementById('optTable'),
    optList: document.getElementById('optListPage'),
    optCard: document.getElementById('optCardPage'),
    optAutoPK: document.getElementById('optAutoPK'),
    btnGenerate: document.getElementById('btnGenerate'),
    btnSample: document.getElementById('btnSample'),
    status: document.getElementById('statusMsg'),
    alTable: document.getElementById('alTable'),
    alList: document.getElementById('alList'),
    alCard: document.getElementById('alCard'),
    tabs: Array.from(document.querySelectorAll('.tab')),
    outputs: Array.from(document.querySelectorAll('.output')),
  };

  // Basic helpers
  const isISODate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const isISODateTime = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(s);
  const isInteger = (n) => typeof n === 'number' && Number.isInteger(n);
  const isDecimal = (n) => typeof n === 'number' && !Number.isNaN(n) && !Number.isInteger(n);
  const toPascalCase = (name) => {
    return name
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // split camel
      .replace(/[_\-\s]+/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
  };
  const sanitizeIdentifier = (name) => {
    let s = name.replace(/[^A-Za-z0-9_]/g, '');
    if (!s) s = 'Field';
    if (/^\d/.test(s)) s = 'Field' + s; // cannot start with digit
    return s;
  };

  function flattenObject(obj, prefix = '') {
    const out = {};
    for (const [key, val] of Object.entries(obj)) {
      const idName = sanitizeIdentifier(toPascalCase(key));
      const fullKey = prefix ? `${prefix}_${idName}` : idName;
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        Object.assign(out, flattenObject(val, fullKey));
      } else {
        out[fullKey] = val;
      }
    }
    return out;
  }

  function mapType(value) {
    if (typeof value === 'boolean') return 'Boolean';
    if (typeof value === 'number') return isInteger(value) ? 'Integer' : 'Decimal';
    if (typeof value === 'string') {
      if (isISODate(value)) return 'Date';
      if (isISODateTime(value)) return 'DateTime';
      return 'Text[250]';
    }
    // Fallbacks for arrays/null/objects
    if (value === null) return 'Text[250]';
    if (Array.isArray(value)) return 'Text[250]';
    if (typeof value === 'object') return 'Text[250]';
    return 'Text[250]';
  }

  function ensureUnique(names) {
    const seen = new Set();
    return names.map(n => {
      let base = n;
      let name = base;
      let i = 2;
      while (seen.has(name)) {
        name = base + i;
        i++;
      }
      seen.add(name);
      return name;
    });
  }

  function buildAL({ baseId, tableName, fields, pkName, genTable, genList, genCard }) {
    const tableId = baseId;
    const listId = baseId + 1;
    const cardId = baseId + 2;

    // Table
    let table = '';
    if (genTable) {
      table += `table ${tableId} "${tableName}"\n`;
      table += `{\n`;
      table += `    Caption = 'Generated Table';\n`;
      table += `    DataClassification = ToBeClassified;\n\n`;
      table += `    fields\n`;
      table += `    {\n`;
      fields.forEach(f => {
        table += `        field(${f.id}; ${JSON.stringify(f.name)}; ${f.type})\n`;
        table += `        {\n`;
        table += `            Caption = ${JSON.stringify(f.caption)};\n`;
        table += `        }\n`;
      });
      table += `    }\n\n`;
      table += `    keys\n`;
      table += `    {\n`;
      table += `        key(PK; ${JSON.stringify(pkName)})\n`;
      table += `        {\n`;
      table += `            Clustered = true;\n`;
      table += `        }\n`;
      table += `    }\n`;
      table += `}\n`;
    }

    // List Page
    let listPage = '';
    if (genList) {
      listPage += `page ${listId} "Generated Table List"\n`;
      listPage += `{\n`;
      listPage += `    PageType = List;\n`;
      listPage += `    ApplicationArea = All;\n`;
      listPage += `    SourceTable = "${tableName}";\n`;
      if (genCard) listPage += `    CardPageId = ${cardId};\n`;
      listPage += `\n`;
      listPage += `    layout\n`;
      listPage += `    {\n`;
      listPage += `        area(content)\n`;
      listPage += `        {\n`;
      listPage += `            repeater(Group)\n`;
      listPage += `            {\n`;
      fields.forEach(f => {
        listPage += `                field(${JSON.stringify(f.caption)}; Rec.${JSON.stringify(f.name)})\n`;
        listPage += `                {\n`;
        listPage += `                    ApplicationArea = All;\n`;
        listPage += `                }\n`;
      });
      listPage += `            }\n`;
      listPage += `        }\n`;
      listPage += `    }\n`;
      listPage += `}\n`;
    }

    // Card Page
    let cardPage = '';
    if (genCard) {
      cardPage += `page ${cardId} "Generated Table Card"\n`;
      cardPage += `{\n`;
      cardPage += `    PageType = Card;\n`;
      cardPage += `    ApplicationArea = All;\n`;
      cardPage += `    SourceTable = "${tableName}";\n`;
      cardPage += `\n`;
      cardPage += `    layout\n`;
      cardPage += `    {\n`;
      cardPage += `        area(content)\n`;
      cardPage += `        {\n`;
      cardPage += `            group(General)\n`;
      cardPage += `            {\n`;
      fields.forEach(f => {
        cardPage += `                field(${JSON.stringify(f.caption)}; Rec.${JSON.stringify(f.name)})\n`;
        cardPage += `                {\n`;
        cardPage += `                    ApplicationArea = All;\n`;
        cardPage += `                }\n`;
      });
      cardPage += `            }\n`;
      cardPage += `        }\n`;
      cardPage += `    }\n`;
      cardPage += `}\n`;
    }

    return { table, listPage, cardPage };
  }

  function generate() {
    els.status.textContent = '';

    const baseId = parseInt(els.baseId.value, 10) || 50000;
    const genTable = els.optTable.checked;
    const genList = els.optList.checked;
    const genCard = els.optCard.checked;
    const autoPK = els.optAutoPK.checked;

    let parsed;
    try {
      parsed = JSON.parse(els.jsonInput.value);
    } catch (e) {
      showError(`Invalid JSON: ${e.message}`);
      return;
    }
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
      showError('Root must be a JSON object.');
      return;
    }

    // Flatten
    const flat = flattenObject(parsed);

    // Prepare field names & types
    const rawNames = Object.keys(flat);
    const uniqueNames = ensureUnique(rawNames);

    const fields = uniqueNames.map((name, idx) => {
      const value = flat[rawNames[idx]]; // map by original key order
      const type = mapType(value);
      const caption = toPascalCase(rawNames[idx]);
      const id = idx + 1; // auto-increment starting at 1
      const identifier = sanitizeIdentifier(name);
      return { id, name: identifier, type, caption };
    });

    if (fields.length === 0) {
      showError('No fields could be derived from the JSON.');
      return;
    }

    // Primary Key logic: prefer Id if exists, else first property; optionally auto-create
    let pkName = null;
    const idIdx = fields.findIndex(f => f.name.toLowerCase() === 'id');
    if (idIdx >= 0) {
      pkName = fields[idIdx].name;
    } else if (fields.length > 0) {
      pkName = fields[0].name;
    }
    if (autoPK && idIdx < 0 && pkName.toLowerCase() !== 'id') {
      // prepend a new Id field
      const newIdField = { id: 1, name: 'Id', type: 'Integer', caption: 'Id' };
      // re-number remaining fields
      fields.forEach(f => f.id++);
      fields.unshift(newIdField);
      pkName = 'Id';
    }

    const tableName = deriveTableName(parsed) || 'GeneratedTable';

    const { table, listPage, cardPage } = buildAL({ baseId, tableName, fields, pkName, genTable, genList, genCard });

    els.alTable.textContent = table;
    els.alList.textContent = listPage;
    els.alCard.textContent = cardPage;
    if (window.Prism && Prism.highlightAll) Prism.highlightAll();

    els.status.textContent = 'Generated successfully.';
  }

  function showError(msg) {
    els.status.textContent = msg;
  }

  function deriveTableName(obj) {
    // Try to infer a logical name from common keys
    const keys = Object.keys(obj);
    const candidates = ['name', 'title', 'code', 'number', 'id'];
    const found = keys.find(k => candidates.includes(k.toLowerCase()));
    if (found) {
      const base = toPascalCase(found.replace(/Id$/i, '')) || 'Generated';
      return sanitizeIdentifier(base + 'Table');
    }
    // Fallback
    return null;
  }

  // Tabs
  els.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      els.tabs.forEach(t => t.classList.remove('active'));
      els.outputs.forEach(o => o.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.target);
      target.classList.add('active');
    });
  });

  // Buttons
  els.btnGenerate.addEventListener('click', generate);
  els.btnSample.addEventListener('click', () => {
    els.jsonInput.value = JSON.stringify({
      customerId: 1,
      customerName: 'John Doe',
      isActive: true
    }, null, 2);
    els.status.textContent = 'Sample loaded.';
  });

  // Copy actions
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const target = btn.getAttribute('data-copy');
      let text = '';
      if (target === 'table') text = els.alTable.textContent || '';
      if (target === 'list') text = els.alList.textContent || '';
      if (target === 'card') text = els.alCard.textContent || '';
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1200);
      } catch(e) {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1200);
      }
    });
  });
})();
