const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, subject, message } = req.body || {};

  if (!firstName || !email || !message || !subject) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await resend.emails.send({
      from: 'Rujo Coffee House <support@rujocoffeehouse.com>',
      to:   ['support@rujocoffeehouse.com'],
      replyTo: email,
      subject: `[Contact] ${subject} — ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
          <div style="background: #0f0f0f; padding: 32px 40px; border-bottom: 2px solid #d0a148;">
            <p style="font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #d0a148; margin: 0 0 8px;">
              Rujo Coffee House
            </p>
            <h1 style="font-size: 22px; font-weight: 400; color: #f5f1e8; margin: 0;">
              New Contact Message
            </h1>
          </div>
          <div style="padding: 32px 40px; background: #f9f7f3; border: 1px solid #e8e4da;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e8e4da; color: #7a7a7a; width: 130px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e8e4da;">${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e8e4da; color: #7a7a7a; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e8e4da;"><a href="mailto:${email}" style="color: #d0a148;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e8e4da; color: #7a7a7a; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Subject</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e8e4da;">${subject}</td>
              </tr>
            </table>
            <div style="margin-top: 24px;">
              <p style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #7a7a7a; margin-bottom: 10px;">Message</p>
              <p style="font-size: 15px; line-height: 1.8; color: #1a1a1a; white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>
          </div>
          <div style="padding: 16px 40px; background: #0f0f0f;">
            <p style="font-size: 11px; color: #7a7a7a; margin: 0; text-align: center; letter-spacing: 1px;">
              rujocoffeehouse.com · Reply directly to this email to respond
            </p>
          </div>
        </div>
      `,
    });

    // Auto-reply to sender
    await resend.emails.send({
      from: 'Rujo Coffee House <support@rujocoffeehouse.com>',
      to:   [email],
      subject: 'We received your message — Rujo Coffee House',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0f0f0f; padding: 32px 40px; border-bottom: 2px solid #d0a148;">
            <p style="font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #d0a148; margin: 0 0 8px;">
              Rujo Coffee House
            </p>
            <h1 style="font-size: 22px; font-weight: 400; color: #f5f1e8; margin: 0;">
              Thank you, ${firstName}.
            </h1>
          </div>
          <div style="padding: 36px 40px; background: #f9f7f3; border: 1px solid #e8e4da;">
            <p style="font-size: 15px; line-height: 1.9; color: #1a1a1a;">
              We've received your message and will get back to you within 24–48 hours.
            </p>
            <p style="font-size: 15px; line-height: 1.9; color: #1a1a1a; margin-top: 16px;">
              In the meantime, feel free to explore our collection.
            </p>
            <div style="margin-top: 28px;">
              <a href="https://rujocoffeehouse.com/shop"
                 style="display: inline-block; padding: 12px 28px; border: 1px solid #d0a148; color: #d0a148; text-decoration: none; font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">
                Shop Now
              </a>
            </div>
          </div>
          <div style="padding: 16px 40px; background: #0f0f0f;">
            <p style="font-size: 11px; color: #7a7a7a; margin: 0; text-align: center; letter-spacing: 1px;">
              © 2025 Rujo Coffee House · Crafted with intention
            </p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};
