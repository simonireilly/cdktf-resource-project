// Create a http integration with lambda when passed
//
//

import { Resource } from 'cdktf';
import { Construct } from 'constructs';
import {
  Apigatewayv2Api,
  Apigatewayv2Integration,
  Apigatewayv2Route,
  Apigatewayv2Stage,
  LambdaPermission,
} from '../../.gen/providers/aws';
import type { Function } from './function';

interface ApiConfig {
  routes: {
    [key: string]: Function;
  };
}

export class Api extends Resource {
  readonly api: Apigatewayv2Api;

  constructor(scope: Construct, name: string, options: ApiConfig) {
    super(scope, name);

    this.api = this.createApi();

    Object.entries(options.routes).map(([routeKey, fn]) => {
      this.addLambdaIntegration(routeKey, fn);
    });
  }

  private createApi() {
    const api = new Apigatewayv2Api(this, 'HTTP_API', {
      name: 'cdktf-http-api',
      protocolType: 'HTTP',
      description: `Example HTTP API generated with terraform cdktf`,
    });

    new Apigatewayv2Stage(this, 'HTTP_API_STAGE', {
      apiId: api.id,
      name: '$default',
      autoDeploy: true,
    });

    return api;
  }

  private childResourceName(routeKey: string): string {
    return routeKey;
  }

  private addLambdaIntegration(routeKey: string, fn: Function) {
    const fnIntegration = new Apigatewayv2Integration(
      this,
      `HTTP_LAMBDA_INTEGRATION_${this.childResourceName(routeKey)}`,
      {
        apiId: this.api.id,
        integrationType: 'AWS_PROXY',
        integrationMethod: 'POST',
        integrationUri: fn.function.invokeArn,
      }
    );

    new Apigatewayv2Route(
      this,
      `HTTP_ROUTE_${this.childResourceName(routeKey)}`,
      {
        apiId: this.api.id,
        target: `integrations/${fnIntegration.id}`,
        routeKey,
      }
    );

    new LambdaPermission(
      this,
      `HTTP_LAMBDA_PERMISSIONS_${this.childResourceName(routeKey)}`,
      {
        action: 'lambda:InvokeFunction',
        functionName: fn.function.arn,
        principal: 'apigateway.amazonaws.com',
      }
    );
  }
}
