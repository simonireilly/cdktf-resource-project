import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export const handler: APIGatewayProxyHandlerV2 = async () => {
  console.info('Comment for new hash');

  return {
    statusCode: 200,
    body: JSON.stringify({
      version: '1.0.0',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

export const handlerV2: APIGatewayProxyHandlerV2 = async () => {
  console.info('This is the v2 handler calling');

  return {
    statusCode: 200,
    body: JSON.stringify({
      version: '2.0.0',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};
