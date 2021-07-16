import '../styles/globals.css';
import type { AppProps } from 'next/app';
import MidiAccessProvider from '../components/MidiAccessProvider';
import AnnouncementsProvider from '../components/AnnouncementsProvider';
import { InputModeProvider } from '../utils/useInputMode';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MidiAccessProvider>
      <InputModeProvider>
        <AnnouncementsProvider>
          <Component {...pageProps} />
        </AnnouncementsProvider>
      </InputModeProvider>
    </MidiAccessProvider>
  );
}
export default MyApp;
