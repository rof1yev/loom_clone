export default async function VideoDetails({ params }: ParamsWithSearch) {
  const { videoId } = await params;

  return <main className="wrapper page">VIDEO DETAIL PAGE: {videoId}</main>;
}
