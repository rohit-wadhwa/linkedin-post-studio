/**
 * LinkedIn Post Studio - Template Manager
 * Manages saving, loading, and deleting post templates using Chrome storage.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'lps_templates';
  const LPS = window.LinkedInPostStudio || {};

  /**
   * Default templates that ship with the extension.
   */
  const DEFAULT_TEMPLATES = [
    {
      id: 'default-hook-question',
      name: 'Hook: Question',
      category: 'Post Hooks',
      content: 'Have you ever wondered why...\n\nHere\'s what I learned 👇',
    },
    {
      id: 'default-hook-stat',
      name: 'Hook: Surprising Stat',
      category: 'Post Hooks',
      content: '[X]% of [audience] don\'t know this about [topic].\n\nLet me break it down:',
    },
    {
      id: 'default-cta-engage',
      name: 'CTA: Engagement',
      category: 'CTAs',
      content: '\n———————————————\n♻️ Repost if this was helpful\n👍 Like if you agree\n💬 Comment your thoughts below',
    },
    {
      id: 'default-cta-follow',
      name: 'CTA: Follow',
      category: 'CTAs',
      content: '\n———————————————\nFollow me for more insights on [topic].\nI share daily tips about [area].',
    },
    {
      id: 'default-hashtags-tech',
      name: 'Hashtags: Tech',
      category: 'Hashtags',
      content: '\n\n#Technology #Innovation #Software #TechLeadership #DigitalTransformation',
    },
    {
      id: 'default-hashtags-career',
      name: 'Hashtags: Career',
      category: 'Hashtags',
      content: '\n\n#CareerGrowth #Leadership #ProfessionalDevelopment #WorkLife #Hiring',
    },
    {
      id: 'default-listicle',
      name: 'Structure: Listicle',
      category: 'General',
      content: '[Bold hook statement]\n\nHere are [X] things I learned:\n\n1. [Point one]\n→ [Brief explanation]\n\n2. [Point two]\n→ [Brief explanation]\n\n3. [Point three]\n→ [Brief explanation]\n\nWhich one resonates most with you?',
    },
    {
      id: 'default-story',
      name: 'Structure: Story Post',
      category: 'General',
      content: '[Attention-grabbing first line]\n\nHere\'s the story:\n\n[Situation - 1-2 lines]\n\n[What happened - 2-3 lines]\n\n[The lesson - 1-2 lines]\n\n———————————————\n\nKey takeaway: [One clear insight]',
    },
  ];

  /**
   * Load all templates from Chrome storage.
   */
  async function loadTemplates() {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      const templates = result[STORAGE_KEY];
      if (!templates || templates.length === 0) {
        // Initialize with defaults
        await chrome.storage.local.set({ [STORAGE_KEY]: DEFAULT_TEMPLATES });
        return DEFAULT_TEMPLATES;
      }
      return templates;
    } catch (err) {
      console.warn('LinkedIn Post Studio: Could not load templates from storage.', err);
      return DEFAULT_TEMPLATES;
    }
  }

  /**
   * Save a new template.
   */
  async function saveTemplate(template) {
    const templates = await loadTemplates();
    const newTemplate = {
      id: 'tpl-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      name: template.name,
      category: template.category || 'General',
      content: template.content,
      createdAt: new Date().toISOString(),
    };
    templates.push(newTemplate);
    await chrome.storage.local.set({ [STORAGE_KEY]: templates });
    return templates;
  }

  /**
   * Delete a template by ID.
   */
  async function deleteTemplate(id) {
    let templates = await loadTemplates();
    templates = templates.filter((t) => t.id !== id);
    await chrome.storage.local.set({ [STORAGE_KEY]: templates });
    return templates;
  }

  /**
   * Update an existing template.
   */
  async function updateTemplate(id, updates) {
    const templates = await loadTemplates();
    const index = templates.findIndex((t) => t.id === id);
    if (index !== -1) {
      templates[index] = { ...templates[index], ...updates };
      await chrome.storage.local.set({ [STORAGE_KEY]: templates });
    }
    return templates;
  }

  /**
   * Get templates filtered by category.
   */
  async function getTemplatesByCategory(category) {
    const templates = await loadTemplates();
    if (!category || category === 'All') return templates;
    return templates.filter((t) => t.category === category);
  }

  /**
   * Export all templates as JSON.
   */
  async function exportTemplates() {
    const templates = await loadTemplates();
    return JSON.stringify(templates, null, 2);
  }

  /**
   * Import templates from JSON string.
   * Validates that each template has required name and content fields.
   */
  async function importTemplates(jsonString) {
    const imported = JSON.parse(jsonString);
    if (!Array.isArray(imported)) throw new Error('Invalid template format: expected an array');

    // Validate each template has required fields
    const valid = imported.filter((t) =>
      t && typeof t.name === 'string' && t.name.trim() &&
      typeof t.content === 'string' && t.content.trim()
    );

    if (valid.length === 0) throw new Error('No valid templates found');

    const existing = await loadTemplates();
    const merged = [...existing, ...valid.map((t) => ({
      name: t.name.trim(),
      category: (t.category && typeof t.category === 'string') ? t.category.trim() : 'General',
      content: t.content,
      id: 'tpl-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      createdAt: new Date().toISOString(),
    }))];

    await chrome.storage.local.set({ [STORAGE_KEY]: merged });
    return merged;
  }

  // Expose API
  Object.assign(LPS, {
    loadTemplates,
    saveTemplate,
    deleteTemplate,
    updateTemplate,
    getTemplatesByCategory,
    exportTemplates,
    importTemplates,
    DEFAULT_TEMPLATES,
  });

  window.LinkedInPostStudio = LPS;
})();
