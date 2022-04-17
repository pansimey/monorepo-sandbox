import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';

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
    const showUserFunction = new NodejsFunction(this, 'ShowUserFunction', {
      entry: './handler/show-user.ts',
      bundling: {
        target: 'es2020',
        sourceMap: true,
      },
      environment: {
        NODE_ENV: 'production',
        USER_TABLE_NAME: userTable.tableName,
      },
    });
    userTable.grantReadData(showUserFunction);
  }
}
