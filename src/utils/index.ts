export const APPLICATION_NAME = 'Flast';
export const APPLICATION_PROTOCOL = 'flast';

export const APPLICATION_WEB_BOOKMARKS = 'bookmarks';
export const APPLICATION_WEB_HISTORY = 'history';
export const APPLICATION_WEB_DOWNLOADS = 'downloads';
export const APPLICATION_WEB_SETTINGS = 'settings';
export const APPLICATION_WEB_EXTENSIONS = 'extensions';

export const WINDOW_EXTENDED_TAB_CONTAINER_WIDTH = 250;
export const WINDOW_EXTENDED_SIDEBAR_WIDTH = 350;

export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]>; } : T;
