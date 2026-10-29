import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { sampleProperties } from './src/data/properties.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent telemetry header
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Error initializing GoogleGenAI:', err);
  }
}

const PROPERTY_CATALOG_SUMMARY = sampleProperties.map(p => ({
  id: p.id,
  title: p.title,
  price: p.priceDisplay,
  rentOrBuy: p.rentOrBuy,
  city: p.city,
  neighborhood: p.neighborhood,
  specs: `${p.beds} Bed | ${p.baths} Bath | ${p.sqft} Sq. Ft.`,
  type: p.propertyType,
  highlights: p.highlights,
  lifestyleFit: p.lifestyleFitReason,
  amenities: p.amenities,
}));

const SYSTEM_INSTRUCTION = `You are "NestFind AI," an expert, friendly, and highly consultative Real Estate Property Matchmaker Assistant. Your primary goal is to understand a homebuyer or renter's unique lifestyle, budget, location preferences, and property requirements, and then guide them toward their ideal home matches.

### ROLE & RESPONSIBILITIES
1. QUALIFY & MATCH: Engage users in a natural, step-by-step discovery conversation to identify their core property preferences (Budget, Location, Bedrooms/Bathrooms, Property Type, Amenities, and Timeline).
2. CONVERSATIONAL DISCOVERY: Do NOT overwhelm the user by asking for all details at once. Ask 1 to 2 targeted questions at a time to build a buyer profile naturally.
3. RECOMMEND & EXPLAIN: Present property suggestions clearly, highlighting *why* each home fits their specific lifestyle needs (e.g., proximity to schools, home office space, pet-friendliness).
4. CALL TO ACTION: Encourage users to schedule a property viewing or speak with a licensed real estate agent when interest is shown.

### CONVERSATIONAL WORKFLOW
1. Greeting: Start with a warm welcome and ask their primary goal (e.g., buying vs. renting, or preferred location).
2. Requirement Gathering: Dynamically gather details on:
   - Location / Neighborhood vibe (e.g., suburban quiet, walkable downtown)
   - Budget range and flexible limits
   - Household size & special features (e.g., yard for dogs, garage, natural light, pool)
   - Move-in timeline
3. Property Pitch: Once you have enough context, synthesize their criteria into a "Buyer Profile Summary" and present 2–3 mock or realistic property matches based on their inputs. You may choose matching properties from our inventory catalog below or suggest tailored matches.
4. Refinement: Ask for feedback on the suggestions to narrow down or adjust their search criteria.

### FORMATTING RULES FOR PROPERTY MATCHES
When presenting property options, format them clearly using Markdown:
- **[Property Title / Style Name]** - *Price*
  - **Location:** [Neighborhood / City]
  - **Specs:** [Beds] Bed | [Baths] Bath | [Sqft] Sq. Ft.
  - **Key Highlights:** Bullet points emphasizing features that match their stated preferences.
  - **Why it fits:** A brief 1-sentence note on why this home matches their specific lifestyle goals.

### CRITICAL GUARDRAILS & BOUNDARIES
- Legal Disclaimer: You are an AI matchmaker assistant, not a licensed attorney or financial advisor. Advise users to verify local legal details and mortgage options with qualified professionals.
- Data Privacy: Never request sensitive personal financial numbers (e.g., bank account details, Social Security/National ID numbers). Keep budget discussions strictly high-level.
- Out-of-Scope Requests: If users ask non-real-estate questions (e.g., code debugging, general trivia), politely steer them back to finding their ideal home.
- Tone: Professional, warm, insightful, and enthusiastic without being pushy.

### REAL ESTATE CATALOG INVENTORY (Use matching IDs when relevant):
${JSON.stringify(PROPERTY_CATALOG_SUMMARY, null, 2)}

### METADATA OUTPUT INSTRUCTION
At the very end of your response, output a single JSON block wrapped inside <!--METADATA_START and METADATA_END--> tags containing updated profile state, recommended property IDs from the catalog if any, and 2 to 4 suggested quick response pills. Example format:
<!--METADATA_START
{
  "profileUpdate": {
    "intent": "buy" | "rent" | null,
    "budget": "$650,000" | null,
    "location": "Austin, TX" | null,
    "bedrooms": "3" | null,
    "bathrooms": "2+" | null,
    "propertyType": "Craftsman" | null,
    "mustHaves": ["Fenced yard", "Home office"],
    "timeline": "Next 60 days" | null,
    "lifestyleVibe": "Walkable & pet friendly" | null,
    "completionScore": 75
  },
  "recommendedPropertyIds": ["prop-austin-modern-1"],
  "suggestedReplies": ["Schedule a viewing for The Travis Green", "What are the HOA fees?", "Show me options under $600k"]
}
METADATA_END-->
`;

