import type { RawEnv } from '../env.validation';
import { normalizeRequiredString } from '../env.utils';

export function validateAuthConfig(config: RawEnv) {
  const jwtAccessSecret = normalizeRequiredString(config.JWT_ACCESS_SECRET);

  if (!jwtAccessSecret) {
    throw new Error('Environment variable JWT_ACCESS_SECRET is required');
  }

  return {
    // JWT
    JWT_ACCESS_SECRET: jwtAccessSecret,
  };
}
