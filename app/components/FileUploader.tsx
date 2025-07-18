import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "../lib/utils";
import { CSSTransition, SwitchTransition } from "react-transition-group";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;

      onFileSelect?.(file);
    },
    [onFileSelect]
  );

  const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      multiple: false,
      accept: { "application/pdf": [".pdf"] },
      maxSize: maxFileSize,
    });

  const file = acceptedFiles[0] || null;
  const fileNodeRef = useRef(null);
  const promptNodeRef = useRef(null);

  return (
    <div className="w-full gradient-border">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {/*
          Add the following CSS to your global stylesheet (e.g., app.css):
          .uploader-fade-enter { opacity: 0; transform: translateY(20px); }
          .uploader-fade-enter-active { opacity: 1; transform: translateY(0); transition: opacity 0.3s, transform 0.3s; }
          .uploader-fade-exit { opacity: 1; transform: translateY(0); }
          .uploader-fade-exit-active { opacity: 0; transform: translateY(-20px); transition: opacity 0.3s, transform 0.3s; }
        */}
        <SwitchTransition>
          <CSSTransition
            key={file ? "file" : "nofile"}
            timeout={300}
            classNames="uploader-fade"
            nodeRef={file ? fileNodeRef : promptNodeRef}
          >
            {file ? (
              <div ref={fileNodeRef} className="space-y-4 cursor-pointer">
                <div
                  className="uploader-selected-file"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src="/images/pdf.png" alt="pdf" className="size-10" />
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-2 cursor-pointer"
                    onClick={(e) => {
                      onFileSelect?.(null);
                    }}
                  >
                    <img
                      src="/icons/cross.svg"
                      alt="remove"
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              </div>
            ) : (
              <div ref={promptNodeRef} className="space-y-4 cursor-pointer">
                <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2 fade-in-out">
                  <img src="/icons/info.svg" alt="upload" className="size-20" />
                </div>
                <p className="text-lg text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-lg text-gray-500">
                  PDF (max {formatSize(maxFileSize)})
                </p>
              </div>
            )}
          </CSSTransition>
        </SwitchTransition>
      </div>
    </div>
  );
};
export default FileUploader;
