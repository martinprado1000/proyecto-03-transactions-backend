import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('bootstrap')

  app.setGlobalPrefix('api')
  
  //app.enableCors();
  app.enableCors({
    //origin: ['http://localhost:5173','http://localhost:5174'],
    //methods: 'GET,PUT,PATCH,POST,DELETE', //HEAD
    credentials: true, // Permite las cookies
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist:true, // Elimina cualquier propiedad extra que venga en el request y que no esté definida en tu DTO.
    //forbidNonWhitelisted: true, // En lugar de ignorar las propiedades extra, directamente lanza un error 400 (Bad Request)
    transform:true, // Convierte los datos recibidos a una instancia de la clase DTO. Esto permite que los decoradores de validación (@IsInt(), @IsString(), etc.) modifiquen el tipo.
    transformOptions:{  
      enableImplicitConversion: true, // Si recibo ?limit=10 (strings), Nest automáticamente los transforma en números aunque no hayas puesto @Type(() => Number)
    }
  })); 

  const config = new DocumentBuilder()
    .setTitle('Transactions RESTFul API')
    .setDescription('Transactions endpoints')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);  
  SwaggerModule.setup('api', app, documentFactory);

  const configService = app.get(ConfigService)
 
  const PORT = configService.get<number>('port')
  
  await app.listen(Number(PORT));
  
  logger.log(`App runing on port ${PORT}`)

}
bootstrap();
