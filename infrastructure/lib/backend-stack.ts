import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    new NodejsFunction(this, 'ShowUserFunction', {
      entry: './handler/show-user.ts',
      bundling: {
        target: 'es2020',
        sourceMap: true,
      },
    });
  }
}
