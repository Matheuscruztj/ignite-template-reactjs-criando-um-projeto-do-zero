import * as prismic from '@prismicio/client';
import { HttpRequestLike } from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';
import { env } from '../../env';

const PRISMIC_END_PONT = env.PRISMIC_END_PONT;
const ACCESS_TOKEN = encodeURIComponent(env.PRISMIC_ACCESS_TOKEN);

export interface PrismicConfig {
  req?: HttpRequestLike;
}

export function getPrismicClient(config?: PrismicConfig): prismic.Client {
  const client = prismic.createClient(PRISMIC_END_PONT, { accessToken: ACCESS_TOKEN });
  
  enableAutoPreviews({
    client,
    req: config?.req,

  })

  return client;
}
