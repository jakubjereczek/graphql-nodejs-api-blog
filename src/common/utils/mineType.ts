export function getImageMimeType(fileSignature: string) {
  switch (fileSignature) {
    case 'FFD8FFDB':
    case 'FFD8FFE0':
    case 'FFD8FFE1':
      return 'image/jpeg';
    case '89504E47':
      return 'image/png';
    case '47494638':
      return 'image/gif';
    case '424D':
      return 'image/bmp';
    case '52494646':
      return 'image/webp';
    case '49492A00':
    case '4D4D002A':
      return 'image/tiff';
    default:
      return 'application/octet-stream';
  }
}

function getFileSignature(buffer: Buffer) {
  return buffer.toString('hex', 0, 4).toUpperCase();
}

export function getMimeTypeFromBuffer(buffer: Buffer) {
  const fileSignature = getFileSignature(buffer);
  return getImageMimeType(fileSignature);
}
