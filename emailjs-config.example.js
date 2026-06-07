// Copy to emailjs-config.js and fill the values
// Sign up at https://www.emailjs.com/ and create a service + template

const EMAILJS_SERVICE_ID = 'your_service_id';
const EMAILJS_TEMPLATE_ID = 'your_template_id';
const EMAILJS_USER_ID = 'your_user_id_public';

if (typeof window !== 'undefined' && window.emailjs) {
  window.emailjs.init(EMAILJS_USER_ID);
  window.emailConfig = {
    service: EMAILJS_SERVICE_ID,
    template: EMAILJS_TEMPLATE_ID,
  };
} else {
  console.warn('EmailJS SDK not found. Include CDN and configure emailjs-config.js');
}
