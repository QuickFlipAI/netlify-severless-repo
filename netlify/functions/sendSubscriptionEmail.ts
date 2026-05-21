import {
  Handler,
  HandlerEvent,
  HandlerContext,
  HandlerResponse,
} from '@netlify/functions';
import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_KEY);

interface SubscriptionEmailRequest {
  email?: string;
  name?: string;
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext,
): Promise<HandlerResponse> => {
  try {

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      console.log('Handling preflight OPTIONS request');
      return {
        statusCode: 200, // Must be 200 for preflight to succeed
        headers: {
          'Access-Control-Allow-Origin': '*', // Replace 3000 with your actual port
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': '*',
        },
        body: 'Preflight check successful',
      };
    }

    // Get query parameters
    const queryParams = event.queryStringParameters || {};
    const { email, name } = queryParams as SubscriptionEmailRequest;

    // Validate required parameters
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required query parameter: email' }),
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email format' }),
      };
    }

    // Send subscription confirmation email
//     const result = await resend.emails.send({
//       from: 'Jared from Quickflip <jared@updates.quickflip.ai>',
//       to: email,
//       subject: 'Thank You for Your Subscription!',
//       html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
// <html dir="ltr" lang="en">
//   <head>
//     <meta content="width=device-width" name="viewport" />
//     <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
//     <meta name="x-apple-disable-message-reformatting" />
//     <meta content="IE=edge" http-equiv="X-UA-Compatible" />
//     <meta name="x-apple-disable-message-reformatting" />
//     <meta
//       content="telephone=no,address=no,email=no,date=no,url=no"
//       name="format-detection" />
//   </head>
//   <body style="background-color:#ffffff">
//     <!--$--><!--html--><!--head--><!--body-->
//     <table
//       border="0"
//       width="100%"
//       cellpadding="0"
//       cellspacing="0"
//       role="presentation"
//       align="center">
//       <tbody>
//         <tr>
//           <td
//             style="font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;font-size:1em;min-height:100%;line-height:155%;background-color:#ffffff">
//             <table
//               align="left"
//               width="100%"
//               border="0"
//               cellpadding="0"
//               cellspacing="0"
//               role="presentation"
//               style="max-width:600px;align:left;width:100%;color:#000000;background-color:#ffffff;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;border-radius:0px;border-color:#000000;line-height:155%">
//               <tbody>
//                 <tr style="width:100%">
//                   <td>
//                     <p
//                       style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
//                       Dear ${name ? name : 'Subscriber'},
//                     </p>
//                     <p
//                       style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
//                       I hope this message finds you well.
//                     </p>
//                     <p
//                       style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
//                       I would like to sincerely <strong>thank you</strong> for
//                       your recent subscription. We truly appreciate your trust
//                       in us and are delighted to have you on board.
//                     </p>
//                     <p
//                       style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
//                       I also wanted to take a moment to check in and ask if
//                       everything is working smoothly so far. If you have
//                       encountered any issues or have any questions, please do
//                       not hesitate to reach out—we are here to help.
//                     </p>
//                     <p
//                       style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
//                       Additionally, your feedback is incredibly valuable to us.
//                       If you have any thoughts or suggestions about your
//                       experience, we would be very grateful if you could share
//                       them.
//                     </p>
//                     <p
//                       style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
//                       <strong>Thank you once again for choosing us</strong>. We
//                       look forward to supporting you and ensuring you have the
//                       best possible experience.
//                     </p>
//                     <p
//                       style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
//                       Warm regards,<br />Jared from the Quickflip Team.
//                     </p>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </td>
//         </tr>
//       </tbody>
//     </table>
//     <!--/$-->
//   </body>
// </html>
//       `,
//     });

