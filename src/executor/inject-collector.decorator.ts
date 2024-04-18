import { Inject } from '@nestjs/common';

export const InjectDocumentCollector = (name: string) =>
  Inject(`${name}DocumentCollector`);
