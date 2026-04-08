export async function uploadVideoToYouTube(
  accessToken: string,
  file: File,
  title: string,
  description: string
): Promise<string> {
  const metadata = {
    snippet: {
      title: title || 'Untitled Video',
      description: description || '',
      categoryId: '27', // Education
    },
    status: {
      privacyStatus: 'public', // Changed to public as requested
      embeddable: true,
    },
  };

  // YouTube API requires multipart/related, but browser FormData sends multipart/form-data.
  // Therefore, we MUST use the resumable upload protocol.
  const initResponse = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Length': file.size.toString(),
        'X-Upload-Content-Type': file.type,
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!initResponse.ok) {
    let errorMsg = 'Failed to initialize upload';
    try {
      const errorData = await initResponse.json();
      errorMsg = errorData.error?.message || JSON.stringify(errorData);
    } catch (e) {
      errorMsg = await initResponse.text();
    }
    throw new Error(`YouTube API Init Error: ${errorMsg}`);
  }

  const uploadUrl = initResponse.headers.get('Location');
  if (!uploadUrl) {
    throw new Error('Failed to get upload URL from YouTube API (Location header missing)');
  }

  // Step 2: Upload the actual file data
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    let errorMsg = 'Failed to upload video file';
    try {
      const errorData = await uploadResponse.json();
      errorMsg = errorData.error?.message || JSON.stringify(errorData);
    } catch (e) {
      errorMsg = await uploadResponse.text();
    }
    throw new Error(`YouTube API Upload Error: ${errorMsg}`);
  }

  const data = await uploadResponse.json();
  return data.id; // Returns the YouTube video ID
}

export async function getYouTubeChannelInfo(accessToken: string) {
  const response = await fetch(
    'https://youtube.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    let errorMsg = 'Failed to fetch YouTube channel info';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error?.message || JSON.stringify(errorData);
    } catch (e) {
      errorMsg = await response.text();
    }
    throw new Error(`YouTube API Error: ${errorMsg}`);
  }

  const data = await response.json();
  if (data.items && data.items.length > 0) {
    return {
      channelId: data.items[0].id,
      channelTitle: data.items[0].snippet.title,
      channelThumbnail: data.items[0].snippet.thumbnails?.default?.url,
    };
  }
  return null;
}



