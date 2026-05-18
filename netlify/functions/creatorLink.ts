import { Handler, HandlerContext, HandlerEvent, HandlerResponse } from '@netlify/functions';
import supabase from '../supabase';

// Handle preflight OPTIONS requests
export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext,
): Promise<HandlerResponse> => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      console.log('Handling preflight OPTIONS request');
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': '*',
        },
        body: 'Preflight check successful',
      };
    }

    const body = JSON.parse(event.body || '{}');

    // Validate required fields
    const { email } = body;

    if (!email) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': '*',
        },
        body: JSON.stringify({
          error: 'Missing required fields',
          required: ['email', 'name', 'verificationCode']
        }),
      };
    }
    
    const { data: link } = await supabase.auth.admin.generateLink({
      type: 'magiclink', email, options: {
        redirectTo: process.env.APP_BASE_URL + '/auth/creator'
      }
    })

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Account created successfully',
        link: link.properties?.action_link
      })
    };
  } catch (error) {
    console.error('Handler error:', error.message);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  };
};