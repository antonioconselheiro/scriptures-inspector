import { KeyInterlinear } from '@domain/key-interlinear-type';

export function isKeyInterlinearFn(key: string): key is KeyInterlinear {
  return /-interlinear$/.test(key);
}
