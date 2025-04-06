type YouTubeVideoDialogProps = {
  videoSrc: string;
  thumbnailSrc?: string;
};

export default function YouTubeVideoDialog({ videoSrc, thumbnailSrc = '/user' }: YouTubeVideoDialogProps) {
  return (
    <video className="h-full w-full rounded-lg" controls poster={thumbnailSrc}>
      <source src={videoSrc} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
