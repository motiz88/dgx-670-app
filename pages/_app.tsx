import '../styles/globals.css';
import type { AppProps } from 'next/app';
import MidiAccessProvider from '../components/MidiAccessProvider';
import AnnouncementsProvider from '../components/AnnouncementsProvider';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MidiAccessProvider>
      <AnnouncementsProvider>
        <Component {...pageProps} />
      </AnnouncementsProvider>
    </MidiAccessProvider>
  );
}
export default MyApp;
