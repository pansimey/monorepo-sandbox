import { Stack, StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const FunctionName = {
      SHOW_USER: 'ShowUserFunction',
    } as const;
    const TableName = {
      USER: 'UserTable',
    } as const;
    const showUserFunction = new NodejsFunction(this, FunctionName.SHOW_USER, {
      functionName: FunctionName.SHOW_USER,
      entry: 'handler/show-user.ts',
      bundling: {
        target: 'es2021',
        sourceMap: true,
      },
      runtime: Runtime.NODEJS_16_X,
      environment: {
        NODE_ENV: 'production',
        USER_TABLE_NAME: TableName.USER,
      },
      tracing: Tracing.ACTIVE,
    });
    const userTable = new Table(this, TableName.USER, {
      tableName: TableName.USER,
      partitionKey: {
        name: 'userId',
        type: AttributeType.STRING,
      },
    });
    userTable.grantReadData(showUserFunction);
  }
}
