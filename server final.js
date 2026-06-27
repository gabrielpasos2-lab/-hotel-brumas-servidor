/**
 * ─────────────────────────────────────────────────────────
 *  Hotel Las Brumas · Servidor de Notificaciones por Correo
 *  Node.js + Express + Nodemailer + Brevo SMTP
 * ─────────────────────────────────────────────────────────
 *
 *  INSTALACIÓN (una sola vez):
 *    1. Instalar Node.js desde https://nodejs.org (v18+)
 *    2. Abrir terminal en la carpeta de este archivo
 *    3. Ejecutar: npm install express nodemailer cors
 *    4. Iniciar:  node server.js
 *    5. Corre en: http://localhost:3000
 *
 *  INICIO AUTOMÁTICO CON WINDOWS:
 *    npm install -g pm2
 *    pm2 start server.js --name "hotel-las-brumas"
 *    pm2 startup && pm2 save
 * ─────────────────────────────────────────────────────────
 */

const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const path       = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// ── Servir el sistema HTML desde el mismo servidor ────────
// Esto permite abrir el sistema como http://localhost:3000
// en lugar de abrir el archivo directamente (file://), lo cual
// evita el bloqueo de seguridad del navegador para peticiones de red.
app.use(express.static(__dirname));

// ══════════════════════════════════════════════════════════
//  CONFIGURACIÓN BREVO — YA CONFIGURADO
// ══════════════════════════════════════════════════════════
const CONFIG = {

  smtp: {
    host:   'smtp-relay.brevo.com',
    port:   587,
    secure: false,
    auth: {
      user: 'aea8a3001@smtp-brevo.com',
      pass: 'xsmtpsib-264feae522ff9c561db0322f7dc6e4409b8baa9de5f5dcb1187cc6392300e247-MTFHbtuqrANMLefy',
    },
    tls: {
      // Brevo (antes Sendinblue) usa certificados con nombres alternativos
      // que no siempre coinciden exactamente con el hostname de conexión.
      rejectUnauthorized: false,
    },
  },

  from: '"Sistema de Tiquetes - Hotel Las Brumas" <admbrumas@outlook.com>',

  // ── Cambiá estos correos por los reales del hotel ──────
  adminEmail: 'admbrumas@outlook.com',

  destinos: {
    'Mantenimiento': ['admbrumas@outlook.com'],
    'Housekeeping':  ['admbrumas@outlook.com'],
    'Recepcion':     ['admbrumas@outlook.com'],
    'A&B':           ['admbrumas@outlook.com'],
    'TI':            ['admbrumas@outlook.com'],
    'Desayuno':      ['admbrumas@outlook.com'],
    'Servicio':      ['admbrumas@outlook.com'],
  },
};
// ══════════════════════════════════════════════════════════

const transporter = nodemailer.createTransport(CONFIG.smtp);

transporter.verify((err) => {
  if (err) {
    console.error('❌ Error SMTP Brevo:', err.message);
  } else {
    console.log('✅ Conexión SMTP Brevo OK —', CONFIG.smtp.auth.user);
  }
});

