import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'

export const handler: APIGatewayProxyHandlerV2 = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({message: 'success'}),
    headers: {
      'Content-Type': 'application/json'
    }
  }
}
