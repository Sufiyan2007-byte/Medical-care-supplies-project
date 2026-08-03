export const generateContactNotificationEmail = (name, email, message) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #0056b3;">New Contact Form Submission</h2>
      <p>You have received a new message from the MedPortal contact form.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 120px;">Name:</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Email:</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            <a href="mailto:${email}" style="color: #0056b3;">${email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; vertical-align: top;">Message:</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; white-space: pre-wrap;">${message}</td>
        </tr>
      </table>
      
      <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
        This email was sent automatically from your website's contact form.
      </p>
    </div>
  `;
};