// In-memory tour bookings store
const bookings: any[] = [];

// API: Get Properties
app.get('/api/properties', (_req, res) => {
  res.json({ properties: sampleProperties });
});

// API: Book Tour
app.post('/api/book-tour', (req, res) => {
  const { propertyId, propertyTitle, date, timeSlot, tourType, buyerName, buyerEmail, buyerPhone, notes } = req.body;
  if (!propertyId || !buyerName || !buyerEmail || !date) {
    return res.status(400).json({ error: 'Missing required booking details.' });
  }

  const prop = sampleProperties.find(p => p.id === propertyId);
  const booking = {
    id: `tour-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    propertyId,
    propertyTitle: propertyTitle || prop?.title || 'Property Tour',
    propertyPrice: prop?.priceDisplay || '',
    propertyAddress: prop?.address ? `${prop.address}, ${prop.city}, ${prop.state}` : '',
    propertyImage: prop?.images[0] || '',
    date,
    timeSlot: timeSlot || 'Morning (10:00 AM)',
    tourType: tourType || 'in_person',
    buyerName,
    buyerEmail,
    buyerPhone: buyerPhone || '',
    notes: notes || '',
    agent: prop?.agent || sampleProperties[0].agent,
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  res.json({ success: true, booking });
});

// API: Chat
app.post('/api/chat', async (req, res) => {
  const { messages, currentProfile } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  // Format messages for Gemini
  const userMessages = messages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n\n');
  const currentProfileContext = currentProfile ? `\nCurrent Buyer Profile So Far:\n${JSON.stringify(currentProfile, null, 2)}` : '';
  const fullPrompt = `${currentProfileContext}\n\nConversation History:\n${userMessages}\n\nRespond as NestFind AI following all instructions, conversational discovery rules, and guardrails.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: fullPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const responseText = response.text || '';
      
      // Extract metadata
      let cleanText = responseText;
      let metadata: any = {
        profileUpdate: {},
        recommendedPropertyIds: [],
        suggestedReplies: [],
      };

      const metaMatch = responseText.match(/<!--METADATA_START([\s\S]*?)METADATA_END-->/);
      if (metaMatch && metaMatch[1]) {
        try {
          metadata = JSON.parse(metaMatch[1].trim());
          cleanText = responseText.replace(/<!--METADATA_START[\s\S]*?METADATA_END-->/, '').trim();
        } catch (e) {
          console.warn('Could not parse metadata JSON block:', e);
        }
      }

      // Auto-detect property IDs if mentioned in markdown text
      const detectedIds: string[] = [...(metadata.recommendedPropertyIds || [])];
      sampleProperties.forEach(p => {
        if (cleanText.toLowerCase().includes(p.title.toLowerCase()) && !detectedIds.includes(p.id)) {
          detectedIds.push(p.id);
        }
      });
      metadata.recommendedPropertyIds = detectedIds;

      return res.json({
        text: cleanText,
        metadata,
      });
    } catch (err: any) {
      console.error('Gemini API call failed, falling back to consultative engine:', err?.message || err);
    }
  }

  // Resilient consultative fallback engine when API key is missing or offline
  const lastUserMsg = messages[messages.length - 1]?.text?.toLowerCase() || '';
  let fallbackReply = '';
  let updatedProfile: any = { ...(currentProfile || {}) };
  let recommendedIds: string[] = [];
  let suggestedReplies: string[] = [];

  if (lastUserMsg.includes('buy') || lastUserMsg.includes('purchase')) {
    updatedProfile.intent = 'buy';
  } else if (lastUserMsg.includes('rent') || lastUserMsg.includes('lease')) {
    updatedProfile.intent = 'rent';
  }

  if (lastUserMsg.includes('austin')) updatedProfile.location = 'Austin, TX';
  if (lastUserMsg.includes('denver')) updatedProfile.location = 'Denver, CO';
  if (lastUserMsg.includes('seattle')) updatedProfile.location = 'Seattle, WA';
  if (lastUserMsg.includes('miami')) updatedProfile.location = 'Miami, FL';

  if (lastUserMsg.includes('dog') || lastUserMsg.includes('pet') || lastUserMsg.includes('yard')) {
    if (!updatedProfile.mustHaves) updatedProfile.mustHaves = [];
    if (!updatedProfile.mustHaves.includes('Fenced Yard')) updatedProfile.mustHaves.push('Fenced Yard');
  }
  if (lastUserMsg.includes('office') || lastUserMsg.includes('remote') || lastUserMsg.includes('work from home')) {
    if (!updatedProfile.mustHaves) updatedProfile.mustHaves = [];
    if (!updatedProfile.mustHaves.includes('Dedicated Office')) updatedProfile.mustHaves.push('Dedicated Office');
  }

  if (!updatedProfile.location && !updatedProfile.intent) {
    fallbackReply = `Welcome to **NestFind AI**! I'm your dedicated real estate matchmaker, here to help you uncover a home that truly mirrors your lifestyle and everyday rhythms.\n\nTo begin our journey together: **Are you looking to buy your next home or find a rental, and do you have a specific city or neighborhood in mind?**`;
    suggestedReplies = ["I'm looking to buy in Austin", "Renting in a walkable downtown", "First-time buyer with under $600k budget", "Relocating for family & top schools"];
  } else if (!updatedProfile.budget) {
    fallbackReply = `Wonderful! Focusing on your lifestyle helps us find spaces that genuinely feel like home.\n\nTo narrow down our search comfortably: **What is your target budget range (and any flexible ceiling you have in mind), and roughly how many bedrooms and bathrooms would comfortably suit your household?**\n\n*(Note: As an AI matchmaker, I'll never ask for private financial details—just high-level ballpark figures!)*`;
    suggestedReplies = ["$500k – $650k with 3 beds", "Under $3,000/mo for 2 beds", "$700k – $850k with 4 beds", "Flexible around $600k"];
  } else {
    // Pitch properties
    recommendedIds = ['prop-austin-modern-1', 'prop-seattle-botanical-townhome'];
    fallbackReply = `### Buyer Profile Summary\n- **Goal:** ${updatedProfile.intent === 'rent' ? 'Rental Lease' : 'Home Purchase'}\n- **Target Location:** ${updatedProfile.location || 'Active Metro Corridor'}\n- **Priority Must-Haves:** ${updatedProfile.mustHaves?.join(', ') || 'Dedicated workspace, natural light'}\n\nBased on your lifestyle preferences, here are 2 handpicked matches that align beautifully with your criteria:\n\n- **The Travis Green Modern Craftsman** - *$649,000*\n  - **Location:** South Congress & Zilker, Austin, TX\n  - **Specs:** 3 Bed | 2.5 Bath | 2,180 Sq. Ft.\n  - **Key Highlights:** Fully fenced private yard for dogs, dedicated sunlit walnut office, solar-ready with EV charger.\n  - **Why it fits:** Provides an effortless work-from-home layout with immediate access to South Congress dining and dog-friendly greenbelts.\n\n- **Ballard Scandinavian Eco-Townhome** - *$589,000*\n  - **Location:** Ballard / Fremont, Seattle, WA\n  - **Specs:** 3 Bed | 2 Bath | 1,640 Sq. Ft.\n  - **Key Highlights:** Private cedar rooftop sauna, Olympic mountain sunset views, Built Green 4-Star certified.\n  - **Why it fits:** Seamlessly balances sustainable low-maintenance living with energetic neighborhood walkability.\n\nWould you like to schedule an in-person or live video tour for either of these, or should we fine-tune any particular details like yard size or budget?`;
    suggestedReplies = ["Schedule a viewing for The Travis Green", "Tell me more about the neighborhood schools", "Show me options with a swimming pool", "Adjust budget to $750k"];
  }

  return res.json({
    text: fallbackReply,
    metadata: {
      profileUpdate: updatedProfile,
      recommendedPropertyIds: recommendedIds,
      suggestedReplies,
    },
  });
});

// Dev vs Prod Vite middleware configuration
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production static assets
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Dev mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NestFind AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
