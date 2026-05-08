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
    const { email, verificationCode, name } = body;
    const password = Math.random().toString(36).slice(2, 15);

    if (!email || !verificationCode || !name) {
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

    // // Verify code (this would typically check against a stored code)
    // if (verificationCode !== '') {
    //   return {
    //     statusCode: 400,
    //     body: JSON.stringify({ error: 'Invalid verification code' })
    //   };
    // }

    // Create user in Supabase
      const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
              first_name: name.split(' ')[0],
              last_name: [...name.split(' ').filter((_, i) => i !== 0)].join(' '),
              refered: false,
              refered_id: null,
              is_creator: true
          }
      });

    if (error) {
      console.error('Supabase error:', error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to create user',
          details: error.message
        })
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
        user: data?.[0],
        link: link.properties?.action_link,
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