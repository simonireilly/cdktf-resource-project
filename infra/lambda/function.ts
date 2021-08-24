// Need to bundle lambda code, ready for terraform to upload
//
// Copy the serverless-stack function

import { AssetType, Resource, TerraformAsset } from 'cdktf';
import { Construct, ConstructOptions } from 'constructs';
import { buildSync } from 'esbuild';
import * as path from 'path';
import { IamRole, LambdaFunction } from '../../.gen/providers/aws';

interface LambdaFunctionConfig extends ConstructOptions {
  path: string;
  handler: string;
  runtime: string;
}

export class Function extends Resource {
  readonly asset: TerraformAsset;
  readonly function: LambdaFunction;
  readonly functionRole: IamRole;

  constructor(scope: Construct, name: string, options: LambdaFunctionConfig) {
    super(scope, name);

    const { dir } = path.parse(options.path);
    const sourcePath = path.resolve(process.cwd(), options.path);
    const outPath = path.resolve(process.cwd(), '.build', dir);

    const build = buildSync({
      entryPoints: [sourcePath],
      entryNames: '[hash]/[name]',
      sourcemap: true,
      platform: 'node',
      target: ['node14'],
      format: 'cjs',
      metafile: true,
      outdir: outPath,
    });

    const outputPaths = build.metafile?.outputs
      ? Object.keys(build.metafile?.outputs)[0]
      : '';

    const assetDir = path.dirname(outputPaths);
    const hash = path.basename(assetDir);
    const assetPath = path.resolve(assetDir);

    console.debug('Build outputs from esbuild', {
      hash,
      assetPath,
      assetDir,
    });

    // Copy code to archive
    this.asset = new TerraformAsset(this, 'lambda-asset', {
      path: assetPath,
      type: AssetType.ARCHIVE,
    });

    // Create lambda role
    this.functionRole = new IamRole(this, 'lambda-iam-role', {
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Principal: {
              Service: 'lambda.amazonaws.com',
            },
            Effect: 'Allow',
            Sid: '',
          },
        ],
      }),
    });

    this.function = new LambdaFunction(this, 'lambda-function', {
      filename: this.asset.path,
      functionName: 'cdktf-lambda-function',
      role: this.functionRole.arn,
      runtime: options.runtime,
      handler: options.handler,
      sourceCodeHash: this.asset.assetHash,
    });
  }
}
