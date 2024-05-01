import { IDriveFile } from '../../../models/drive-file';
import getDriveFileUrl from '../../../misc/get-drive-file-url';

export default (file: IDriveFile) => ({
	type: 'Document',
	mediaType: file.contentType,
	sensitive: !!file.metadata?.isSensitive,
	url: getDriveFileUrl(file)
});
