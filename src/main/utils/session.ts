import { app, ipcMain, Session, WebContents } from 'electron';
import { readFile, rename, writeFile } from 'fs/promises';
import { customAlphabet } from 'nanoid';
import { join, resolve } from 'path';
import { APPLICATION_NAME, APPLICATION_PROTOCOL } from '../../constants';
import { DIALOG_DOWNLOADS_NAME } from '../../constants/dialog';
import { IPCChannel } from '../../constants/ipc';
import { NativeDownloadData } from '../../interfaces/user';
import { getBuildPath } from '../../utils/path';
import { IUser } from '../interfaces/user';
import { Main } from '../main';
import { NormalUser } from '../user/normal';
import { parseCrx } from './extension';
import { existsPath, extractZip } from './file';

export const setUserAgent = (session: Session) => session.setUserAgent(
    session.getUserAgent()
        .replace(/\sElectron\/\S+/, '')
        .replace(app.getName(), APPLICATION_NAME)
);

export const setWebRequest = (session: Session, user: IUser) => {
    session.webRequest.onBeforeSendHeaders((details, callback) => {
        if (!user.settings.config.privacy_security.send_dnt_request)
            return callback(details);

        details.requestHeaders.DNT = '1';
        return callback({ ...details, requestHeaders: details.requestHeaders });
    });
};

export const registerProtocols = (session: Session) => {
    session.protocol.registerFileProtocol(
        APPLICATION_PROTOCOL,
        (request, callback) => {
            const { hostname, pathname } = new URL(request.url);

            console.log(pathname);
            if (pathname === '/' || !pathname.match(/(.*)\.([A-z0-9])\w+/g)) {
                console.log(getBuildPath('pages', `${hostname}.html`));
                callback({
                    path: getBuildPath('pages', `${hostname}.html`)
                });
            } else {
                console.log(getBuildPath('pages', pathname.substring(1)));
                callback({
                    path: getBuildPath('pages', pathname.substring(1))
                });
            }
        }
    );
};

export const registerDownloadListener = (session: Session, user: IUser) => {
    const downloads = user.downloads;

    const sendUpdatedData = (webContents: WebContents, data: NativeDownloadData) => {
        const dynamicDialog = Main.dialogManager.getDynamic(DIALOG_DOWNLOADS_NAME);
        if (dynamicDialog) {
            dynamicDialog.webContents.send(IPCChannel.Downloads.UPDATED(data._id), data);
        } else {
            const window = Main.windowManager.getWindows(user).find((appWindow) => appWindow.viewManager.get(webContents.id));
            if (!window) return;
            window.webContents.send(IPCChannel.Downloads.UPDATED(data._id), data);
        }
    };

    session.on('will-download', async (e, item, webContents) => {
        const isExtension = item.getMimeType() === 'application/x-chrome-extension';
        if (user instanceof NormalUser && isExtension)
            item.setSavePath(join(user.extensions.path, item.getFilename()));

        const data = await downloads.add({
            name: item.getFilename(),
            path: item.getSavePath(),
            url: item.getURL(),
            mimeType: item.getMimeType(),
            totalBytes: item.getTotalBytes(),
            receivedBytes: item.getReceivedBytes(),
            isPaused: item.isPaused(),
            canResume: item.canResume(),
            state: item.getState()
        });

        item.on('updated', async (event, state) => {
            const downloadData = await downloads.update(data._id, {
                path: item.getSavePath(),
                totalBytes: item.getTotalBytes(),
                receivedBytes: item.getReceivedBytes(),
                isPaused: item.isPaused(),
                canResume: item.canResume(),
                state
            });

            sendUpdatedData(webContents, { ...downloadData, icon: await app.getFileIcon(item.getSavePath()) });
        });
        item.once('done', async (event, state) => {
            const downloadData = await downloads.update(data._id, {
                path: item.getSavePath(),
                totalBytes: item.getTotalBytes(),
                receivedBytes: item.getReceivedBytes(),
                isPaused: item.isPaused(),
                canResume: item.canResume(),
                state
            });

            sendUpdatedData(webContents, { ...downloadData, icon: await app.getFileIcon(item.getSavePath()) });

            if (state === 'completed' && user instanceof NormalUser && isExtension) {
                const crxBuf = await readFile(item.getSavePath());
                const crxInfo = parseCrx(crxBuf);

                if (!crxInfo.id)
                    crxInfo.id = customAlphabet('abcdefghijklmnopqrstuvwxyz', 32)();

                const extensionsPath = user.extensions.path;
                const path = resolve(extensionsPath, crxInfo.id);
                const manifestPath = resolve(path, 'manifest.json');

                if (await existsPath(path)) {
                    console.log('Extension is already installed');
                    return;
                }

                await extractZip(crxInfo.zip, path);
                await rename(item.getSavePath(), join(extensionsPath, `${crxInfo.id}.crx`));

                const extension = await user.extensions.load(crxInfo.id);

                if (crxInfo.publicKey) {
                    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));

                    manifest.key = crxInfo.publicKey.toString('base64');

                    await writeFile(
                        manifestPath,
                        JSON.stringify(manifest, null, 2)
                    );
                }
            }
        });

        ipcMain.handle(IPCChannel.Downloads.PAUSE(data._id), () => {
            item.pause();
        });
        ipcMain.handle(IPCChannel.Downloads.RESUME(data._id), () => {
            item.resume();
        });
        ipcMain.handle(IPCChannel.Downloads.CANCEL(data._id), () => {
            item.cancel();
        });
    });
};
