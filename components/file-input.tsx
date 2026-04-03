import Image from "next/image";

const FileInput = ({
  id,
  label,
  accept,
  file,
  previewUrl,
  inputRef,
  onChange,
  onReset,
  type,
}: FileInputProps) => {
  return (
    <div className="file-input">
      <label htmlFor={id}>{label}</label>

      <input
        type="file"
        accept={accept}
        ref={inputRef}
        onChange={onChange}
        hidden
      />

      {!previewUrl ? (
        <figure onClick={() => inputRef.current?.click()}>
          <Image
            src="/assets/icons/upload.svg"
            alt="Upload icon"
            width={24}
            height={24}
          />
          <p>Click to upload your {id}</p>
        </figure>
      ) : (
        <div>
          {type === "video" ? (
            <video src={previewUrl} controls />
          ) : (
            <Image src={previewUrl} alt="Preview image" fill />
          )}

          <button type="button" onClick={onReset}>
            <Image
              src="/assets/icons/close.svg"
              alt="Close"
              width={16}
              height={16}
            />
          </button>
          <p>{file?.name}</p>
        </div>
      )}
    </div>
  );
};

export default FileInput;
