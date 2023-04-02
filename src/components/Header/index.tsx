import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return <img className={styles.logo} src="/images/logo.svg" alt="logo" />;
}
