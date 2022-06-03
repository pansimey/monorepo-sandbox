import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import type { Construct } from 'constructs';

interface UsersStackProps extends NestedStackProps {
  readonly userTableName: string;
  readonly restApiId: string;
  readonly rootResourceId: string;
}

export class UsersStack extends NestedStack {
  constructor(scope: Construct, props: UsersStackProps) {
    super(scope, 'UsersStack', props);
    const { userTableName, restApiId, rootResourceId } = props;
    const userTable = Table.fromTableName(this, 'UserTable', userTableName);
    const restApi = RestApi.fromRestApiAttributes(this, 'RestApi', {
      restApiId,
      rootResourceId,
    });
    const resource = restApi.root.addResource('users');
    const showUserFunction = new NodejsFunction(this, 'ShowUserFunction', {
      functionName: 'ShowUserFunction',
      entry: 'handler/show-user.ts',
      bundling: {
        target: 'es2021',
        sourceMap: true,
      },
      runtime: Runtime.NODEJS_16_X,
      environment: {
        NODE_ENV: 'production',
        USER_TABLE_NAME: userTableName,
      },
      tracing: Tracing.ACTIVE,
    });
    userTable.grantReadData(showUserFunction);
    resource.addMethod('GET', new LambdaIntegration(showUserFunction));
  }
}
