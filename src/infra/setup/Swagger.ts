import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { cleanupOpenApiDoc } from 'nestjs-zod';

import { version } from '@/../package.json';

export class Swagger {
  public static run(app: INestApplication) {
    const config = new DocumentBuilder()
      .setTitle('Anota Aí API')
      .setDescription('The Anota Aí challenge')
      .setVersion(version)
      .build();
    const rawDocument = SwaggerModule.createDocument(app, config);
    const document = cleanupOpenApiDoc(rawDocument);

    // SwaggerModule.setup('old-docs', app, document);

    app.use(
      '/docs',
      apiReference({
        content: document,
        theme: 'laserwave',
        title: 'Anota Aí API Reference',
        servers: [
          {
            url: 'http://localhost:9300',
            description: 'Servidor Local (Desenvolvimento)',
          },
          {
            url: 'https://mocked-web-site.com/docs',
            description: 'Servidor de Homologação',
          },
        ],
        darkMode: true,
        forceDarkModeState: 'dark',
        defaultHttpClient: { targetKey: 'shell', clientKey: 'shell' },
        expandAllModelSections: true,
        expandAllResponses: true,
        documentDownloadType: 'json',
      }),
    );
  }
}
