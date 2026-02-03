# How to Download & Share FirstShot Template

## Download Options

### Option 1: Download from Figma Make (Recommended)

Look for a **Download**, **Export**, or **Share** button in the Figma Make interface. This is typically located:
- In the top-right corner of the interface
- In a menu (three dots, hamburger menu, etc.)
- In a "Project" or "File" menu

This will download a `.zip` file containing all source code.

### Option 2: Copy-Paste Individual Files

If no download option is available, you can manually copy files:

1. **Essential Files to Copy:**
   ```
   package.json
   vite.config.ts
   /src/app/App.tsx
   /src/app/routes.ts
   /src/app/components/ (all .tsx files)
   /src/styles/ (all .css files)
   ```

2. **Create Project Structure:**
   ```bash
   mkdir firstshot-template
   cd firstshot-template
   mkdir -p src/app/components/ui
   mkdir -p src/styles
   ```

3. **Copy File Contents:**
   - Open each file in Figma Make
   - Copy the content
   - Paste into new files in your local project

### Option 3: Export as GitHub Repository

Some platforms allow direct GitHub export. Check if Figma Make offers:
- "Export to GitHub"
- "Push to Repository"
- "Download as Git repo"

---

## File Formats

### Does Claude Read .make Files?

**Short Answer:** No, Claude cannot directly read proprietary `.make` files.

**What Claude CAN Read:**
- ✅ Source code files (.tsx, .ts, .jsx, .js, .css)
- ✅ Configuration files (package.json, vite.config.ts)
- ✅ Markdown documentation (.md)
- ✅ Plain text files
- ✅ JSON files
- ✅ Zipped archives (.zip) - if extracted first

**What Claude CANNOT Read:**
- ❌ Proprietary binary formats (.make, .fig, etc.)
- ❌ Compiled files (.bin, .exe)
- ❌ Encrypted files

---

## How to Share with Claude

### Method 1: Share Source Code Files (Best for Backend Development)

**For Claude.ai (Web):**
1. Download the project as a .zip
2. Extract the files
3. Create a new conversation with Claude
4. Upload key files or paste code snippets
5. Reference `/COMPONENT_DICTIONARY.md` to help Claude understand structure

**For Claude Desktop (MCP):**
1. Download and extract project
2. Set up MCP filesystem access pointing to your project directory
3. Claude can directly read/write files
4. Ask Claude to help with backend integration

### Method 2: Share via GitHub

1. **Create GitHub Repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial FirstShot template"
   git branch -M main
   git remote add origin https://github.com/yourusername/firstshot.git
   git push -u origin main
   ```

2. **Share with Claude:**
   - Share the GitHub URL
   - Claude can view public repositories
   - Ask Claude to review specific files or directories

### Method 3: Share Documentation + Key Files

**Minimal Share for Claude to Understand:**
1. `/COMPONENT_DICTIONARY.md` (this gives Claude the full structure)
2. `/package.json` (dependencies)
3. Any specific files you want help with

**Example Prompt to Claude:**
```
I'm working on the FirstShot template. Here's the component dictionary that 
describes the entire structure: [paste COMPONENT_DICTIONARY.md]

I need help adding a backend API to handle user authentication. Here's the 
current login screen: [paste login-screen.tsx]

Can you help me integrate Supabase for authentication?
```

---

## Recommended Workflow for Backend Development

### Step 1: Download Template
- Get source code from Figma Make
- Extract to local directory
- Install dependencies: `npm install` or `pnpm install`

### Step 2: Set Up Local Development
```bash
# Navigate to project
cd firstshot-template

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Step 3: Share with Claude

**Option A: Claude.ai (Web Chat)**
- Upload `/COMPONENT_DICTIONARY.md`
- Share specific component files you're working on
- Ask Claude for backend integration guidance

**Option B: Claude Desktop with MCP**
- Point MCP to your project directory
- Claude can read/write files directly
- Collaborate in real-time on backend code