//     const result = await resend.emails.send({
//       from: 'Jared from Quickflip <jared@updates.quickflip.ai>',
//       to: email,
//       headers: {
//         'In-Reply-To': '4b8832ab-c30a-4e22-9ccb-f19dfeb54c91'
//       },
//       subject: 'Re: QuickFlip is live tomorrow — have you locked in your rate?',
//       html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
// <html dir="ltr" lang="en">
//   <head>
//     <meta content="width=device-width" name="viewport" />
//     <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
//     <meta name="x-apple-disable-message-reformatting" />
//     <meta content="IE=edge" http-equiv="X-UA-Compatible" />
//     <meta name="x-apple-disable-message-reformatting" />
//     <meta
//       content="telephone=no,address=no,email=no,date=no,url=no"
//       name="format-detection" />
//   </head>
//   <body style="background-color:#ffffff">
//     <!--$--><!--html--><!--head--><!--body-->
//     <table
//       border="0"
//       width="100%"
//       cellpadding="0"
//       cellspacing="0"
//       role="presentation"
//       align="center">
//       <tbody>
//         <tr>
//           <td
//             style="font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;font-size:1em;min-height:100%;line-height:155%;background-color:#ffffff">
//             <table
//               align="left"
//               width="100%"
//               border="0"
//               cellpadding="0"
//               cellspacing="0"
//               role="presentation"
//               style="max-width:600px;align:left;width:100%;color:#000000;background-color:#ffffff;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;border-radius:0px;border-color:#000000;line-height:155%">
//               <tbody>
//                 <tr style="width:100%">
//                   <td>
                    // <p
                    //   style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
                    //   Dear ${name ? name : 'Subscriber'},
                    // </p>
                    // <p
                    //   style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
                    //   I hope this message finds you well.
                    // </p>
//                                         <p
//                       style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
//                     Thanks for the heads up — appreciate you pointing that out.
//                     </p>
//                                         <p
//                       style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
// We’re actually already accepting sign-ups now. It sounds like you may have landed on the early access page, but the full sign-up flow is live, so you should be able to go back and complete your registration without any issues.
// If you still run into trouble accessing it, just let me know and I’ll make sure you get the direct link. Make sure to use the same email address you used to sign up for early access, and you should be able to lock in the Founder’s Rate.
//                     </p>
//                      <p
//                        style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
// Looking forward to having you on board — especially while the Founder’s Rate is still available.
//                      </p>
//                      <p
//                        style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
//                        Warm regards,<br />Jared from the Quickflip Team.
//                      </p>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </td>
//         </tr>
//       </tbody>
//     </table>
//     <!--/$-->
//   </body>
// </html>
//       `,
//     })

const result = await resend.emails.send({
      from: 'Jared from Quickflip <jared@updates.quickflip.ai>',
      to: email,
      headers: {
        'In-Reply-To': ''
      },
      subject: 'Re: QuickFlip is live tomorrow — have you locked in your rate?',
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="width=device-width" name="viewport" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta
      content="telephone=no,address=no,email=no,date=no,url=no"
      name="format-detection" />
  </head>
  <body style="background-color:#ffffff">
    <!--$--><!--html--><!--head--><!--body-->
    <table
      border="0"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      align="center">
      <tbody>
        <tr>
          <td
            style="font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;, &#x27;Helvetica Neue&#x27;, sans-serif;font-size:1em;min-height:100%;line-height:155%;background-color:#ffffff">
            <table
              align="left"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="max-width:600px;align:left;width:100%;color:#000000;background-color:#ffffff;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;border-radius:0px;border-color:#000000;line-height:155%">
              <tbody>
                <tr style="width:100%">
                  <td>
                  <p
                      style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
                      Dear ${name ? name : 'Subscriber'},
                    </p>
                    <p
                      style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
                      I hope this message finds you well.
                    </p>
                    <p
                      style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
                      Thanks for reaching out!
                    </p>
                    <p
                      style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
                      We’ve just officially launched, so you can now go ahead
                      and complete your sign-up. If you joined the waitlist a
                      few days ago, that would explain why you haven’t seen full
                      access yet.
                    </p>
                    <p
                      style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
                      To make sure you receive the Founder’s Rate discount,
                      please sign up using the same mail you used!
                    </p>
                    <p
                      style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
                      If you have any trouble along the way, feel free to reply
                      here and I’ll help you get set up.
                    </p>
                    <p
                      style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
                      Excited to have you on board!
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    <!--/$-->
  </body>
</html>
      `,
    })




    if (result.error) {
      console.error('Resend error:', result.error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send email', details: result.error }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Replace 3000 with your actual port
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Subscription email sent successfully',
        emailId: result.data?.id,
      }),
    };
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};