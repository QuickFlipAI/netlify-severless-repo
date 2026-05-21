import {
  Handler,
  HandlerEvent,
  HandlerContext,
  HandlerResponse,
} from '@netlify/functions';
import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_KEY_FRONTEND);

interface SubscriptionEmailRequest {
  email?: string,
  event?: string,
  payload?: Record<string, any>
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
    const body = JSON.parse(event.body || '{}') || {};
    const { email, event: eventName, payload } = body as SubscriptionEmailRequest;

    // Validate required parameters
    if (!email || !eventName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameter email, eventName' }),
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

    const result = await resend.events.send({
      event: eventName,
      email,
      payload
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