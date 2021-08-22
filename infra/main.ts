import { Construct } from 'constructs';
import { App, TerraformStack } from 'cdktf';
import { Apigatewayv2Api, AwsProvider } from '../.gen/providers/aws';
import { Function } from './lambda/function';

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // define resources here
    new AwsProvider(this, 'aws', {
      region: 'eu-west-1',
    });

    new Function(this, 'LAMBDA_FUNCTION', {
      path: 'src/lambda/main.ts',
      handler: 'main.handler',
      runtime: 'nodejs14.x',
    });

    new Apigatewayv2Api(this, 'HTTP_API', {
      name: 'cdktf-http-api',
      protocolType: 'HTTP',
      description: `Example HTTP API generated with terraform cdktf`,
    });
  }
}

const app = new App();
new MyStack(app, 'cdktf-stack');
app.synth();