// ── HTML correo desayuno ──────────────────────────────────
function buildBreakfastHTML(t) {
  const ppl = (t.personas||[]).map(p=>`${p.nombre} <span style="color:#b8860b;font-weight:400">(${p.tipo})</span>`).join('<br>') || `${t.qty||1} persona(s)`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#eef1f7;font-family:Georgia,'Times New Roman',serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef1f7;padding:40px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(22,40,72,.12)">

          <!-- Header navy -->
          <tr>
            <td style="background:linear-gradient(135deg,#162848 0%,#1f3a6e 100%);padding:38px 40px 32px;text-align:center">
              <div style="font-family:Georgia,serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#7dc6ff;margin-bottom:10px">
                Hotel Las Brumas
              </div>
              <div style="width:36px;height:1px;background:rgba(255,255,255,.25);margin:0 auto 14px"></div>
              <div style="font-family:Georgia,serif;font-size:24px;font-weight:400;color:#ffffff;letter-spacing:.3px">
                Confirmación de Desayuno
              </div>
            </td>
          </tr>

          <!-- Voucher body -->
          <tr>
            <td style="padding:36px 40px 8px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1.5px dashed #d9b65c;border-radius:14px;background:#fdf9ef">
                <tr>
                  <td style="padding:28px 32px;text-align:center">
                    <div style="font-size:30px;line-height:1;margin-bottom:10px">🍳</div>
                    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a07010;font-weight:bold;margin-bottom:10px;font-family:Arial,sans-serif">
                      Código de Tiquete
                    </div>
                    <div style="font-family:'Courier New',Courier,monospace;font-size:30px;font-weight:bold;color:#162848;letter-spacing:5px;margin-bottom:6px">
                      ${t.id}
                    </div>
                    <div style="width:48px;height:2px;background:#d9b65c;margin:14px auto 16px"></div>
                    <div style="font-family:Arial,sans-serif;font-size:16px;color:#1c2e52;font-weight:600;margin-bottom:2px">
                      ${t.guest || 'Huésped'}
                    </div>
                    <div style="font-family:Arial,sans-serif;font-size:13px;color:#7a8fae">
                      Habitación ${t.room || '—'}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details table -->
          <tr>
            <td style="padding:24px 40px 8px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif">
                ${t.dateFrom ? `
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #eef1f7;font-size:12px;color:#9aabc4;width:140px;vertical-align:top">VIGENCIA</td>
                  <td style="padding:11px 0;border-bottom:1px solid #eef1f7;font-size:14px;color:#1c2e52;text-align:right">
                    ${t.dateFrom}${t.dateTo ? ' &nbsp;→&nbsp; ' + t.dateTo : ''}
                  </td>
                </tr>` : ''}
                ${t.validez ? `
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #eef1f7;font-size:12px;color:#9aabc4;vertical-align:top">VALIDEZ</td>
                  <td style="padding:11px 0;border-bottom:1px solid #eef1f7;font-size:14px;color:#a07010;font-weight:600;text-align:right">
                    ${t.validez}
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #eef1f7;font-size:12px;color:#9aabc4;vertical-align:top">PERSONAS</td>
                  <td style="padding:11px 0;border-bottom:1px solid #eef1f7;font-size:14px;color:#1c2e52;text-align:right;line-height:1.6">
                    ${ppl}
                  </td>
                </tr>
                ${t.notes ? `
                <tr>
                  <td style="padding:11px 0;font-size:12px;color:#9aabc4;vertical-align:top">NOTAS</td>
                  <td style="padding:11px 0;font-size:13px;color:#a07010;text-align:right;font-style:italic">
                    ${t.notes}
                  </td>
                </tr>` : ''}
              </table>
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td style="padding:20px 40px 36px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6fb;border-radius:10px">
                <tr>
                  <td style="padding:16px 20px;text-align:center;font-family:Arial,sans-serif">
                    <div style="font-size:13px;color:#5a6f94;line-height:1.6">
                      Presente este código en el restaurante al momento del desayuno.
                      <br><strong style="color:#2b4f90">Válido para una sola presentación.</strong>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7f9fd;padding:22px 40px;text-align:center;border-top:1px solid #eef1f7">
              <div style="font-family:Arial,sans-serif;font-size:11px;color:#aab4c8;letter-spacing:.5px">
                HOTEL LAS BRUMAS &nbsp;·&nbsp; Sistema de Tiquetes Interno &nbsp;·&nbsp; ${new Date().getFullYear()}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── HTML correo servicio general ─────────────────────────
function buildServiceHTML(t) {
  const priColors = {
    Alta:  { bg:'#fbeaea', fg:'#c0392b', label:'Alta'  },
    Media: { bg:'#fef3e6', fg:'#c2750c', label:'Media' },
    Baja:  { bg:'#e9f6ec', fg:'#1e7a3d', label:'Baja'  },
  };
  const pri = priColors[t.pri] || priColors.Media;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#eef1f7;font-family:Georgia,'Times New Roman',serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef1f7;padding:40px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(22,40,72,.12)">

          <!-- Header navy -->
          <tr>
            <td style="background:linear-gradient(135deg,#162848 0%,#1f3a6e 100%);padding:38px 40px 32px;text-align:center">
              <div style="font-family:Georgia,serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#7dc6ff;margin-bottom:10px">
                Hotel Las Brumas
              </div>
              <div style="width:36px;height:1px;background:rgba(255,255,255,.25);margin:0 auto 14px"></div>
              <div style="font-family:Georgia,serif;font-size:24px;font-weight:400;color:#ffffff">
                Nuevo Tiquete Registrado
              </div>
            </td>
          </tr>

          <!-- ID + priority pills -->
          <tr>
            <td style="padding:32px 40px 0;text-align:center;font-family:Arial,sans-serif">
              <span style="display:inline-block;background:#edf3fc;color:#2b4f90;font-size:13px;font-weight:bold;padding:7px 18px;border-radius:20px;margin:0 4px 8px">
                ${t.id}
              </span>
              <span style="display:inline-block;background:${pri.bg};color:${pri.fg};font-size:13px;font-weight:bold;padding:7px 18px;border-radius:20px;margin:0 4px 8px">
                Prioridad ${pri.label}
              </span>
            </td>
          </tr>

          <!-- Description box -->
          <tr>
            <td style="padding:20px 40px 8px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f9fd;border-left:3px solid #2b4f90;border-radius:0 10px 10px 0">
                <tr>
                  <td style="padding:18px 22px;font-family:Arial,sans-serif">
                    <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9aabc4;margin-bottom:6px">Descripción</div>
                    <div style="font-size:14px;color:#1c2e52;line-height:1.6">${t.desc || '—'}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Details table -->
          <tr>
            <td style="padding:24px 40px 8px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif">
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #eef1f7;font-size:12px;color:#9aabc4;width:140px">HUÉSPED</td>
                  <td style="padding:11px 0;border-bottom:1px solid #eef1f7;font-size:14px;color:#1c2e52;font-weight:600;text-align:right">${t.guest || '—'}</td>
                </tr>
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #eef1f7;font-size:12px;color:#9aabc4">HABITACIÓN</td>
                  <td style="padding:11px 0;border-bottom:1px solid #eef1f7;font-size:14px;color:#1c2e52;text-align:right">Hab. ${t.room || '—'}</td>
                </tr>
                <tr>
                  <td style="padding:11px 0;border-bottom:1px solid #eef1f7;font-size:12px;color:#9aabc4">CORREO</td>
                  <td style="padding:11px 0;border-bottom:1px solid #eef1f7;font-size:13px;color:#1c2e52;text-align:right">${t.email || '—'}</td>
                </tr>
                <tr>
                  <td style="padding:11px 0;font-size:12px;color:#9aabc4">REGISTRADO POR</td>
                  <td style="padding:11px 0;font-size:14px;color:#1c2e52;text-align:right">${t.registradoPor || 'Sistema'}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr><td style="padding:0 40px 28px"></td></tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7f9fd;padding:22px 40px;text-align:center;border-top:1px solid #eef1f7">
              <div style="font-family:Arial,sans-serif;font-size:11px;color:#aab4c8;letter-spacing:.5px">
                HOTEL LAS BRUMAS &nbsp;·&nbsp; Sistema de Tiquetes Interno &nbsp;·&nbsp; ${new Date().getFullYear()}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── POST /enviar-notificacion ─────────────────────────────
app.post('/enviar-notificacion', async (req, res) => {
  const t = req.body;
  if (!t || !t.id) return res.status(400).json({ ok:false, error:'Datos incompletos.' });

  const esBk     = t.type === 'b';
  const cat      = t.cat || (esBk ? 'Desayuno' : 'Servicio');
  const destDept = CONFIG.destinos[cat] || [CONFIG.adminEmail];
  const toList   = [...new Set([...destDept, CONFIG.adminEmail])];

  // Incluir correo del huésped si existe
  if (t.email && t.email !== '—' && /^[^@]+@[^@]+\.[^@]+$/.test(t.email)) {
    toList.push(t.email);
  }

  const asunto = esBk
    ? `🍳 Tiquete de Desayuno ${t.id} — ${t.guest} · Hab. ${t.room}`
    : `🎫 Tiquete ${t.id} [${t.pri||'Media'}] — ${cat} · Hab. ${t.room}`;

  try {
    const info = await transporter.sendMail({
      from:    CONFIG.from,
      to:      toList.join(', '),
      subject: asunto,
      html:    esBk ? buildBreakfastHTML(t) : buildServiceHTML(t),
    });
    console.log(`✅ [${t.id}] → ${toList.join(', ')} | ${info.messageId}`);
    return res.json({ ok:true, messageId:info.messageId, to:toList });
  } catch(err) {
    console.error(`❌ [${t.id}] Error:`, err.message);
    return res.status(500).json({ ok:false, error:err.message });
  }
});

// ── GET /health ───────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ ok:true, servidor:'Hotel Las Brumas', smtp:CONFIG.smtp.host, hora:new Date().toISOString() });
});

// ── START ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n🏨  Hotel Las Brumas · Servidor de Notificaciones');
  console.log(`\n    👉 ABRIR EL SISTEMA AQUÍ: http://localhost:${PORT}/hotel_final.html`);
  console.log(`\n    SMTP: ${CONFIG.smtp.host}:${CONFIG.smtp.port}`);
  console.log('    Para detener: Ctrl + C\n');
});
