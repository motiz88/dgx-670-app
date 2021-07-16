import { useCallback, useContext, useEffect } from 'react';
import AnnouncementsContext, {
  Announcement,
} from '../components/AnnouncementsContext';
import useFocused from './useFocused';
import usePrevious from './usePrevious';

export default function useAnnounce(
  // If specified, the element to announce on focus
  element?: null | HTMLElement,
  // If specified, the default announcement(s)
  defaultAnnouncements?: undefined | Announcement | Announcement[]
) {
  const api = useContext(AnnouncementsContext);

  const isFocused = useFocused(element ?? null);
  const wasFocused = usePrevious(isFocused);

  const announceNow = useCallback(
    (overrideAnnouncements?: undefined | Announcement | Announcement[]) => {
      let announcements;
      if (overrideAnnouncements) {
        announcements = Array.isArray(overrideAnnouncements)
          ? overrideAnnouncements
          : [overrideAnnouncements];
      } else if (defaultAnnouncements) {
        announcements = Array.isArray(defaultAnnouncements)
          ? defaultAnnouncements
          : [defaultAnnouncements];
      }
      if (announcements) {
        api.stop();
        for (const announcement of announcements) {
          api.announce(announcement);
        }
      }
    },
    [defaultAnnouncements, api]
  );

  useEffect(() => {
    if (!wasFocused && isFocused) {
      announceNow();
    }
  }, [announceNow, isFocused, wasFocused]);

  return { announce: announceNow };
}
