import {
  Handler,
  HandlerEvent,
  HandlerContext,
  HandlerResponse,
} from '@netlify/functions';
import { Resend } from 'resend';
import 'dotenv/config';
import supabase from '../supabase';

interface SubscriptionEmailRequest {
  email?: string
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext,
): Promise<HandlerResponse> => {
  try {
    const result = await supabase.auth.admin.listUsers({perPage: 120})

    if (result.error) {
      console.error('Supabase users error:', result.error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to get users', details: result.error }),
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
        data: result.data
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