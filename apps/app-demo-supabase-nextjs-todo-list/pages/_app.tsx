import "@repo/core-ui-shadcn/globals.css";
import type {AppProps} from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Component {...pageProps} />
  )
}
