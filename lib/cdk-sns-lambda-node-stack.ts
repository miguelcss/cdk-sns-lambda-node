import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SimpleEvents } from './simple-events';
import { SimpleLambda } from './simple-lambda';

export class CdkSnsLambdaNodeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const simpleEvents = new SimpleEvents(this, 'SimpleEvents', {
      stage: 'Dev',
      region: 'EU',
    });

  }
}
