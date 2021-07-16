import { useCallback, useContext, useEffect } from 'react';
import AnnouncementsContext, {
  Announcement,
} from '../components/AnnouncementsContext';
import useFocused from './useFocused';
import usePrevious from './usePrevious';

export default function useAnnounce(
  element: null | HTMLElement,
  announcementOrAnnouncements: Announcement | Announcement[]
) {
  const api = useContext(AnnouncementsContext);

  const isFocused = useFocused(element);
  const wasFocused = usePrevious(isFocused);

  const announceNow = useCallback(() => {
    const announcements: Announcement[] = Array.isArray(
      announcementOrAnnouncements
    )
      ? announcementOrAnnouncements
      : [announcementOrAnnouncements];
    api.stop();
    for (const announcement of announcements) {
      api.announce(announcement);
    }
  }, [announcementOrAnnouncements, api]);

  useEffect(() => {
    if (!wasFocused && isFocused) {
      announceNow();
    }
  }, [announceNow, isFocused, wasFocused]);

  return { announce: announceNow };
}
