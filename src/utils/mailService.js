import nodemailer from 'nodemailer';

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendResetPasswordEmail(email, resetUrl, userName) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de Contraseña',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .warning {
              color: #d32f2f;
              font-size: 14px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>Recuperación de Contraseña</h2>
              <p>Hola ${userName},</p>
              <p>Recibimos una solicitud para restablecer tu contraseña. Si no hiciste esta solicitud, ignora este correo.</p>
              <p>Para restablecer tu contraseña, haz clic en el siguiente botón:</p>
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              <p>O copia y pega este enlace en tu navegador:</p>
              <p>${resetUrl}</p>
              <p class="warning">⚠️ Este enlace expirará en 1 hora por seguridad.</p>
              <p>Si tienes problemas, contacta con soporte.</p>
              <br>
              <p>Saludos,<br>El equipo de soporte</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'Email enviado correctamente' };
    } catch (error) {
      console.error('Error al enviar email:', error);
      throw new Error(`Error al enviar email: ${error.message}`);
    }
  }

  async sendPurchaseConfirmation(email, ticket) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Confirmación de Compra - ${ticket.code}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
            }
            .ticket-code {
              background-color: #4CAF50;
              color: white;
              padding: 10px;
              text-align: center;
              border-radius: 5px;
              margin: 20px 0;
              font-size: 20px;
              font-weight: bold;
            }
            .product-list {
              border-top: 2px solid #eee;
              margin-top: 20px;
              padding-top: 20px;
            }
            .product-item {
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .total {
              font-size: 24px;
              font-weight: bold;
              color: #4CAF50;
              text-align: right;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>✅ ¡Compra Confirmada!</h2>
              <p>Gracias por tu compra. Tu pedido ha sido procesado exitosamente.</p>
              <div class="ticket-code">
                Código de Ticket: ${ticket.code}
              </div>
              <p><strong>Fecha:</strong> ${new Date(ticket.purchase_datetime).toLocaleString('es-AR')}</p>
              
              <div class="product-list">
                <h3>Productos Comprados:</h3>
                ${ticket.products.map(item => `
                  <div class="product-item">
                    <strong>${item.title}</strong><br>
                    Cantidad: ${item.quantity} x $${item.price.toFixed(2)} = $${item.subtotal.toFixed(2)}
                  </div>
                `).join('')}
              </div>
              
              <div class="total">
                Total: $${ticket.amount.toFixed(2)}
              </div>
              
              <p>Guarda este correo como comprobante de tu compra.</p>
              <br>
              <p>Saludos,<br>El equipo de ventas</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'Email de confirmación enviado' };
    } catch (error) {
      console.error('Error al enviar email de confirmación:', error);
      throw new Error(`Error al enviar email de confirmación: ${error.message}`);
    }
  }
}

export default new MailService();
