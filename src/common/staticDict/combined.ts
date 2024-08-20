// eslint-disable-next-line import/namespace
import * as generatedDict from './generated';
import * as baseDict from './index';

export default {
  ...baseDict,
  ...generatedDict,
};
