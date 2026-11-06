import { Language } from '@domain/language-model';
import { LanguageUnionType } from '@domain/language-union-type';
import { NormalizationType } from '@domain/normalization-type';
import { Project } from '@domain/project-model';
import { demassoretifierFn } from './demassoretifier-fn';
import { languageMetadataRecord } from './language-metadata-record';
import { massoretifierFn } from './massoretifier-fn';

const normalizationTransformations: Record<NormalizationType, {
  normalize: (text: string) => string;
  prefetchMatcher: (pattern: string) => string;
}> = {
  demassoretify: {
    normalize: demassoretifierFn,
    prefetchMatcher: massoretifierFn
  }
};

export function getProjectLanguageFn(project: Project, language: LanguageUnionType): Language {
  const transformations = (project.normalization?.[language] || []).map(name => {
    const transformation = normalizationTransformations[name];
    if (!transformation) {
      throw new Error(`Unsupported ${language} normalization: ${name}`);
    }

    return transformation;
  });

  const metadata = languageMetadataRecord[language];
  if (!transformations.length) {
    return metadata;
  }

  return {
    ...metadata,
    normalizeFn: text => transformations.reduce(
      (normalized, transformation) => transformation.normalize(normalized),
      text
    ),
    prefetchMatcherFn: pattern => transformations.reduce(
      (matched, transformation) => transformation.prefetchMatcher(matched),
      pattern
    )
  };
}
