import { Stack, StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { UsersStack } from './users';

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const userTable = new Table(this, 'UserTable', {
      tableName: 'UserTable',
      partitionKey: {
        name: 'userId',
        type: AttributeType.STRING,
      },
    });
    const restApi = new RestApi(this, 'MonorepoSandboxApi', {
      restApiName: 'MonorepoSandboxApi',
      deployOptions: {
        stageName: 'v1',
        tracingEnabled: true,
      },
    });
    restApi.root.addMethod('ANY');
    new UsersStack(this, {
      userTableName: userTable.tableName,
      restApiId: restApi.restApiId,
      rootResourceId: restApi.restApiRootResourceId,
    });
  }
}
