import { Handler, HandlerContext, HandlerEvent, HandlerResponse } from "@netlify/functions";

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext,
): Promise<HandlerResponse> => {
  try {

    const accessToken = await getEbayAccessToken();

    const urlDefault = (process.env.NODE_ENV === 'production' ? 'https://api.sandbox.ebay.com' : 'https://api.sandbox.ebay.com') + '/commerce/taxonomy/v1/get_default_category_tree_id?marketplace_id=EBAY_US'
    const mainTreeResponse = await fetch(urlDefault, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })

    if (!mainTreeResponse.ok) {
      const err = await mainTreeResponse.text();
      throw new Error(`Failed to fetch main category tree ID: ${err}`);
    }
    const mainTreeIdData = await mainTreeResponse.json();

    const mainTreeId = mainTreeIdData.categoryTreeId;

    const { q } = event.queryStringParameters || {};
    const formatItemName = q?.replace(/ /g, '+') ?? '';
    if (!q || q.trim() === '') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing query parameter q' }),
      };
    }

    const urlCategory = (process.env.NODE_ENV === 'production' ? 'https://api.sandbox.ebay.com' : 'https://api.sandbox.ebay.com') + `/commerce/taxonomy/v1/category_tree/${mainTreeId}/get_category_suggestions?q=${formatItemName}&limit=5`
    const categoriesResponse = await fetch(urlCategory, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    if (!categoriesResponse.ok) {
      const err = await categoriesResponse.text();
      throw new Error(`Failed to fetch category suggestions: ${err}`);
    }

    const categoriesData = await categoriesResponse.json();

    console.log(categoriesData);

    if (!categoriesData?.categorySuggestions.length) {
        throw new Error('No categories returned from API');
    }
    
    //   // get best category using AI
    // if (categoriesData.categorySuggestions.length > 1) {
    //   console.log('Multiple category suggestions found:', categoriesData.categorySuggestions);
    // }

    // For now, we take the top suggestion.
    const category = categoriesData.categorySuggestions[0].category;

    console.log(category);

    const url = (process.env.NODE_ENV === 'production' ? 'https://api.sandbox.ebay.com' : 'https://api.sandbox.ebay.com') + `/commerce/taxonomy/v1/category_tree/${mainTreeId}/get_item_aspects_for_category?category_id=${category?.categoryId ?? ''}`;

    const categoriesAspectsResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    const categoriesAspectsData = await categoriesAspectsResponse.json();


    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Replace 3000 with your actual port
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
      },
      body: JSON.stringify({
        ...categoriesData.categorySuggestions[0],
        ...categoriesAspectsData
        // { categorySuggestions,
        // categoryTreeId,
        // categoryTreeVersion }
      }),
    };
  } catch (error) {
    console.log('Error in handler:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*', // Replace 3000 with your actual port
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
      },
      body: JSON.stringify({ error: 'Internal Server Error', message: error }),
    };
  }
};


// --- eBay OAuth: fetch a client-credentials token ---
async function getEbayAccessToken(): Promise<string> {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('eBay API credentials not configured');
  }

  return "v^1.1#i^1#p^3#I^3#r^0#f^0#t^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";

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const URL = process.env.NODE_ENV === 'production' ? 'https://api.ebay.com/identity/v1/oauth2/token' : 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'

  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: `grant_type=authorization_code&scope=${encodeURIComponent('https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly')}`,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to get eBay access token: ${err}`);
  }

  const data = await response.json();
  return data.access_token;
}