### Step 4: Iterate with Claude
- Ask Claude to help design API endpoints
- Request database schema suggestions
- Get code for Supabase/backend integration
- Review and test changes locally

---

## What to Include When Sharing with Claude

### Essential Context
1. **COMPONENT_DICTIONARY.md** - Complete structure overview
2. **Your goal** - What you want to build (e.g., "add user authentication")
3. **Current files** - The specific components you're modifying
4. **Tech preferences** - Backend choice (Supabase, Firebase, custom API, etc.)

### Optional Context
- **DESIGN_SYSTEM.md** - If working on UI/styling
- **EMOTION_ICONS.md** - If customizing emotion icons
- **FONT_GUIDE.md** - If changing typography
- **SITUATION_SELECTOR.md** - If modifying situations

### Example Share Package

**For "Add Authentication Backend":**
```
Files to share with Claude:
1. COMPONENT_DICTIONARY.md (structure)
2. /src/app/components/login-screen.tsx (current login)
3. /src/app/components/splash-screen.tsx (entry point)
4. /src/app/routes.ts (routing)
5. package.json (dependencies)

Prompt:
"I need to add Supabase authentication to this React app. The login screen 
is currently a mock. Help me integrate real auth with email/password and 
social providers."
```

---

## File Checklist for Download

**Core Application:**
- [ ] `/src/app/App.tsx`
- [ ] `/src/app/routes.ts`
- [ ] `/src/app/components/*.tsx` (all screen components)
- [ ] `/src/app/components/ui/*.tsx` (UI library)

**Styling:**
- [ ] `/src/styles/index.css`
- [ ] `/src/styles/fonts.css`
- [ ] `/src/styles/tailwind.css`
- [ ] `/src/styles/theme.css`

**Configuration:**
- [ ] `/package.json`
- [ ] `/vite.config.ts`
- [ ] `/postcss.config.mjs` (if exists)

**Documentation:**
- [ ] `/COMPONENT_DICTIONARY.md`
- [ ] `/DESIGN_SYSTEM.md`
- [ ] `/EMOTION_ICONS.md`
- [ ] `/FONT_GUIDE.md`
- [ ] `/SITUATION_SELECTOR.md`

**Optional:**
- [ ] `/README.md` (if exists)
- [ ] `/ATTRIBUTIONS.md`
- [ ] `.gitignore`

---

## Troubleshooting

### "I can't find a download button"
- Check the top-right menu area
- Look for "File", "Project", or "Share" menus
- Try right-clicking on the project name
- Contact Figma Make support for export instructions

### "The download is only a .make file"
- This is a proprietary format
- Look for "Export as Code" or "Export Source" option
- You may need to manually copy-paste files

### "Files are missing after download"
- Verify the zip extraction completed
- Check for hidden files (especially .gitignore)
- Some platforms exclude node_modules (that's correct - reinstall with npm)

### "Claude can't understand my code"
- Share `/COMPONENT_DICTIONARY.md` first to give context
- Upload files individually rather than as a zip
- For large projects, share specific components you're working on

---

## Next Steps After Download

1. **Install Dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Run Locally:**
   ```bash
   npm run dev
   ```

3. **Share with Claude:**
   - Upload COMPONENT_DICTIONARY.md
   - Share your backend integration goals
   - Provide specific components you're modifying

4. **Develop Backend:**
   - Set up Supabase/Firebase/custom API
   - Integrate with frontend components
   - Test authentication flow
   - Add data persistence

5. **Deploy:**
   - Build: `npm run build`
   - Deploy to Vercel/Netlify/your host
   - Configure backend environment variables

---

## Questions?

If you encounter issues downloading or sharing with Claude:

1. Check Figma Make documentation for export instructions
2. Try multiple browsers (some features may be browser-specific)
3. Contact Figma Make support for download help
4. For Claude integration questions, start a conversation with Claude.ai and ask for guidance

---

**Remember:** Claude works best with plain source code files (.tsx, .ts, .css, etc.) and documentation (.md). The COMPONENT_DICTIONARY.md file is specifically designed to help Claude understand your entire project structure quickly.
