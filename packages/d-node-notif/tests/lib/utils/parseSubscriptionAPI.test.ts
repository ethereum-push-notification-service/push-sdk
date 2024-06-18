import { parseSubscriptionsApiResponse } from '../../../src/lib/utils/pasreSubscriptionAPI';
import { expect } from 'chai';

const testData = [
  {
    channel: '0xD8634C39BBFd4033c0d3289C4515275102423681',
    user_settings:
      '[{"type": 1, "user": true, "index": 1, "default": true, "description": "test1"}, {"type": 2, "user": 10, "index": 2, "ticker": 1, "default": 10, "enabled": true, "lowerLimit": 1, "upperLimit": 100, "description": "test2"}, {"type": 3, "user": {"lower": 10, "upper": 50}, "index": 3, "ticker": 2, "default": {"lower": 10, "upper": 50}, "enabled": true, "lowerLimit": 1, "upperLimit": 100, "description": "test3"}, {"type": 3, "user": {"lower": 3, "upper": 5}, "index": 4, "ticker": 2, "default": {"lower": 3, "upper": 5}, "enabled": false, "lowerLimit": 1, "upperLimit": 100, "description": "test4"}]',
  },
  {
    channel: '0x74415Bc4C4Bf4Baecc2DD372426F0a1D016Fa924',
    user_settings: null,
  },
  {
    channel: '0xC8c243a4fd7F34c49901fe441958953402b7C024',
    user_settings:
      '[{"type": 1, "user": false, "index": 1, "default": true, "description": "test1"}, {"type": 2, "user": 15, "index": 2, "ticker": 1, "default": 10, "enabled": true, "lowerLimit": 1, "upperLimit": 100, "description": "test2"}, {"type": 3, "user": {"lower": 5, "upper": 10}, "index": 3, "ticker": 2, "default": {"lower": 10, "upper": 50}, "enabled": true, "lowerLimit": 1, "upperLimit": 100, "description": "test3"}, {"type": 3, "user": {"lower": 5, "upper": 10}, "index": 4, "ticker": 2, "default": {"lower": 3, "upper": 5}, "enabled": true, "lowerLimit": 1, "upperLimit": 100, "description": "test4"}]',
  },
];
describe('Test parseSubscriptionsApiResponse', () => {
  it('Should succesfully parse the subscriptions', () => {
    const res = parseSubscriptionsApiResponse(testData);
    console.log(JSON.stringify(res))
  });
});
