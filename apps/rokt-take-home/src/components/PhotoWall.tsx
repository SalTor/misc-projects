import { useState, useEffect } from "react";
import Image from "next/image";
import { useMutation, useInfiniteQuery } from "react-query";
import type { Photo } from "pexels";

const PhotoWall: React.FC<{ photos: Photo[] }> = (props) => {
  return (
    <section className="max-w-[1000px] mx-auto mt-5">
      <div
        className={`grid gap-5 ${
          props.photos.length === 1 ? "grid-cols-1" : "grid-cols-5"
        }`}
      >
        {props.photos.map((photo, index) => {
          if (!photo) {
            return (
              <div key={index} className="h-[250px] w-full bg-slate-100" />
            );
          }
          const { height, width } = photo;
          const ratio = height / width;
          const size = 250;
          return (
            <Image
              key={photo.id}
              height={size}
              width={size * ratio}
              src={photo.src.medium}
              alt={photo.alt}
              className="bg-slate-100"
            />
          );
        })}
      </div>
    </section>
  );
};

export default PhotoWall;
