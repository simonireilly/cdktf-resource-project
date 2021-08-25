import { Construct } from 'constructs';
import { App, TerraformOutput, TerraformStack, Token } from 'cdktf';
import { AwsProvider } from '../.gen/providers/aws';
import { Function, Api } from './resources';

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);
    new AwsProvider(this, 'aws', {
      region: 'eu-west-1',
    });

    const fn = new Function(this, 'LAMBDA_FUNCTION', {
      path: 'src/lambda/main.ts',
      handler: 'main.handler',
      runtime: 'nodejs14.x',
    });

    Token;

    const fn2 = new Function(this, 'LAMBDA_FUNCTION_2', {
      path: 'src/lambda/main.ts',
      handler: 'main.handlerV2',
      runtime: 'nodejs14.x',
    });

    const api = new Api(this, 'HTTP_LAMBDA_API', {
      routes: {
        'GET /simple': fn,
        'GET /simple/new': fn2,
      },
    });

    new TerraformOutput(this, 'api_url', {
      value: api.api.apiEndpoint + '/simple',
    });
  }
}

const app = new App();
new MyStack(app, 'cdktf-stack');
app.synth();
