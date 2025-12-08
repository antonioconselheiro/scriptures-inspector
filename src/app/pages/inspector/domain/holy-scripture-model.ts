import { NewTestmentScriptures } from './new-testment-scriptures-model';
import { OldTestmentScriptures } from './old-testment-scriptures-model';

export type HolyScriptureModel<Data extends object = {}> = OldTestmentScriptures<Data> & NewTestmentScriptures<Data>;