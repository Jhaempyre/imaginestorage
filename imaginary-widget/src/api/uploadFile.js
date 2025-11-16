export async function uploadFile(apiUrl, token, file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('token', token);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress?.(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const response = JSON.parse(xhr.responseText);
          // Transform backend response to widget format
          const transformedResponse = {
            file: {
              name: response.data?.fileName || response.fileName,
              size: response.data?.size || response.size,
              type: response.data?.mimeType || response.mimeType
            },
            url: response.data?.fileUrl || response.fileUrl,
            fileId: response.data?.fileId || response.fileId
          };
          resolve(transformedResponse);
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.open('POST', `${apiUrl}/upload`);
    xhr.send(formData);
  });
}