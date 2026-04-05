"use client";

import FileInput from "@/components/file-input";
import FormField from "@/components/form-field";
import { MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from "@/constants";
import { useFileInput } from "@/hooks/use-file-input";
import {
  getThumbnailUploadUrl,
  getVideoUploadUrl,
  saveVideoDetails,
} from "@/lib/actions/video";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const uploadFileToBunny = async (
  file: File,
  uploadUrl: string,
  accessKey: string,
): Promise<void> => {
  return fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type, AccessKey: accessKey },
    body: file,
  }).then((response) => {
    if (!response.ok) throw new Error("Failed to upload file to Bunny");
  });
};

export default function UploadPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "public",
  });
  const video = useFileInput(MAX_VIDEO_SIZE);
  const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  useEffect(() => {
    if (video.duration !== null) setVideoDuration(video.duration);
  }, [video.duration]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!video.file || !thumbnail.file) {
        setError("Please upload both a video and thumbnail file.");
        return;
      }
      if (!formData.title || !formData.description) {
        setError("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
      }

      const {
        videoId,
        uploadUrl: videoUploadUrl,
        accessKey: videoAccessKey,
      } = await getVideoUploadUrl();

      if (!videoUploadUrl || !videoAccessKey) {
        setError("Failed to get video upload credentials.");
        return;
      }

      await uploadFileToBunny(video.file, videoUploadUrl, videoAccessKey);

      const {
        uploadUrl: thumbnailUploadUrl,
        cdnUrl: thumbnailCDNUrl,
        accessKey: thumbnailAccessKey,
      } = await getThumbnailUploadUrl(videoId as string);

      if (!thumbnailUploadUrl || !thumbnailAccessKey || !thumbnailCDNUrl) {
        setError("Failed to get thumbnail upload credentials.");
        return;
      }

      await uploadFileToBunny(
        thumbnail.file,
        thumbnailUploadUrl,
        thumbnailAccessKey,
      );

      await saveVideoDetails({
        videoId,
        thumbnailUrl: thumbnailCDNUrl,
        ...formData,
        duration: videoDuration,
        tags: [""],
      });

      return router.push(`/video/${videoId}`);
    } catch (e) {
      console.error("Upload error:", e);
      setError("An error occurred during upload. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wrapper-md upload-page">
      <h1>Upload a video</h1>
      {error && <div className="error-field">{error}</div>}
      <form
        onSubmit={handleSubmit}
        className="rounded-20 shadow-10 gap-6 w-full flex flex-col px-5 py-7.5"
      >
        <FormField
          id="title"
          label="Title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter a clear and concise title for your video"
        />
        <FormField
          id="description"
          label="Description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter a description for your video"
          as="textarea"
        />

        <FileInput
          id="video"
          label="Video"
          accept="video/*"
          file={video.file}
          previewUrl={video.previewUrl}
          inputRef={video.inputRef}
          onChange={video.handleFileChange}
          onReset={video.resetFile}
          type="video"
        />
        <FileInput
          id="thumbnail"
          label="Thumbnail"
          accept="image/*"
          file={thumbnail.file}
          previewUrl={thumbnail.previewUrl}
          inputRef={thumbnail.inputRef}
          onChange={thumbnail.handleFileChange}
          onReset={thumbnail.resetFile}
          type="image"
        />
        <FormField
          id="visibility"
          label="Visibility"
          value={formData.visibility}
          onChange={handleChange}
          as="select"
          options={[
            { value: "public", label: "Public" },
            { value: "private", label: "Private" },
          ]}
        />
        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  );
}
