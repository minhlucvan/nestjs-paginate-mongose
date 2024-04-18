import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  console.log('bootstrapping');

  console.log('setting up mongo memory server');
  
  // This will create an new instance of "MongoMemoryServer" and automatically start it
  const mongod = await MongoMemoryServer.create();

  // This is the connection string to connect to the database
  const uri = mongod.getUri();

  console.log('mongo uri', uri);

  // Injest the connection string into the AppModule
  process.env.MONGO_URI = uri;

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
