import { GetStaticProps } from 'next';

import Link from 'next/link';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';
import { formatDate } from '../utils/dateFormat';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function loadNextPage(link: string | null): Promise<void> {
    if (!link) {
      return;
    }

    await fetch(link)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        const postsResponse = data?.results.map(post => {
          const { title, subtitle, author } = post.data;

          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title,
              subtitle,
              author,
            },
          };
        });

        setPosts(postsResponse);
        setNextPage(data?.next_page);
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  return (
    <>
      <div className={commonStyles.contentContainer}>
        <Header />
        <div className={styles.posts}>
          {posts.map(post => (
            <Link
              className={styles.post}
              key={post.uid}
              href={`/post/${post.uid}`}
            >
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={commonStyles['tag-info-main']}>
                  <div className={commonStyles['tag-info']}>
                    <FiCalendar className="icon" color="#04d361" />
                    <p>{formatDate(post.first_publication_date)}</p>
                  </div>
                  <div className={commonStyles['tag-info']}>
                    <FiUser className="icon" color="#04d361" />
                    <p>{post.data.author}</p>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>

        {nextPage && (
          <div
            className={styles.btnLoad}
            onClick={() => loadNextPage(nextPage)}
          >
            Carregar mais posts
          </div>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});

  const postsResponse = await prismic.getByType('posts', {
    pageSize: 20,
    orderings: {
      field: 'document.first_publication_date',
      direction: 'desc',
    },
  });

  const posts = postsResponse.results.map(post => {
    const { title, subtitle, author } = post.data;

    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title,
        subtitle,
        author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse?.next_page,
        results: posts,
      },
    },
  };
};
