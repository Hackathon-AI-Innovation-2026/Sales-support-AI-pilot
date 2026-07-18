import {
  validateAppConfig,
  validateAuthConfig,
  validateDatabaseConfig,
  validateMailConfig,
  validateMinioConfig,
} from './topics';

export type RawEnv = Record<string, unknown>;

export function validateEnv(config: RawEnv) {
  return {
    ...config,
    ...validateAppConfig(config),
    ...validateAuthConfig(config),
    ...validateDatabaseConfig(config),
    ...validateMailConfig(config),
    ...validateMinioConfig(config),
  };
}
