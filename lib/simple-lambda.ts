import * as lambda from "aws-cdk-lib/aws-lambda";
import * as eventSource from "aws-cdk-lib/aws-lambda-event-sources";
import * as path from 'path';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';

export interface SimpleLambdaProps {
  readonly stage: string;
  readonly region: string;
  readonly simpleQueue: sqs.IQueue;
}

export class SimpleLambda extends Construct {
  constructor(scope: Construct, id: string, props: SimpleLambdaProps) {
    super(scope, id);

    // Lambda function to process message
    const simpleNodeLambda = new lambda.Function(this, 'SimpleNodeFunction', {
      functionName: `${props.stage}-${props.region}-SimpleNodeFunction`,
      runtime: lambda.Runtime.NODEJS_16_X,
      memorySize: 128,
      timeout: Duration.seconds(10),
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda-function')),
    });

    // Add lambda trigger, the sqs event source
    simpleNodeLambda.addEventSource(new eventSource.SqsEventSource(props.simpleQueue));
  }
}
