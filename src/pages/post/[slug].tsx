import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Banner from '../../components/Banner';
import Info from '../../components/Info';
import { FiLoader } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';
import { formatDate } from '../../shared/dates';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <>
        <main className={styles.loading}>
          <FiLoader />
          <span>Carregando...</span>
        </main>
      </>
    );
  }

  const averageWordsPerMinute = Number(
    process.env.AVERAGE_WORDS_PER_MINUTE ?? 200
  );

  const postWords = post.data.content.reduce(
    (acc, c) =>
      acc +
      c.heading.split(' ').length +
      RichText.asText(c.body).split(' ').length,
    0
  );

  const timeReading = Math.ceil(postWords / averageWordsPerMinute);

  return (
    <>
      <Head>
        <title>spacetraveling : {post.data.title}</title>
      </Head>
      <Banner src={post.data.banner.url} alt="post banner" />
      <main className={commonStyles.container}>
        <div className={styles.postContainer}>
          <p className={styles.postTitle}>{post.data.title}</p>
          <div className={styles.infos}>
            <Info
              image="calendar"
              text={formatDate(post.first_publication_date)}
            />
            <Info image="user" text={post.data.author} />
            <Info image="clock" text={`${timeReading} min`} />
          </div>
          {post.data.content.map(content => (
            <div key={content.heading} className={styles.postContent}>
              <p className={styles.contentHeading}>{content.heading}</p>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.getByType('posts',
    { pageSize: 1 }
  );
  const paths = posts.results.map(p => ({ params: { slug: p.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', slug as string, {});
  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      ...response.data,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 6,
  };
};