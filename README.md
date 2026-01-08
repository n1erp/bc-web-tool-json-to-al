🧩 JSON → AL Generator
----------------------


Convert any JSON object into ready-to-use **Microsoft Dynamics 365 Business Central AL objects** — instantly.
This tool automatically generates:

* 🗄️ AL **Table**
* 📋 **List Page**
* 📝 **Card Page**

Just paste your JSON, click **Generate**, and copy your AL code.

---

## ✨ Features

* ⚡ Instant JSON → AL conversion
* 🧠 Automatic field type detection
* 🔢 Auto-increment field IDs
* 🧭 Primary Key handling
* 🧹 Cleans and formats field names
* 🧾 Generates:

  * Table
  * List Page
  * Card Page
* 🌓 Dark, developer-friendly UI
* 📋 One-click copy

---

## 🛠️ What it does

Given JSON like:

```json
{
  "customerId": 1,
  "customerName": "John Doe",
  "isActive": true
}
```

It generates:

* ✅ AL Table
* ✅ List Page
* ✅ Card Page

Ready to paste inside your Business Central project.

---

## 🔍 Type Mapping

| JSON Type                             | AL Type     |
| ------------------------------------- | ----------- |
| string                                | `Text[250]` |
| number (int)                          | `Integer`   |
| number (decimal)                      | `Decimal`   |
| boolean                               | `Boolean`   |
| ISO Date (`YYYY-MM-DD`)               | `Date`      |
| ISO Datetime (`YYYY-MM-DDTHH:mm:ssZ`) | `DateTime`  |

---

## 🚀 How it works

1. Paste your JSON into the input panel
2. Click **Generate AL**
3. Copy:

   * Table code
   * List Page code
   * Card Page code

No backend required — runs entirely in your browser.

---

## 📐 AL Generation Rules

- **Object IDs**: Table = base (default 50000), List = base+1, Card = base+2
- **Table Name**: defaults to `GeneratedTable` (tries to infer from common keys)
- **Field IDs**: auto-increment starting at 1
- **Type Mapping**: integer → Integer, decimal → Decimal, boolean → Boolean, string → Text[250], ISO date → Date, ISO datetime → DateTime
- **Captions & Identifiers**: captions in PascalCase; identifiers sanitized and de-duplicated
- **Nesting**: nested objects are flattened using a prefix (Parent_Child)
- **Primary Key**: uses `Id` when present, otherwise the first field; optional auto-create `Id` (Integer)

---

## 🖥️ Run Locally

Open `index.html` directly in your browser, or start a simple local server:

```powershell
# From the workspace root
python -m http.server 8000
# Then visit http://localhost:8000
```
## 🧱 Tech Stack

* 🟦 Plain JavaScript (no backend)
* 🎨 Minimal dark UI
* 🧩 PrismJS for AL syntax highlight (optional)
* 💡 Pure client-side app

---

## 🚧 Roadmap

* ⌨️ VS Code extension
* 🧭 Enum auto-generation
* 🧩 Support for nested objects
* 📚 Multi-table generation for JSON arrays
* 🛠 Object ID auto-range selection

---

## 🤝 Inspiration

Inspired by **JSON to X++ Contract Generator** tools used in Dynamics 365 F&O —
but built especially for the **Business Central AL community**.

---

## 🙌 Contributions

PRs welcome!
Ideas, issues, improvements — all appreciated.

---

## ⭐ Support

If this helps you:

* ⭐ star the repo
* 🐦 share with AL developers
* 💬 open feature requests
