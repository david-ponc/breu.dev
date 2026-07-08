import 'reflect-metadata';

import { ContainerBuilder } from 'diod';

const builder = new ContainerBuilder();

export const container = builder.build();
