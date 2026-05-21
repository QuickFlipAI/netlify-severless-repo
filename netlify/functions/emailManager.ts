import {
  Handler,
  HandlerEvent,
  HandlerContext,
  HandlerResponse,
} from '@netlify/functions';
import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_KEY_FRONTEND);

export interface EmailRequestBody {
  property: 'emails' | 'automations' | 'events' | 'templates' | 'contacts';
  method: 'list' | 'get' | 'receiving.list' ;
  //   left to implement: 
  // method refers to the following method for that property: e.g. Resend.emails.send(), resend.emails.list(), resend.emails.receiving.list() 
  // when the method includes a second property (just as emails.receiveng.list()), use a "." in the method. Result: "receiving.list"
  // IMPORTANT: all methods and properties must be exactly written as they are described in the Resend NodeJS client documentation
  parameters?: Record<string, any>;
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
    const body:EmailRequestBody = JSON.parse(event.body || '{}') || {};
    const { method, property, parameters } = body 

    // Validate required parameters
    if (!method || !property ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameter' }),
      };
    }

    let result
    if (method.includes('.')) {
        const methods = method.split('.')
        result = await resend[property][methods[0]][methods[1]]({...parameters})
    }
    else {
        result = await resend[property][method]({...parameters})
    }

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
        ...result.data
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