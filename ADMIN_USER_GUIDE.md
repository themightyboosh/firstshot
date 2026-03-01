# Admin Panel User Guide

Welcome! This guide will walk you through everything you need to know to manage your app. No technical experience required.

---

## Quick Links

| What | Link |
|------|------|
| **Admin Panel** | [https://realness-score-admin.web.app](https://realness-score-admin.web.app) |
| **User App** | [https://realness-score.web.app](https://realness-score.web.app) |

---

## Authorized Admin Users

The following email addresses have access to the admin panel:

- `daniel@monumental-i.com`
- `conkright.scott@gmail.com`

To add more admin users, contact your developer.

---

## Getting Started

### Logging In

1. Go to the Admin Panel link above
2. Click **"Continue with Google"**
3. Sign in with an authorized email address
4. You'll land on the Dashboard

---

## Understanding the Navigation

The left sidebar contains all your management areas:

| Section | What It Does |
|---------|--------------|
| **Dashboard** | Overview of your app's activity |
| **CAS Configuration** | Manage personality archetypes and assessment questions |
| **Situations** | Create and edit the scenarios users can choose from |
| **Affects** | Manage the "vibe" options users select |
| **Page Content** | Edit text and images that appear throughout the app |
| **Simulator** | Test the AI responses without using the real app |
| **Analytics** | View user responses and feedback |
| **Users** | See who has used your app |
| **Global Settings** | App-wide settings like name, logo, and AI prompts |

---

## Managing Situations

Situations are the scenarios your users choose from (e.g., "First Date", "Meeting the Parents").

### To Add a New Situation

1. Click **Situations** in the sidebar
2. Click the **"Add Situation"** button
3. Fill in the details:
   - **Name**: What users will see (e.g., "First Date")
   - **Short Description**: A brief explanation shown under the name
   - **Prompt Fragment**: Instructions for the AI about this scenario
4. Click **Save**

### To Generate an Image

1. Open a situation by clicking its name
2. Write a description of the image you want in the **Image Description** field
3. Click **Generate Image**
4. Wait for the image to appear (usually 10-30 seconds)
5. Don't forget to **Save** after you're happy with it

### To Edit or Delete

- Click on any situation to edit it
- Use the delete button (trash icon) to remove it

---

## Managing Affects (Vibes)

Affects are the emotional "vibes" users can select to describe how someone seems.

### To Add a New Affect

1. Click **Affects** in the sidebar
2. Click **"Add Affect"**
3. Fill in:
   - **Name**: The affect label (e.g., "Warm", "Guarded")
   - **Description**: What this affect means
   - **Interaction Guidance**: Tips the AI uses when someone has this vibe
4. Click **Save**

### To Generate an Icon

Same process as situations—describe the icon and click Generate.

---

## Managing Page Content

This is where you control the text and images users see on various screens.

### What Each Content Item Controls

| Content ID | Where It Appears |
|------------|------------------|
| `select_situation` | The "Choose a Situation" screen |
| `select_affect` | The "Gauge the Vibe" screen |
| `archetype_reveal` | When users discover their personality type |
| `about` | The About page |

### To Edit Content

1. Click **Page Content** in the sidebar
2. Find the item you want to change
3. Edit the **Title**, **Copy** (main text), or **Button Text**
4. Click **Save**

---

## Managing Archetypes (CAS Configuration)

Archetypes are the personality types users are matched to after completing the assessment.

### To Edit an Archetype

1. Click **CAS Configuration** in the sidebar
2. Find the archetype you want to change
3. Edit the name, description, or profile data
4. Generate a new image if needed
5. Click **Save**

### To Import/Export Archetypes

- **Export**: Click "Export Archetypes" to download a backup file
- **Import**: Click "Import Archetypes" to restore from a backup

---

## Global Settings

This is where you control app-wide settings.

### App Identity

- **App Name**: The name shown in the header and throughout the app
- **App Logo**: Paste your logo's SVG code here (ask your designer for this)

### AI Configuration

- **Master Prompt**: The main instructions given to the AI. This is the "brain" of your guidance.
- **Image Style Prompt**: Describes the visual style for all generated images. Add instructions like "Do not include any text in the image" here.

### Changing the Master Prompt

The master prompt uses special tokens that get replaced with real data:

| Token | What It Becomes |
|-------|-----------------|
| `*core-recognition*` | The user's core recognition text |
| `*protective-logic*` | Their protective logic |
| `*cost-under-stress*` | What happens under stress |
| `*situation_context*` | The situation they selected |
| `*affect_name*` | The vibe they chose |
| `*affect_description*` | Description of that vibe |

---

## Viewing Analytics

### User Responses

1. Click **Analytics** in the sidebar
2. Click **Responses**
3. You'll see all user assessment responses
4. Use **Clear All** to reset the data (be careful—this cannot be undone!)

### User Feedback

1. Click **Analytics** → **Feedback**
2. See the star ratings and comments users have left
3. Use **Clear All** to reset if needed

---

## Using the Simulator

The Simulator lets you test AI responses without going through the real app.

1. Click **Simulator** in the sidebar
2. Select an **Archetype**
3. Select a **Situation**
4. Select an **Affect**
5. Click **Generate**
6. See what guidance the AI produces

This is great for testing your prompts before users see them.

---

## Tips & Best Practices

### For Better AI Responses

- Be specific in your Master Prompt about the tone you want
- Test with the Simulator before going live
- Review user feedback regularly to improve

### For Better Images

- Be descriptive: "A warm sunset scene with two people talking at a cafe" works better than "two people"
- Include style cues: "soft watercolor style", "modern minimal illustration"
- Add "Do not include any text or words in the image" to avoid text appearing in images

### For Better User Experience

- Keep situation names short and clear
- Write descriptions that help users identify with the scenario
- Use affect names that are intuitive (avoid jargon)

---

## Troubleshooting

### "I can't log in"

- Make sure you're using an authorized email address
- Try clearing your browser cache
- Use the "Sign in with different account" option

### "My image won't generate"

- Image generation can take 30-60 seconds
- If it fails, try a simpler description
- Check if the description might trigger content filters

### "The AI response isn't good"

- Review your Master Prompt in Global Settings
- Test with the Simulator
- Make the prompt more specific about what you want

### "I made a mistake and need to undo"

- Most changes can be edited again
- For deleted items, you'll need to recreate them
- Export your archetypes regularly as a backup

---

## Need Help?

Contact your administrator or developer if you:
- Need to add new admin users
- Experience technical issues
- Want to request new features

---

*Last updated: January 2026*
