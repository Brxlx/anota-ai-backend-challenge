import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';

import { Either, left, right } from '@/core/types/either';
import { CoreEnv } from '@/domain/application/shared/env/env';
import { Storage } from '@/domain/application/shared/gateways/storage.gateway';

import { Env } from '../../env/env.schema';

@Injectable()
export class AwsS3StorageService implements Storage {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly logger: Logger;

  constructor(private readonly envService: CoreEnv<Env>) {
    this.logger = new Logger(AwsS3StorageService.name);

    this.s3 = new S3Client({
      region: this.envService.get('DATABASE_URL'),
      endpoint: this.envService.get('DATABASE_URL'),
      credentials: {
        accessKeyId: 'fake-access-key',
        secretAccessKey: 'fake-secret-key',
      },
    });
    this.bucket = this.envService.get('AWS_S3_BUCKET');
  }

  async save(topic: string, message: string): Promise<Either<Error, string>> {
    try {
      const ensured = await this.ensureBucketExists();
      if (!ensured) {
        return left(new Error('Bucket not found and could not be created'));
      }
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: topic,
        Body: message,
      });
      await this.s3.send(command);
      this.logger.debug(`Message sent to bucket: ${message}`);
      return right(topic);
    } catch (error) {
      return left(error as Error);
    }
  }

  /**
   * Garante que o bucket existe, criando-o se necessário.
   */
  private async ensureBucketExists(): Promise<boolean> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return true;
    } catch {
      // Se não existir, tenta criar
      try {
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
        return true;
      } catch {
        return false;
      }
    }
  }

  async get(topic: string): Promise<Either<Error, string>> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: topic,
      });
      const response = await this.s3.send(command);
      if (!response.Body) return left(new Error('No data found'));
      // AWS SDK v3: Body pode ser ReadableStream (browser) ou Readable (Node.js)
      let body: string;
      const stream = response.Body;
      // Checagem segura para ReadableStream (browser)
      if (
        typeof stream === 'object' &&
        stream !== null &&
        'getReader' in stream &&
        typeof (stream as ReadableStream<Uint8Array>).getReader === 'function'
      ) {
        // Browser ReadableStream
        body = await this.readableStreamToString(stream as ReadableStream<Uint8Array>);
      } else {
        // Node.js Readable
        body = await this.streamToString(stream as NodeJS.ReadableStream);
      }
      return right(body);
    } catch (error) {
      return left(error as Error);
    }
  }

  private async streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf-8');
  }

  private async readableStreamToString(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader();
    let result = '';
    let done = false;
    while (!done) {
      const { done: d, value } = await reader.read();
      done = d;
      if (value) {
        result += new TextDecoder().decode(value);
      }
    }
    return result;
  }
}
