import { GetStaticPaths, GetStaticProps } from 'next';

import { useEffect, useState } from 'react';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { formatDate } from '../../utils/dateFormat';

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
  const [readTime, setReadTime] = useState<number | null>(null);
  const [contents, setContents] = useState<
    {
      heading: string;
      body: string;
    }[]
  >([]);
  const { first_publication_date, data } = post || {};

  useEffect(() => {
    const totalWords = data
      ? data?.content?.reduce((acc, { heading, body }) => {
          setContents([
            ...contents,
            {
              heading,
              body: RichText.asHtml(body),
            },
          ]);

          acc +=
            heading.split(' ').length + RichText.asText(body).split(' ').length;

          return acc;
        }, 0)
      : null;

    // eslint-disable-next-line no-unused-expressions
    totalWords ? setReadTime(Math.ceil(totalWords / 200)) : setReadTime(null);
  }, [post]);

  return (
    <>
      <div className={commonStyles.contentContainer}>
        <Header />
      </div>

      {post === undefined ? (
        <div className={commonStyles.contentContainer}>Carregando...</div>
      ) : (
        <div>
          <img
            src={post.data.banner.url}
            className={styles.banner}
            alt="banner"
          />
          <div className={commonStyles.contentContainer}>
            <div className={styles.title}>{data.title}</div>
            <div className={commonStyles['tag-info-main']}>
              <div className={commonStyles['tag-info']}>
                <FiCalendar className="icon" color="#04d361" />
                <p>{formatDate(post.first_publication_date)}</p>
              </div>
              <div className={commonStyles['tag-info']}>
                <FiUser className="icon" color="#04d361" />
                <p>{post.data.author}</p>
              </div>
              {readTime && (
                <div className={commonStyles['tag-info']}>
                  <FiClock className="icon" color="#04d361" />
                  <p>{readTime} min</p>
                </div>
              )}
            </div>
            <div>
              {contents.map((content, index) => {
                return (
                  <div className={styles.content}>
                    <div className={styles.heading}>{content.heading}</div>
                    <div
                      className={styles.body}
                      dangerouslySetInnerHTML={{ __html: content.body }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', slug);

  return {
    props: {
      post: {
        first_publication_date: response.first_publication_date,
        data: {
          ...response.data,
        },
      },
    },
  };
};
