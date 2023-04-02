import { GetStaticPaths, GetStaticProps } from 'next';

import { useEffect, useState } from 'react';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
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

    totalWords ? setReadTime(Math.ceil(totalWords / 200)) : setReadTime(null);
  }, [post]);

  return (
    <>
      <Header />
      {readTime && <div>{readTime} min</div>}

      {post === undefined ? (
        <div>Carregando...</div>
      ) : (
        <div>
          <div>title: {data.title}</div>
          <div>data: {formatDate(first_publication_date)}</div>
          <div>
            {contents.map((content, index) => {
              return (
                <div key={index}>
                  <div>head: {content.heading}</div>
                  <div dangerouslySetInnerHTML={{ __html: content.body }} />
                </div>
              );
            })}
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
