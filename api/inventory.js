// api/inventory.js
// Fetches and parses the ICT Coffee live inventory page, returns JSON.
// Vercel caches the response for 10 minutes (s-maxage=600) so we don't
// hammer their site on every page load.

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60');

  try {
    const response = await fetch('https://www.ictcoffee.com/live-inventory/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RujoCoffeeBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      throw new Error('ICT fetch failed: ' + response.status);
    }

    const html = await response.text();
    const beans = parseInventory(html);

    return res.status(200).json({ ok: true, beans, fetchedAt: new Date().toISOString() });
  } catch (err) {
    console.error('inventory scrape error:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#\d+;/g, '').replace(/\s+/g, ' ').trim();
}

function parseInventory(html) {
  const beans = [];

  // Find every <tr> in the page
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;

  let trMatch;
  while ((trMatch = trRegex.exec(html)) !== null) {
    const cells = [];
    let tdMatch;
    // Reset lastIndex for the td regex on each row
    tdRegex.lastIndex = 0;
    let rowHtml = trMatch[1];
    while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
      cells.push(stripTags(tdMatch[1]));
    }

    // ICT inventory rows have at least 5 cells:
    // [origin, grade, warehouse, bagSize, stockLine, ...productId]
    if (cells.length < 5) continue;

    // Stock cell looks like "124 in stock" or "1 in stock"
    const stockMatch = cells.join(' ').match(/(\d+)\s+in\s+stock/i);
    if (!stockMatch) continue;

    // Product ref looks like P118xxx/1
    const refMatch = cells.join(' ').match(/P\d{6}\/\d+/i);

    // Bag size: "60 Kg Bags" or "69 Kg Bags"
    const bagMatch = cells.join(' ').match(/(\d+)\s*[Kk]g?\s*[Bb]ags?/);

    // The first non-empty cell that isn't a number/unit is the origin
    const origin = cells[0];
    const grade  = cells[1];
    const warehouse = cells[2];

    if (!origin || origin.length < 2) continue;

    beans.push({
      origin:    origin,
      grade:     grade  || '',
      warehouse: warehouse || '',
      bag:       bagMatch  ? parseInt(bagMatch[1], 10) : 60,
      stock:     parseInt(stockMatch[1], 10),
      ref:       refMatch  ? refMatch[0] : '',
    });
  }

  return beans;
}
