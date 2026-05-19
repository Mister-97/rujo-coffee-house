const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 're_cir2zmAi_ARsFHsv7VdLizdfCsLJAt8Bo');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    firstName, lastName, email, phone,
    businessName, businessType, volume, interest, message
  } = req.body || {};

  if (!firstName || !email || !businessName || !businessType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const row = (label, value) => value ? `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8e4da;color:#7a7a7a;width:160px;font-size:11px;letter-spacing:2px;text-transform:uppercase;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e8e4da;font-size:14px;">${value}</td>
    </tr>` : '';

  try {
    await resend.emails.send({
      from: 'Rujo Coffee House <noreply@rujocoffeehouse.com>',
      to:   ['support@rujocoffeehouse.com'],
      replyTo: email,
      subject: `[Wholesale] ${businessName} — ${businessType}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;color:#1a1a1a;">
          <div style="background:#0f0f0f;padding:32px 40px;border-bottom:2px solid #d0a148;">
            <p style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#d0a148;margin:0 0 8px;">Rujo Coffee House</p>
            <h1 style="font-size:22px;font-weight:400;color:#f5f1e8;margin:0;">New Wholesale Enquiry</h1>
          </div>
          <div style="padding:32px 40px;background:#f9f7f3;border:1px solid #e8e4da;">
            <table style="width:100%;border-collapse:collapse;">
              ${row('Name',          `${firstName} ${lastName}`)}
              ${row('Email',         `<a href="mailto:${email}" style="color:#d0a148;">${email}</a>`)}
              ${row('Phone',         phone)}
              ${row('Business',      businessName)}
              ${row('Type',          businessType)}
              ${row('Monthly Volume',volume)}
              ${row('Interest',      interest)}
            </table>
            ${message ? `
            <div style="margin-top:24px;">
              <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#7a7a7a;margin-bottom:10px;">Notes</p>
              <p style="font-size:15px;line-height:1.8;color:#1a1a1a;white-space:pre-wrap;">${message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
            </div>` : ''}
          </div>
          <div style="padding:16px 40px;background:#0f0f0f;">
            <p style="font-size:11px;color:#7a7a7a;margin:0;text-align:center;letter-spacing:1px;">rujocoffeehouse.com · Reply directly to this email to respond</p>
          </div>
        </div>
      `,
    });

    await resend.emails.send({
      from: 'Rujo Coffee House <noreply@rujocoffeehouse.com>',
      to:   [email],
      subject: `We got your wholesale enquiry — Rujo Coffee House`,
      html: `
        <div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;">
          <div style="background:#0f0f0f;padding:32px 40px;border-bottom:2px solid #d0a148;">
            <p style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#d0a148;margin:0 0 8px;">Rujo Coffee House</p>
            <h1 style="font-size:22px;font-weight:400;color:#f5f1e8;margin:0;">Thanks, ${firstName}.</h1>
          </div>
          <div style="padding:36px 40px;background:#f9f7f3;border:1px solid #e8e4da;">
            <p style="font-size:15px;line-height:1.9;color:#1a1a1a;">
              We've received your enquiry for <strong>${businessName}</strong> and will be in touch within one business day.
            </p>
            <p style="font-size:15px;line-height:1.9;color:#1a1a1a;margin-top:16px;">
              In the meantime you can browse our full range below.
            </p>
            <div style="margin-top:28px;">
              <a href="https://rujocoffeehouse.com/shop"
                 style="display:inline-block;padding:12px 28px;border:1px solid #d0a148;color:#d0a148;text-decoration:none;font-size:11px;letter-spacing:3px;text-transform:uppercase;">
                View the Shop
              </a>
            </div>
          </div>
          <div style="padding:16px 40px;background:#0f0f0f;">
            <p style="font-size:11px;color:#7a7a7a;margin:0;text-align:center;letter-spacing:1px;">© 2025 Rujo Coffee House · Crafted with intention</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send' });
  }
};
