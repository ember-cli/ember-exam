import { QUnitStartOptions } from 'ember-qunit';

export type EmberExamStartOptions = Omit<QUnitStartOptions, 'loadTests'> & {
  availableModules: Record<string, unknown>;
};

export function start(options: EmberExamStartOptions): Promise<void>;
