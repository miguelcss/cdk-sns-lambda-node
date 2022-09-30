import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { CfnResource, Duration } from 'aws-cdk-lib';

export interface SimpleEventsProps {
  readonly stage: string;
  readonly region: string;
}

export class SimpleEvents extends Construct {
  readonly simpleEventsQueue: sqs.IQueue;

  constructor(scope: Construct, id: string, props: SimpleEventsProps) {
    super(scope, id);

    // Create SNS topic
    const simpleEventsTopic = new sns.Topic(this, 'SimpleEventsTopic', {
      topicName: `${props.stage}-${props.region}-SimpleEventsTopic`,
    });

    // Create DLQ for unprocessed messages
    const simpleEventsDql = new sqs.Queue(this, 'SimpleEventsQueue-DQL', {
      queueName: `${props.stage}-${props.region}-SimpleEventsQueue-DQL`,
      retentionPeriod: Duration.days(14),
    });

    // Pending fix - https://github.com/aws/aws-cdk/issues/22137
    const cfnDLQueue = simpleEventsDql.node.defaultChild as CfnResource;
    cfnDLQueue.addOverride('Properties.SqsManagedSseEnabled', false)

    // Create SQS queue
    this.simpleEventsQueue = new sqs.Queue(this, "SimpleEventsQueue", {
      queueName: `${props.stage}-${props.region}-SimpleEventsQueue`,
      deadLetterQueue: {
        maxReceiveCount: 3,
        queue: simpleEventsDql,
      },
    });

    // Pending fix - https://github.com/aws/aws-cdk/issues/22137
    const cfnQueue = this.simpleEventsQueue.node.defaultChild as CfnResource;
    cfnQueue.addOverride('Properties.SqsManagedSseEnabled', false)

    // Add subscription - subscribe teh sqs queue to the sns topic
    const simpleSubscription = new subscriptions.SqsSubscription(this.simpleEventsQueue, {
      rawMessageDelivery: true,
    })
    simpleEventsTopic.addSubscription(simpleSubscription);

    // Alternative way to define subscription
    // new sns.Subscription(this, 'SimpleSubscription', {
    //   topic: simpleEventsTopic,
    //   endpoint: this.simpleEventsQueue.queueArn,
    //   protocol: sns.SubscriptionProtocol.SQS,
    //   deadLetterQueue: simpleEventsDql,
    // });

  }
}
