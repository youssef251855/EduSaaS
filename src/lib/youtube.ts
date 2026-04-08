export async function uploadVideoToYouTube(
  accessToken: string,
  file: File,
  title: string,
  description: string
): Promise<string> {
  const metadata = {
    snippet: {
      title,
      description,
      categoryId: '27', // Education
    },
    status: {
      privacyStatus: 'public',
      embeddable: true,
    },
  };

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', file);

  const response = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to upload video to YouTube');
  }

  const data = await response.json();
  return data.id; // Returns the YouTube video ID
}
