import { Handler, HandlerContext, HandlerEvent, HandlerResponse } from "@netlify/functions";
import supabase from '../supabase';

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

    const body = JSON.parse(event.body || '{}');
    
    // Extract required fields
    const { name, email, code, paypal_email, username, platform, profile_link, contact_method } = body;

    // Validate required fields
    if (!name || !email || !code) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': '*',
        },
        body: JSON.stringify({ 
          error: 'Missing required fields', 
          required: ['name', 'email', 'code'] 
        }),
      };
    }

    // Insert into creators table
    const { data, error } = await supabase
      .from('creators')
      .insert([
        {
          name,
          email,
          code,
          paypal_email: paypal_email || null,
          username: username || null,
          platform: platform || null,
          profile_link: profile_link || null,
          contact_method: contact_method || null
        }
      ])
      .select();

    if (error) {
      console.log('Database error:', error);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': '*',
        },
        body: JSON.stringify({ 
          error: 'Failed to create creator', 
          details: error.message 
        }),
      };
    }

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Creator created successfully',
        creator: data[0],
      }),
    };
  } catch (error) {
    console.log('Error in handler:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal Server Error', 
        message: error instanceof Error ? error.message : String(error)
      }),
    };
  }
};
